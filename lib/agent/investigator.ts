import type { AgentRecommendation, Evidence, ExceptionRecord, LedgerEvent, MatchEdge, ReconciliationPolicy } from "../types";
import { formatMinor } from "../money";
import {
  calculateChain,
  findEvents,
  getCandidateMatches,
  getEvent,
  getPolicies,
  type AgentContext,
} from "./tools";

export function investigateException(context: AgentContext): AgentRecommendation {
  const evidence: Evidence[] = [];
  const related = context.exception.relatedEventIds
    .map((id) => getEvent(context, id))
    .filter((event): event is LedgerEvent => Boolean(event));

  for (const event of related) {
    evidence.push({
      kind: "tool",
      label: "get_event",
      detail: `${event.kind} ${event.id} ${formatMinor(event.amount, event.currency)} ${event.currency}`,
      eventId: event.id,
    });
  }

  const candidates = getCandidateMatches(context);
  evidence.push({
    kind: "tool",
    label: "get_candidate_matches",
    detail: `${candidates.length} candidate relationship(s)`,
  });

  const policies = getPolicies(context);
  evidence.push({
    kind: "tool",
    label: "get_policies",
    detail: `${policies.length} approved policies`,
  });

  if (context.exception.type === "unbalanced_payout") {
    const payout = related.find((event) => event.kind === "payout");
    if (payout) {
      const chain = calculateChain(context, payout.id);
      if (chain) {
        evidence.push({
          kind: "tool",
          label: "validate_payout",
          detail: `balanced=${chain.balanced} residual=${chain.residualMinor}`,
        });
      }
    }
    return {
      recommendation: "Payout invariant failed. Do not mark reconciled. Human must review the residual.",
      confidence: 1,
      evidence,
      requiresHumanReview: true,
    };
  }

  if (context.exception.type === "cross_period_adjustment") {
    const child = related.find((event) => event.kind === "refund" || event.kind === "dispute" || event.kind === "sale");
    if (child?.parentRef) {
      const originals = findEvents(context, { externalRef: child.parentRef, kind: "sale" });
      for (const original of originals) {
        evidence.push({
          kind: "reference",
          label: "find_events",
          detail: `Found original sale ${original.externalRef ?? original.id} in ${original.occurredAt.slice(0, 7)}`,
          eventId: original.id,
        });
      }
    }
    const best = pickBest(candidates);
    return {
      recommendation:
        child?.kind === "refund"
          ? "Cross-period refund belongs to the original sale. Approve to create a refund policy."
          : "Related events stay connected across periods. Approve only if the references hold.",
      confidence: best?.confidence ?? 0.8,
      evidence,
      requiresHumanReview: true,
      proposedEdgeId: best?.id,
    };
  }

  if (context.exception.type === "ambiguous_match") {
    const best = pickBest(candidates);
    return {
      recommendation: best
        ? `Ranked ${candidates.length} candidates. Top match is ${best.toEventId}. Human must choose.`
        : "Multiple sales share the same amount. Human must choose. Do not invent a parent.",
      confidence: Math.min(best?.confidence ?? 0.7, 0.74),
      evidence,
      requiresHumanReview: true,
      proposedEdgeId: best?.id,
    };
  }

  if (context.exception.type === "possible_duplicate") {
    return {
      recommendation: "Keep both events. Possible duplicate — do not drop a row.",
      confidence: 0.9,
      evidence,
      requiresHumanReview: true,
    };
  }

  if (context.exception.type === "unmatched_bank_deposit") {
    return {
      recommendation: "No payout explains this deposit. Leave unmatched.",
      confidence: 0.4,
      evidence,
      requiresHumanReview: true,
    };
  }

  if (context.exception.type === "unexpected_fx") {
    return {
      recommendation: "FX conversion is present. Use calculate_chain for the payout. Do not let the model compute the rate.",
      confidence: 0.8,
      evidence,
      requiresHumanReview: true,
      proposedEdgeId: pickBest(candidates)?.id,
    };
  }

  return {
    recommendation: context.exception.recommendation,
    confidence: context.exception.confidence,
    evidence,
    requiresHumanReview: true,
    proposedEdgeId: pickBest(candidates)?.id,
  };
}

export function attachAgentRecommendations(
  exceptions: ExceptionRecord[],
  events: LedgerEvent[],
  edges: MatchEdge[],
  policies: ReconciliationPolicy[],
): ExceptionRecord[] {
  return exceptions.map((exception) => {
    if (exception.status !== "open") return exception;
    const recommendation = investigateException({ events, edges, policies, exception });
    return {
      ...exception,
      agentRecommendation: recommendation,
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence,
      evidence: [...exception.evidence, ...recommendation.evidence],
    };
  });
}

function pickBest(candidates: MatchEdge[]): MatchEdge | undefined {
  return [...candidates].sort((a, b) => b.confidence - a.confidence)[0];
}
