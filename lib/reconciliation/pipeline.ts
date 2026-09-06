import { runId } from "../ids";
import { applyPolicies, crossPeriodNeedsPolicy } from "../policies/apply";
import type {
  ExceptionRecord,
  HumanDecision,
  LedgerEvent,
  MatchEdge,
  ReconciliationPolicy,
  ReconciliationRun,
} from "../types";
import { AUTO_MIN, confidenceBand } from "./confidence";
import { applyExactReferences } from "./exact";
import { generateExceptions } from "./exceptions";
import { validateDeposit, validatePayout } from "./invariants";
import { applyStructuredMatching } from "./structured";

export interface PipelineInput {
  events: LedgerEvent[];
  policies: ReconciliationPolicy[];
  decisions?: HumanDecision[];
}

export interface PipelineResult {
  run: ReconciliationRun;
  edges: MatchEdge[];
  exceptions: ExceptionRecord[];
}

export function runReconciliation(input: PipelineInput): PipelineResult {
  const exact = applyExactReferences(input.events);
  const withPolicies = applyPolicies(input.events, exact, input.policies);
  const withStructured = applyPolicies(input.events, applyStructuredMatching(input.events, withPolicies), input.policies);
  const withDecisions = applyDecisionOverrides(withStructured, input.decisions ?? []);
  const resolved = assignStatuses(input.events, withDecisions);
  const exceptions = applyDecisionStatuses(generateExceptions(input.events, resolved), input.decisions ?? []);

  const ranAt = new Date().toISOString();
  return {
    run: {
      id: runId(ranAt),
      ranAt,
      eventCount: input.events.length,
      edgeCount: resolved.length,
      exceptionCount: exceptions.filter((item) => item.status === "open" || item.status === "unresolved").length,
      autoCount: resolved.filter((edge) => edge.status === "auto" || edge.status === "approved").length,
      reviewCount: exceptions.filter((item) => item.status === "open").length,
    },
    edges: resolved,
    exceptions,
  };
}

function assignStatuses(events: LedgerEvent[], edges: MatchEdge[]): MatchEdge[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  const payouts = events.filter((event) => event.kind === "payout");
  const payoutBalance = new Map(payouts.map((payout) => [payout.id, validatePayout(payout, events, edges).balanced]));

  return edges.map((edge) => {
    if (edge.status === "approved" || edge.status === "rejected") return edge;
    const from = byId.get(edge.fromEventId);
    const to = byId.get(edge.toEventId);
    if (!from || !to) return { ...edge, status: "review" };

    const band = confidenceBand(edge.confidence);
    if (band === "unresolved") return { ...edge, status: "review" };
    if (band === "review") return { ...edge, status: "review" };

    if (crossPeriodNeedsPolicy(from, to, edge)) {
      return { ...edge, status: "review" };
    }

    if (edge.relationship === "settles_into") {
      const payoutId = to.kind === "payout" ? to.id : from.id;
      if (!payoutBalance.get(payoutId)) return { ...edge, status: "review" };
    }

    if (edge.relationship === "deposited_as") {
      const payout = from.kind === "payout" ? from : to;
      const deposit = from.kind === "bank_deposit" ? from : to;
      if (!validateDeposit(deposit, payout).balanced || !payoutBalance.get(payout.id)) {
        return { ...edge, status: "review" };
      }
    }

    if (edge.confidence >= AUTO_MIN) return { ...edge, status: "auto" };
    return { ...edge, status: "review" };
  });
}

function applyDecisionOverrides(edges: MatchEdge[], decisions: HumanDecision[]): MatchEdge[] {
  const byEdge = new Map(decisions.filter((decision) => decision.edgeId).map((decision) => [decision.edgeId!, decision]));
  return edges.map((edge) => {
    const decision = byEdge.get(edge.id);
    if (!decision) return edge;
    if (decision.action === "approve") return { ...edge, status: "approved", policyId: decision.policyId ?? edge.policyId };
    if (decision.action === "reject") return { ...edge, status: "rejected" };
    return edge;
  });
}

function applyDecisionStatuses(exceptions: ExceptionRecord[], decisions: HumanDecision[]): ExceptionRecord[] {
  const byException = new Map(decisions.map((decision) => [decision.exceptionId, decision]));
  return exceptions.map((exception) => {
    const decision = byException.get(exception.id);
    if (!decision) return exception;
    if (decision.action === "approve") return { ...exception, status: "approved" };
    if (decision.action === "reject") return { ...exception, status: "rejected" };
    return { ...exception, status: "unresolved" };
  });
}
