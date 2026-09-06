import { DEMO_TOLERANCE_MINOR, withinTolerance } from "../money";
import type { FinancialValidation, LedgerEvent, MatchEdge } from "../types";

export function eventsForPayout(payout: LedgerEvent, events: LedgerEvent[], edges: MatchEdge[]): LedgerEvent[] {
  const linkedIds = new Set(
    edges
      .filter((edge) => edge.relationship === "settles_into" && edge.toEventId === payout.id && edge.status !== "rejected")
      .map((edge) => edge.fromEventId),
  );
  return events.filter((event) => linkedIds.has(event.id) || event.payoutRef === payout.externalRef);
}

export function validatePayout(payout: LedgerEvent, events: LedgerEvent[], edges: MatchEdge[]): FinancialValidation {
  const linked = eventsForPayout(payout, events, edges);
  const sales = sum(linked.filter((event) => event.kind === "sale" && event.currency === payout.currency));
  const refunds = sum(linked.filter((event) => event.kind === "refund" && event.currency === payout.currency));
  const disputes = sum(linked.filter((event) => event.kind === "dispute" && event.currency === payout.currency));
  const fees = sum(linked.filter((event) => event.kind === "fee" && event.currency === payout.currency));
  const fxAdjustments = fxNet(linked, payout, events, edges);
  const expectedMinor = sales - refunds - disputes - fees + fxAdjustments;

  return {
    payoutEventId: payout.id,
    expectedMinor,
    actualMinor: payout.amount,
    residualMinor: expectedMinor - payout.amount,
    balanced: withinTolerance(expectedMinor, payout.amount, DEMO_TOLERANCE_MINOR),
    components: { sales, refunds, disputes, fees, fxAdjustments },
  };
}

export function validateDeposit(deposit: LedgerEvent, payout: LedgerEvent | undefined): FinancialValidation {
  const actual = deposit.amount;
  const expected = payout?.amount ?? 0;
  return {
    payoutEventId: payout?.id,
    expectedMinor: expected,
    actualMinor: actual,
    residualMinor: expected - actual,
    balanced: Boolean(payout) && withinTolerance(expected, actual),
    components: { sales: 0, refunds: 0, disputes: 0, fees: 0, fxAdjustments: 0 },
  };
}

function sum(events: LedgerEvent[]): number {
  return events.reduce((total, event) => total + event.amount, 0);
}

function fxNet(linked: LedgerEvent[], payout: LedgerEvent, _events: LedgerEvent[], _edges: MatchEdge[]): number {
  return sum(linked.filter((event) => event.kind === "fx_conversion" && event.currency === payout.currency));
}
