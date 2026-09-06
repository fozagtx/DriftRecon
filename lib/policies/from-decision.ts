import { policyId } from "../ids";
import type { ExceptionRecord, LedgerEvent, MatchEdge, ReconciliationPolicy } from "../types";

export function policyFromApproval(input: {
  exception: ExceptionRecord;
  edge: MatchEdge;
  from: LedgerEvent;
  to: LedgerEvent;
  decidedAt: string;
  decisionId: string;
}): ReconciliationPolicy {
  const conditions = [];
  if (input.from.parentRef && (input.from.parentRef === input.to.externalRef || input.from.parentRef === input.to.id)) {
    conditions.push({ type: "exact_parent_ref" as const });
  }
  if (input.from.payoutRef && (input.from.payoutRef === input.to.externalRef || input.from.payoutRef === input.to.id)) {
    conditions.push({ type: "exact_payout_ref" as const });
  }
  if (input.from.currency === input.to.currency) {
    conditions.push({ type: "same_currency" as const });
  }
  if (input.edge.crossPeriod) {
    conditions.push({ type: "cross_period_allowed" as const });
  }
  conditions.push({ type: "same_source" as const });

  return {
    id: policyId(input.from.source, input.from.kind, input.edge.relationship, input.decidedAt),
    source: input.from.source,
    eventKind: input.from.kind,
    relationship: input.edge.relationship,
    conditions,
    action: actionFor(input.edge.relationship),
    createdFromExceptionId: input.exception.id,
    createdFromDecisionId: input.decisionId,
    createdAt: input.decidedAt,
  };
}

function actionFor(relationship: MatchEdge["relationship"]): string {
  switch (relationship) {
    case "refunds":
      return "Attach refund to original sale";
    case "disputes":
      return "Attach dispute to original sale";
    case "settles_into":
      return "Attach event to payout";
    case "deposited_as":
      return "Attach payout to bank deposit";
    case "converts_into":
      return "Attach FX conversion";
    default:
      return "Attach related event";
  }
}
