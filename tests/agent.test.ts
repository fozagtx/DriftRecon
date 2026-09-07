import { describe, expect, it } from "vitest";
import { investigateException } from "../lib/agent/investigator";
import type { ExceptionRecord, LedgerEvent, MatchEdge } from "../lib/types";

const sale: LedgerEvent = {
  id: "sale-1",
  source: "stripe",
  kind: "sale",
  amount: 100000,
  currency: "USD",
  occurredAt: "2026-06-12T00:00:00Z",
  externalRef: "ch_june",
  metadata: {},
};

const refund: LedgerEvent = {
  id: "refund-1",
  source: "stripe",
  kind: "refund",
  amount: 20000,
  currency: "USD",
  occurredAt: "2026-07-03T00:00:00Z",
  parentRef: "ch_june",
  metadata: {},
};

const edge: MatchEdge = {
  id: "edge-1",
  fromEventId: "refund-1",
  toEventId: "sale-1",
  relationship: "refunds",
  confidence: 0.82,
  reasons: ["parent ref"],
  status: "review",
  crossPeriod: true,
};

const exception: ExceptionRecord = {
  id: "ex-1",
  type: "cross_period_adjustment",
  summary: "July refund for June sale",
  relatedEventIds: [refund.id, sale.id],
  candidateEdgeIds: [edge.id],
  recommendation: "Review",
  confidence: 0.82,
  evidence: [],
  status: "open",
};

describe("Recon Agent", () => {
  it("investigates with real tools and does not invent a recommendation", () => {
    const result = investigateException({
      events: [sale, refund],
      edges: [edge],
      policies: [],
      exception,
    });
    expect(result.requiresHumanReview).toBe(true);
    expect(result.recommendation).toMatch(/Cross-period refund/i);
    expect(result.evidence.map((item) => item.label)).toEqual(
      expect.arrayContaining(["get_event", "get_candidate_matches", "get_policies", "find_events"]),
    );
  });
});
