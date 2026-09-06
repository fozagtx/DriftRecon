import { edgeId } from "../ids";
import { isCrossPeriod } from "../period";
import type { LedgerEvent, MatchEdge, Relationship } from "../types";
import { REVIEW_MIN } from "./confidence";
import { scorePair } from "./scoring";

const CANDIDATE_PAIRS: Array<{ from: LedgerEvent["kind"]; to: LedgerEvent["kind"]; relationship: Relationship }> = [
  { from: "refund", to: "sale", relationship: "refunds" },
  { from: "dispute", to: "sale", relationship: "disputes" },
  { from: "fee", to: "sale", relationship: "belongs_to" },
  { from: "sale", to: "payout", relationship: "settles_into" },
  { from: "fee", to: "payout", relationship: "settles_into" },
  { from: "refund", to: "payout", relationship: "settles_into" },
  { from: "dispute", to: "payout", relationship: "settles_into" },
  { from: "fx_conversion", to: "payout", relationship: "settles_into" },
  { from: "sale", to: "fx_conversion", relationship: "converts_into" },
  { from: "payout", to: "bank_deposit", relationship: "deposited_as" },
];

export function applyStructuredMatching(events: LedgerEvent[], existing: MatchEdge[]): MatchEdge[] {
  const taken = new Set(existing.map((edge) => edge.id));
  const extras: MatchEdge[] = [];

  for (const spec of CANDIDATE_PAIRS) {
    const fromEvents = events.filter((event) => event.kind === spec.from);
    const toEvents = events.filter((event) => event.kind === spec.to);
    for (const from of fromEvents) {
      for (const to of toEvents) {
        if (from.id === to.id) continue;
        const id = edgeId(from.id, to.id, spec.relationship);
        if (taken.has(id)) continue;
        const scored = scorePair(from, to);
        if (scored.score < REVIEW_MIN) continue;
        extras.push({
          id,
          fromEventId: from.id,
          toEventId: to.id,
          relationship: spec.relationship,
          confidence: Number(scored.score.toFixed(4)),
          reasons: ["Structured candidate match", ...scored.reasons],
          status: "review",
          crossPeriod: isCrossPeriod(from, to),
        });
      }
    }
  }

  return [...existing, ...extras];
}
