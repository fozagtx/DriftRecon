import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LedgerEvent, MatchEdge, ReconciliationRun } from "../lib/types";

type Row = { payload: unknown };

const db = vi.hoisted(() => {
  process.env.NEON_PASSWORD = "test-password";
  return {
    tables: new Map<string, Map<string, unknown>>(),
  };
});

function table(name: string) {
  if (!db.tables.has(name)) db.tables.set(name, new Map());
  return db.tables.get(name)!;
}

vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join("?");
    if (text.startsWith("CREATE TABLE")) return [];

    const deleted = text.match(/^DELETE FROM (\w+)/);
    if (deleted) {
      const name = deleted[1];
      if (name === "meta" && text.includes("IN ('ground_truth', 'latest_run')")) {
        table("meta").delete("ground_truth");
        table("meta").delete("latest_run");
        return [];
      }
      if (name === "meta" && values[0]) {
        table("meta").delete(String(values[0]));
        return [];
      }
      table(name).clear();
      return [];
    }

    const inserted = text.match(/INSERT INTO (\w+)/);
    if (inserted) {
      table(inserted[1]).set(String(values[0]), values[1]);
      return [];
    }

    if (text.includes("FROM run_archives WHERE id")) {
      const payload = table("run_archives").get(String(values[0]));
      return payload ? [{ payload }] : [];
    }
    if (text.includes("FROM meta WHERE key")) {
      const payload = table("meta").get(String(values[0]));
      return payload ? [{ payload }] : [];
    }
    const selected = text.match(/SELECT payload FROM (\w+)/);
    if (selected) {
      const rows: Row[] = [...table(selected[1]).entries()].map(([, payload]) => ({ payload }));
      if (text.includes("ORDER BY") && selected[1] === "runs") {
        rows.sort((a, b) =>
          String((b.payload as ReconciliationRun).ranAt).localeCompare(String((a.payload as ReconciliationRun).ranAt)),
        );
      }
      return rows;
    }
    return [];
  },
}));

import { clearLedger, listEvents, listRuns, replaceEvents, replaceGraph, restoreRunArchive } from "../lib/db/store";

const eventA: LedgerEvent = {
  id: "sale-a",
  source: "stripe",
  kind: "sale",
  amount: 1000,
  currency: "USD",
  occurredAt: "2026-06-01T00:00:00Z",
  metadata: {},
};

const eventB: LedgerEvent = {
  ...eventA,
  id: "sale-b",
  amount: 2000,
};

const edge: MatchEdge = {
  id: "edge-1",
  fromEventId: "sale-a",
  toEventId: "sale-a",
  relationship: "belongs_to",
  confidence: 1,
  reasons: ["exact"],
  status: "auto",
  crossPeriod: false,
};

const run1: ReconciliationRun = {
  id: "run-1",
  ranAt: "2026-09-01T00:00:00Z",
  eventCount: 1,
  edgeCount: 1,
  exceptionCount: 0,
  autoCount: 1,
  reviewCount: 0,
};

const run2: ReconciliationRun = {
  ...run1,
  id: "run-2",
  ranAt: "2026-09-02T00:00:00Z",
  eventCount: 1,
};

describe("run archives", () => {
  beforeEach(() => {
    db.tables.clear();
  });

  it("keeps past runs after a new import and opens the old graph from Runs", async () => {
    await replaceEvents([eventA], []);
    await replaceGraph([edge], [], run1);

    await clearLedger();
    await replaceEvents([eventB], []);
    await replaceGraph([], [], run2);

    const runs = await listRuns();
    expect(runs.map((run) => run.id)).toEqual(["run-2", "run-1"]);
    expect(await listEvents()).toEqual([eventB]);

    expect(await restoreRunArchive("run-1")).toBe(true);
    expect(await listEvents()).toEqual([eventA]);
  });
});
