import { validatePayout } from "./invariants";
import type { ExceptionRecord, LedgerEvent, MatchEdge, OverviewMetrics } from "../types";

export function overviewMetrics(events: LedgerEvent[], edges: MatchEdge[], exceptions: ExceptionRecord[]): OverviewMetrics {
  const payouts = events.filter((event) => event.kind === "payout");
  const deposits = events.filter((event) => event.kind === "bank_deposit");
  const accepted = new Set(["auto", "approved"]);
  const totalFinancialValue = [...payouts, ...deposits].reduce((total, event) => total + event.amount, 0);
  const reconciledValue = payouts
    .filter((payout) => {
      const balanced = validatePayout(payout, events, edges).balanced;
      const deposit = edges.find(
        (edge) => edge.relationship === "deposited_as" && edge.fromEventId === payout.id && accepted.has(edge.status),
      );
      return balanced && Boolean(deposit);
    })
    .reduce((total, payout) => total + payout.amount, 0);
  const unresolvedValue = Math.max(0, totalFinancialValue - reconciledValue);
  const openExceptions = exceptions.filter((item) => item.status === "open" || item.status === "unresolved");

  return {
    totalFinancialValue,
    reconciledValue,
    unresolvedValue,
    autonomousCoverage: totalFinancialValue === 0 ? 0 : reconciledValue / totalFinancialValue,
    transactionCount: events.length,
    payoutCount: payouts.length,
    bankDepositCount: deposits.length,
    exceptionCount: openExceptions.length,
    humanReviewCount: exceptions.filter((item) => item.status === "open").length,
  };
}
