import { edgeId } from "../ids";
import { daysApart, eventPeriod, isCrossPeriod } from "../period";
import type { LedgerEvent, MatchEdge, Relationship } from "../types";

export function runBaseline(events: LedgerEvent[]): MatchEdge[] {
  const edges: MatchEdge[] = [];
  const pairs: Array<{ from: LedgerEvent["kind"]; to: LedgerEvent["kind"]; relationship: Relationship }> = [
    { from: "refund", to: "sale", relationship: "refunds" },
    { from: "dispute", to: "sale", relationship: "disputes" },
    { from: "fee", to: "sale", relationship: "belongs_to" },
    { from: "sale", to: "payout", relationship: "settles_into" },
    { from: "payout", to: "bank_deposit", relationship: "deposited_as" },
  ];

  for (const spec of pairs) {
    const fromEvents = events.filter((event) => event.kind === spec.from);
    const toEvents = events.filter((event) => event.kind === spec.to);
    for (const from of fromEvents) {
      for (const to of toEvents) {
        if (isCrossPeriod(from, to)) continue;
        if (from.currency !== to.currency) continue;
        const amountClose = Math.abs(from.amount - to.amount) / Math.max(from.amount, to.amount, 1) <= 0.15;
        const near = daysApart(from.occurredAt, to.occurredAt) <= 14;
        const samePeriod = eventPeriod(from) === eventPeriod(to);
        if (!amountClose || !near || !samePeriod) continue;
        edges.push({
          id: edgeId(from.id, to.id, spec.relationship),
          fromEventId: from.id,
          toEventId: to.id,
          relationship: spec.relationship,
          confidence: 0.72,
          reasons: ["Baseline: same currency, similar amount, same period, date proximity"],
          status: "auto",
          crossPeriod: false,
        });
      }
    }
  }
  return edges;
}
