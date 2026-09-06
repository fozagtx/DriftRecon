import { exceptionId } from "../ids";
import type { ExceptionRecord, LedgerEvent, MatchEdge } from "../types";
import { findDuplicateGroups } from "./duplicates";
import { validateDeposit, validatePayout } from "./invariants";

export function generateExceptions(events: LedgerEvent[], edges: MatchEdge[]): ExceptionRecord[] {
  const exceptions: ExceptionRecord[] = [];
  const byId = new Map(events.map((event) => [event.id, event]));
  const payouts = events.filter((event) => event.kind === "payout");
  const deposits = events.filter((event) => event.kind === "bank_deposit");

  for (const payout of payouts) {
    const validation = validatePayout(payout, events, edges);
    if (!validation.balanced) {
      exceptions.push({
        id: exceptionId("unbalanced_payout", [payout.id]),
        type: "unbalanced_payout",
        summary: `Payout ${payout.externalRef ?? payout.id} does not balance`,
        relatedEventIds: [payout.id, ...events.filter((event) => event.payoutRef === payout.externalRef).map((event) => event.id)],
        candidateEdgeIds: edges.filter((edge) => edge.toEventId === payout.id || edge.fromEventId === payout.id).map((edge) => edge.id),
        recommendation: "Keep unresolved until the financial chain balances. Do not auto-reconcile.",
        confidence: 1,
        evidence: [
          {
            kind: "invariant",
            label: "Payout invariant",
            detail: `expected ${validation.expectedMinor} actual ${validation.actualMinor} residual ${validation.residualMinor}`,
          },
        ],
        status: "open",
        validation,
      });
    }
  }

  for (const deposit of deposits) {
    const depositEdges = edges.filter((edge) => edge.relationship === "deposited_as" && edge.toEventId === deposit.id && edge.status !== "rejected");
    if (depositEdges.length === 0) {
      exceptions.push({
        id: exceptionId("unmatched_bank_deposit", [deposit.id]),
        type: "unmatched_bank_deposit",
        summary: `Bank deposit ${deposit.externalRef ?? deposit.id} has no explained payout`,
        relatedEventIds: [deposit.id],
        candidateEdgeIds: [],
        recommendation: "Leave unmatched until a payout explains the deposit.",
        confidence: 0.4,
        evidence: [{ kind: "event", label: "Deposit", detail: deposit.description ?? deposit.id, eventId: deposit.id }],
        status: "open",
        validation: validateDeposit(deposit, undefined),
      });
    }
  }

  for (const event of events) {
    if (event.kind === "sale" && !event.externalRef && !event.parentRef && !event.payoutRef) {
      exceptions.push({
        id: exceptionId("missing_reference", [event.id]),
        type: "missing_reference",
        summary: `Sale ${event.id} is missing expected references`,
        relatedEventIds: [event.id],
        candidateEdgeIds: [],
        recommendation: "Request human review. Do not invent a reference.",
        confidence: 0.3,
        evidence: [{ kind: "reference", label: "Missing refs", detail: "externalRef, parentRef, and payoutRef are empty", eventId: event.id }],
        status: "open",
      });
    }
  }

  const refundsAndDisputes = events.filter((event) => event.kind === "refund" || event.kind === "dispute");
  for (const child of refundsAndDisputes) {
    const candidates = edges.filter(
      (edge) => edge.fromEventId === child.id && (edge.relationship === "refunds" || edge.relationship === "disputes") && edge.status !== "rejected",
    );
    if (!child.parentRef && candidates.length === 0) {
      exceptions.push({
        id: exceptionId("missing_reference", [child.id]),
        type: "missing_reference",
        summary: `${child.kind} ${child.id} has no parent reference`,
        relatedEventIds: [child.id],
        candidateEdgeIds: [],
        recommendation: "Investigate candidate sales. Do not invent a parent.",
        confidence: 0.35,
        evidence: [{ kind: "reference", label: "Missing parent", detail: "parentRef empty", eventId: child.id }],
        status: "open",
      });
    }
    if (candidates.length > 1 && !child.parentRef) {
      exceptions.push({
        id: exceptionId("ambiguous_match", [child.id, ...candidates.map((edge) => edge.toEventId)]),
        type: "ambiguous_match",
        summary: `${child.kind} ${child.id} has multiple plausible ${child.kind === "refund" ? "sales" : "sales"}`,
        relatedEventIds: [child.id, ...candidates.map((edge) => edge.toEventId)],
        candidateEdgeIds: candidates.map((edge) => edge.id),
        recommendation: "Rank candidates and request human review.",
        confidence: Math.max(...candidates.map((edge) => edge.confidence)),
        evidence: candidates.map((edge) => ({
          kind: "event" as const,
          label: "Candidate",
          detail: `${edge.toEventId} confidence ${edge.confidence}`,
          eventId: edge.toEventId,
        })),
        status: "open",
      });
    }
    if (candidates.length === 1 && candidates[0].crossPeriod && !candidates[0].policyId) {
      const parent = byId.get(candidates[0].toEventId);
      exceptions.push({
        id: exceptionId("cross_period_adjustment", [child.id, candidates[0].toEventId]),
        type: "cross_period_adjustment",
        summary: `${child.kind} ${child.id} connects to a different accounting period`,
        relatedEventIds: [child.id, candidates[0].toEventId],
        candidateEdgeIds: [candidates[0].id],
        recommendation: parent
          ? `Attach ${child.kind} to original ${parent.kind} ${parent.externalRef ?? parent.id} after human approval.`
          : "Review the cross-period relationship.",
        confidence: candidates[0].confidence,
        evidence: [
          { kind: "reference", label: "Parent ref", detail: child.parentRef ?? "none", eventId: child.id },
          { kind: "event", label: "Related event", detail: candidates[0].toEventId, eventId: candidates[0].toEventId },
        ],
        status: "open",
      });
    }
  }

  for (const edge of edges) {
    if (edge.relationship === "settles_into" && edge.crossPeriod && !edge.policyId && byId.get(edge.fromEventId)?.kind === "sale") {
      exceptions.push({
        id: exceptionId("cross_period_adjustment", [edge.fromEventId, edge.toEventId]),
        type: "cross_period_adjustment",
        summary: `Event ${edge.fromEventId} settles in a later period`,
        relatedEventIds: [edge.fromEventId, edge.toEventId],
        candidateEdgeIds: [edge.id],
        recommendation: "Keep the economic relationship. Do not auto-resolve until a policy exists.",
        confidence: edge.confidence,
        evidence: [{ kind: "event", label: "Cross-period settlement", detail: edge.id }],
        status: "open",
      });
    }
    if (edge.relationship === "converts_into") {
      const from = byId.get(edge.fromEventId);
      const to = byId.get(edge.toEventId);
      if (from && to && from.currency !== to.currency) {
        exceptions.push({
          id: exceptionId("unexpected_fx", [from.id, to.id]),
          type: "unexpected_fx",
          summary: `FX conversion ${from.currency} → ${to.currency} requires investigation`,
          relatedEventIds: [from.id, to.id],
          candidateEdgeIds: [edge.id],
          recommendation: "Inspect the FX event and payout. Arithmetic stays in code.",
          confidence: edge.confidence,
          evidence: [
            { kind: "event", label: "Source", detail: `${from.amount} ${from.currency}`, eventId: from.id },
            { kind: "event", label: "Converted", detail: `${to.amount} ${to.currency}`, eventId: to.id },
          ],
          status: "open",
        });
      }
    }
  }

  for (const group of findDuplicateGroups(events)) {
    exceptions.push({
      id: exceptionId("possible_duplicate", group.map((event) => event.id)),
      type: "possible_duplicate",
      summary: `Possible duplicate ${group[0].kind} ${group[0].externalRef}`,
      relatedEventIds: group.map((event) => event.id),
      candidateEdgeIds: [],
      recommendation: "Keep both rows visible. Do not drop either event.",
      confidence: 0.9,
      evidence: group.map((event) => ({
        kind: "event" as const,
        label: "Duplicate candidate",
        detail: event.id,
        eventId: event.id,
      })),
      status: "open",
    });
  }

  return dedupeExceptions(exceptions);
}

function dedupeExceptions(exceptions: ExceptionRecord[]): ExceptionRecord[] {
  const map = new Map<string, ExceptionRecord>();
  for (const exception of exceptions) map.set(exception.id, exception);
  return [...map.values()];
}
