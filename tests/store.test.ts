import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExceptionRecord, MatchEdge } from "../lib/types";

const { writes } = vi.hoisted(() => {
  process.env.NEON_PASSWORD = "test-password";
  return {
    writes: [] as Array<{ table: string; id: string; payload: Record<string, unknown> }>,
  };
});

vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const insert = strings.join("?").match(/^INSERT INTO (\w+) /);
    if (insert && values.length >= 2) {
      writes.push({
        table: insert[1],
        id: values[0] as string,
        payload: values[1] as Record<string, unknown>,
      });
    }
    return [];
  },
}));

import { saveReviewOutcome } from "../lib/db/store";

const exception: ExceptionRecord = {
  id: "exception-1",
  type: "cross_period_adjustment",
  summary: "Review this match",
  relatedEventIds: ["refund-1", "sale-1"],
  candidateEdgeIds: ["edge-1"],
  recommendation: "Approve",
  confidence: 0.9,
  evidence: [],
  status: "open",
};

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

describe("saveReviewOutcome", () => {
  beforeEach(() => writes.splice(0));

  it("associates the generated policy with an approved edge", async () => {
    await saveReviewOutcome(exception, edge, "approve", "policy-1");

    expect(writes.find((write) => write.table === "edges")?.payload).toMatchObject({
      id: edge.id,
      status: "approved",
      policyId: "policy-1",
    });
  });

  it("does not associate a policy with a rejected edge", async () => {
    await saveReviewOutcome(exception, edge, "reject", "policy-should-be-ignored");

    const savedEdge = writes.find((write) => write.table === "edges")?.payload;
    expect(savedEdge).toMatchObject({ id: edge.id, status: "rejected" });
    expect(savedEdge).not.toHaveProperty("policyId");
  });
});
