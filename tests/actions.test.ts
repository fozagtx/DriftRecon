import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExceptionRecord, LedgerEvent, MatchEdge } from "../lib/types";

const store = vi.hoisted(() => ({
  clearLedger: vi.fn(),
  latestRun: vi.fn(),
  listDecisions: vi.fn(),
  listEdges: vi.fn(),
  listEvents: vi.fn(),
  listExceptions: vi.fn(),
  listInvalidRows: vi.fn(),
  listPolicies: vi.fn(),
  listRuns: vi.fn(),
  loadGroundTruth: vi.fn(),
  replaceEvents: vi.fn(),
  replaceGraph: vi.fn(),
  restoreRunArchive: vi.fn(),
  saveDecision: vi.fn(),
  saveGroundTruth: vi.fn(),
  savePolicy: vi.fn(),
  saveReviewOutcome: vi.fn(),
  upsertEvent: vi.fn(),
}));

vi.mock("../lib/db/store", () => store);

import { activateRun, reviewException } from "../lib/app/actions";

const edge: MatchEdge = {
  id: "edge-1",
  fromEventId: "refund-1",
  toEventId: "sale-1",
  relationship: "refunds",
  confidence: 0.9,
  reasons: ["candidate"],
  status: "review",
  crossPeriod: true,
};

const exception: ExceptionRecord = {
  id: "exception-1",
  type: "cross_period_adjustment",
  summary: "Review this match",
  relatedEventIds: ["refund-1", "sale-1"],
  candidateEdgeIds: [edge.id],
  recommendation: "Approve",
  confidence: 0.9,
  evidence: [],
  status: "open",
};

const events: LedgerEvent[] = [
  {
    id: "refund-1",
    source: "stripe",
    kind: "refund",
    amount: 100,
    currency: "USD",
    occurredAt: "2026-09-01T00:00:00Z",
    parentRef: "sale-ref",
    metadata: {},
  },
  {
    id: "sale-1",
    source: "stripe",
    kind: "sale",
    amount: 100,
    currency: "USD",
    occurredAt: "2026-08-01T00:00:00Z",
    externalRef: "sale-ref",
    metadata: {},
  },
];

describe("reviewException", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.listEvents.mockResolvedValue(events);
    store.listEdges.mockResolvedValue([edge]);
    store.listExceptions.mockResolvedValue([exception]);
  });

  it("passes the approval policy ID to both the decision and selected edge", async () => {
    const result = await reviewException(exception.id, "approve");

    expect(result.policyId).toBeDefined();
    expect(store.saveDecision).toHaveBeenCalledWith(expect.objectContaining({ policyId: result.policyId }));
    expect(store.saveReviewOutcome).toHaveBeenCalledWith(exception, edge, "approve", result.policyId);
  });

  it("does not create or associate a policy for rejection", async () => {
    const result = await reviewException(exception.id, "reject");

    expect(result.policyId).toBeUndefined();
    expect(store.savePolicy).not.toHaveBeenCalled();
    expect(store.saveDecision).toHaveBeenCalledWith(expect.objectContaining({ policyId: undefined }));
    expect(store.saveReviewOutcome).toHaveBeenCalledWith(exception, edge, "reject", undefined);
  });
});

describe("activateRun", () => {
  it("restores the archived graph for a stored run", async () => {
    store.restoreRunArchive.mockResolvedValue(true);
    store.listEvents.mockResolvedValue(events);
    store.listEdges.mockResolvedValue([edge]);
    store.listExceptions.mockResolvedValue([exception]);
    store.listPolicies.mockResolvedValue([]);
    store.listInvalidRows.mockResolvedValue([]);
    store.listDecisions.mockResolvedValue([]);
    store.listRuns.mockResolvedValue([]);
    store.latestRun.mockResolvedValue(null);
    store.loadGroundTruth.mockResolvedValue([]);

    await activateRun("run-1");

    expect(store.restoreRunArchive).toHaveBeenCalledWith("run-1");
  });

  it("rejects a run with no stored graph", async () => {
    store.restoreRunArchive.mockResolvedValue(false);
    await expect(activateRun("missing")).rejects.toThrow(/no stored graph/);
  });
});
