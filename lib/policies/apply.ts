import type { LedgerEvent, MatchEdge, ReconciliationPolicy } from "../types";
import { isCrossPeriod } from "../period";

export function policyMatches(policy: ReconciliationPolicy, from: LedgerEvent, to: LedgerEvent, edge: MatchEdge): boolean {
  if (from.source !== policy.source) return false;
  if (from.kind !== policy.eventKind) return false;
  if (edge.relationship !== policy.relationship) return false;

  return policy.conditions.every((condition) => {
    switch (condition.type) {
      case "exact_parent_ref":
        return Boolean(from.parentRef && (from.parentRef === to.externalRef || from.parentRef === to.id));
      case "exact_payout_ref":
        return Boolean(from.payoutRef && (from.payoutRef === to.externalRef || from.payoutRef === to.id));
      case "same_currency":
        return from.currency === to.currency;
      case "cross_period_allowed":
        return true;
      case "same_source":
        return from.source === to.source || to.source === "bank";
      default:
        return false;
    }
  });
}

export function applyPolicies(events: LedgerEvent[], edges: MatchEdge[], policies: ReconciliationPolicy[]): MatchEdge[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  return edges.map((edge) => {
    const from = byId.get(edge.fromEventId);
    const to = byId.get(edge.toEventId);
    if (!from || !to) return edge;
    const policy = policies.find((item) => policyMatches(item, from, to, edge));
    if (!policy) return edge;
    const reason = `Applied policy ${policy.id}`;
    return {
      ...edge,
      policyId: policy.id,
      reasons: edge.reasons.includes(reason) ? edge.reasons : [...edge.reasons, reason],
      confidence: Math.max(edge.confidence, 0.98),
    };
  });
}

export function crossPeriodNeedsPolicy(from: LedgerEvent, to: LedgerEvent, edge: MatchEdge): boolean {
  return isCrossPeriod(from, to) && !edge.policyId;
}
