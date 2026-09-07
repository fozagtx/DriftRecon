import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExceptionRecord, HumanDecision, LedgerEvent, MatchEdge, ReconciliationPolicy } from "../lib/types";

const state = vi.hoisted(() => ({
  events: [] as LedgerEvent[],
  edges: [] as MatchEdge[],
  exceptions: [] as ExceptionRecord[],
  decisions: [] as HumanDecision[],
  policies: [] as ReconciliationPolicy[],
}));

vi.mock("../lib/db/store", () => ({
  clearLedger: vi.fn(),
  latestRun: vi.fn().mockResolvedValue(null),
  listDecisions: vi.fn(async () => state.decisions),
  listEdges: vi.fn(async () => state.edges),
  listEvents: vi.fn(async () => state.events),
  listExceptions: vi.fn(async () => state.exceptions),
  listInvalidRows: vi.fn().mockResolvedValue([]),
  listPolicies: vi.fn(async () => state.policies),
  listRuns: vi.fn().mockResolvedValue([]),
  loadGroundTruth: vi.fn().mockResolvedValue([]),
  replaceEvents: vi.fn(),
  replaceGraph: vi.fn(),
  saveDecision: vi.fn(async (decision: HumanDecision) => state.decisions.push(decision)),
  saveGroundTruth: vi.fn(),
  savePolicy: vi.fn(async (policy: ReconciliationPolicy) => state.policies.push(policy)),
  saveReviewOutcome: vi.fn(async (exception: ExceptionRecord, edge: MatchEdge | undefined, action: HumanDecision["action"]) => {
    exception.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "unresolved";
    if (edge && action !== "unresolved") edge.status = action === "approve" ? "approved" : "rejected";
  }),
  upsertEvent: vi.fn(),
}));

import { reviewException } from "../lib/app/actions";
import { ReviewExceptionConflictError } from "../lib/app/errors";

function seedReview(): void {
  state.events = [
    { id: "refund", source: "stripe", kind: "refund", amount: 200, currency: "USD", occurredAt: "2026-07-01T00:00:00Z", metadata: {} },
    { id: "sale", source: "stripe", kind: "sale", amount: 1000, currency: "USD", occurredAt: "2026-06-01T00:00:00Z", metadata: {} },
  ];
  state.edges = [{ id: "edge-1", fromEventId: "refund", toEventId: "sale", relationship: "refunds", confidence: 0.8, reasons: [], status: "review", crossPeriod: true }];
  state.exceptions = [{ id: "exception-1", type: "cross_period_adjustment", summary: "Review refund", relatedEventIds: ["refund", "sale"], candidateEdgeIds: ["edge-1"], recommendation: "Review", confidence: 0.8, evidence: [], status: "open" }];
  state.decisions = [];
  state.policies = [];
}

describe("reviewException terminal status guard", () => {
  beforeEach(seedReview);

  it("does not create another decision or policy or change approved state", async () => {
    await reviewException("exception-1", "approve");
    expect(state.decisions).toHaveLength(1);
    expect(state.policies).toHaveLength(1);

    await expect(reviewException("exception-1", "reject")).rejects.toBeInstanceOf(ReviewExceptionConflictError);
    expect(state.decisions).toHaveLength(1);
    expect(state.policies).toHaveLength(1);
    expect(state.exceptions[0].status).toBe("approved");
    expect(state.edges[0].status).toBe("approved");
  });

  it("does not create another decision or policy or change rejected state", async () => {
    await reviewException("exception-1", "reject");

    await expect(reviewException("exception-1", "approve")).rejects.toBeInstanceOf(ReviewExceptionConflictError);
    expect(state.decisions).toHaveLength(1);
    expect(state.policies).toHaveLength(0);
    expect(state.exceptions[0].status).toBe("rejected");
    expect(state.edges[0].status).toBe("rejected");
  });

  it("continues to allow unresolved exceptions to be revisited", async () => {
    await reviewException("exception-1", "unresolved");
    await reviewException("exception-1", "approve");

    expect(state.decisions).toHaveLength(2);
    expect(state.exceptions[0].status).toBe("approved");
    expect(state.edges[0].status).toBe("approved");
  });
});
