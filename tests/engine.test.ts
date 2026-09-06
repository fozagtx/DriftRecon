import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseBankCsv } from "../lib/ingestion/bank";
import { parseDodoEvents } from "../lib/ingestion/dodo";
import { parseGumroadCsv } from "../lib/ingestion/gumroad";
import { loadAcmeDataset } from "../lib/ingestion/load-acme";
import { parseStripeCsv } from "../lib/ingestion/stripe";
import { toMinorUnits } from "../lib/money";
import { policyFromApproval } from "../lib/policies/from-decision";
import { AUTO_MIN, REVIEW_MIN, confidenceBand } from "../lib/reconciliation/confidence";
import { findDuplicateGroups } from "../lib/reconciliation/duplicates";
import { applyExactReferences } from "../lib/reconciliation/exact";
import { validatePayout } from "../lib/reconciliation/invariants";
import { runReconciliation } from "../lib/reconciliation/pipeline";
import { structuredScore } from "../lib/reconciliation/scoring";
import { evaluatePredictions } from "../lib/evaluation/metrics";
import { truthKey } from "../lib/evaluation/metrics";
import type { ExceptionRecord, LedgerEvent, MatchEdge } from "../lib/types";

const DATA = path.join(process.cwd(), "data");

function event(partial: Partial<LedgerEvent> & Pick<LedgerEvent, "id" | "kind" | "amount">): LedgerEvent {
  return {
    source: "stripe",
    currency: "USD",
    occurredAt: "2026-06-12T00:00:00Z",
    metadata: {},
    ...partial,
  };
}

describe("CSV parsing", () => {
  it("parses Stripe, Gumroad, and bank rows into ledger events", () => {
    const stripe = parseStripeCsv(readFileSync(path.join(DATA, "stripe.csv"), "utf8"));
    const gumroad = parseGumroadCsv(readFileSync(path.join(DATA, "gumroad.csv"), "utf8"));
    const bank = parseBankCsv(readFileSync(path.join(DATA, "bank.csv"), "utf8"));
    expect(stripe.events.some((item) => item.id === "evt_sale_june_1000")).toBe(true);
    expect(gumroad.events.some((item) => item.source === "gumroad")).toBe(true);
    expect(bank.events.every((item) => item.kind === "bank_deposit")).toBe(true);
    expect(stripe.invalidRows.length).toBeGreaterThan(0);
    expect(stripe.invalidRows[0].errors.join(" ")).toMatch(/amount/i);
  });
});

describe("Dodo normalization", () => {
  it("normalizes sale, refund, dispute, and payout webhooks", () => {
    const parsed = parseDodoEvents(JSON.parse(readFileSync(path.join(DATA, "dodo-events.json"), "utf8")));
    expect(parsed.events.some((item) => item.kind === "sale" && item.externalRef === "pay_dodo_60")).toBe(true);
    expect(parsed.events.some((item) => item.kind === "refund" && item.parentRef === "pay_dodo_35")).toBe(true);
    expect(parsed.events.some((item) => item.kind === "dispute")).toBe(true);
    expect(parsed.events.some((item) => item.kind === "payout")).toBe(true);
    expect(parsed.events[0].metadata.raw).toBeTruthy();
  });
});

describe("Minor-unit money conversion", () => {
  it("stores $10.50 as 1050 and refuses invented amounts", () => {
    expect(toMinorUnits(10.5, "USD")).toBe(1050);
    expect(() => toMinorUnits("", "USD")).toThrow(/invented/i);
  });
});

describe("Exact matching", () => {
  it("matches exact parent, payout, and external references at 1.00", () => {
    const sale = event({ id: "s1", kind: "sale", amount: 10000, externalRef: "ch_1", payoutRef: "po_1" });
    const refund = event({ id: "r1", kind: "refund", amount: 2000, parentRef: "ch_1", occurredAt: "2026-07-03T00:00:00Z" });
    const payout = event({ id: "p1", kind: "payout", amount: 8000, externalRef: "po_1" });
    const deposit = event({
      id: "b1",
      kind: "bank_deposit",
      amount: 8000,
      source: "bank",
      externalRef: "po_1",
      description: "STRIPE PAYOUT po_1",
    });
    const edges = applyExactReferences([sale, refund, payout, deposit]);
    expect(edges.find((edge) => edge.relationship === "refunds")?.confidence).toBe(1);
    expect(edges.find((edge) => edge.relationship === "settles_into" && edge.fromEventId === "s1")?.confidence).toBe(1);
    expect(edges.find((edge) => edge.relationship === "deposited_as")?.confidence).toBe(1);
  });
});

describe("Structured scoring", () => {
  it("uses the specified weighted formula", () => {
    expect(
      structuredScore({
        referenceScore: 1,
        amountScore: 1,
        timingScore: 1,
        currencyScore: 1,
        metadataScore: 1,
      }),
    ).toBeCloseTo(1);
    expect(
      structuredScore({
        referenceScore: 0.5,
        amountScore: 0.2,
        timingScore: 0,
        currencyScore: 1,
        metadataScore: 0,
      }),
    ).toBeCloseTo(0.5 * 0.4 + 0.2 * 0.25 + 0.1);
  });
});

describe("Acme dataset cases", () => {
  it("covers cross-period refunds, partial refunds, disputes, FX, and duplicates", () => {
    const { events, invalidRows } = loadAcmeDataset();
    expect(invalidRows.length).toBeGreaterThan(0);
    expect(events.find((item) => item.id === "evt_refund_july_200")?.parentRef).toBe("ch_june_1000");
    expect(events.find((item) => item.id === "evt_refund_partial_30")?.amount).toBe(3000);
    expect(events.find((item) => item.id === "evt_dispute_50")?.kind).toBe("dispute");
    expect(events.find((item) => item.id === "evt_chargeback_40")?.kind).toBe("dispute");
    expect(events.find((item) => item.id === "evt_fx_eur_usd")?.kind).toBe("fx_conversion");
    expect(findDuplicateGroups(events).length).toBeGreaterThan(0);
    expect(events.find((item) => item.id === "evt_sale_noref")?.externalRef).toBeUndefined();
    expect(events.find((item) => item.id === "evt_sale_noref")?.occurredAt.startsWith("2026-07-08")).toBe(true);
  });
});

describe("Payout validation", () => {
  it("balances a known payout and rejects an unbalanced one", () => {
    const { events } = loadAcmeDataset();
    const first = runReconciliation({ events, policies: [] });
    const balanced = events.find((item) => item.id === "evt_payout_june_multi")!;
    const unbalanced = events.find((item) => item.id === "evt_payout_unbal")!;
    expect(validatePayout(balanced, events, first.edges).balanced).toBe(true);
    expect(validatePayout(unbalanced, events, first.edges).balanced).toBe(false);
  });
});

describe("Bank deposits and confidence", () => {
  it("matches deposits by payout reference and keeps thresholds fixed", () => {
    const { events } = loadAcmeDataset();
    const edges = applyExactReferences(events);
    expect(edges.some((edge) => edge.relationship === "deposited_as" && edge.toEventId === "evt_bank_june_multi")).toBe(true);
    expect(confidenceBand(0.95)).toBe("auto");
    expect(confidenceBand(0.94)).toBe("review");
    expect(confidenceBand(0.69)).toBe("unresolved");
    expect(AUTO_MIN).toBe(0.95);
    expect(REVIEW_MIN).toBe(0.7);
  });
});

describe("Cross-period refunds and policies", () => {
  it("creates a first-run exception, then auto-applies an approved policy", () => {
    const { events } = loadAcmeDataset();
    const first = runReconciliation({ events, policies: [] });
    const exception = first.exceptions.find((item) => item.type === "cross_period_adjustment" && item.relatedEventIds.includes("evt_refund_july_200"));
    expect(exception).toBeTruthy();
    const edge = first.edges.find((item) => item.fromEventId === "evt_refund_july_200" && item.relationship === "refunds")!;
    expect(edge.status).toBe("review");

    const policy = policyFromApproval({
      exception: exception as ExceptionRecord,
      edge,
      from: events.find((item) => item.id === "evt_refund_july_200")!,
      to: events.find((item) => item.id === "evt_sale_june_1000")!,
      decidedAt: "2026-07-20T00:00:00Z",
      decisionId: "dec_test",
    });
    expect(policy.conditions.some((item) => item.type === "cross_period_allowed")).toBe(true);

    const second = runReconciliation({
      events,
      policies: [policy],
      decisions: [
        {
          id: "dec_test",
          exceptionId: exception!.id,
          action: "approve",
          edgeId: edge.id,
          policyId: policy.id,
          decidedAt: policy.createdAt,
        },
      ],
    });
    const replayed = second.edges.find((item) => item.id === edge.id);
    expect(replayed?.policyId).toBe(policy.id);
    expect(replayed?.reasons.join(" ")).toMatch(policy.id);
    expect(replayed?.status === "auto" || replayed?.status === "approved").toBe(true);
  });

  it("persists rejection so the edge stays rejected", () => {
    const { events } = loadAcmeDataset();
    const first = runReconciliation({ events, policies: [] });
    const edge = first.edges.find((item) => item.fromEventId === "evt_refund_july_200" && item.relationship === "refunds")!;
    const exception = first.exceptions.find((item) => item.candidateEdgeIds.includes(edge.id));
    const second = runReconciliation({
      events,
      policies: [],
      decisions: [
        {
          id: "dec_reject",
          exceptionId: exception?.id ?? "missing",
          action: "reject",
          edgeId: edge.id,
          decidedAt: "2026-07-20T00:00:00Z",
        },
      ],
    });
    expect(second.edges.find((item) => item.id === edge.id)?.status).toBe("rejected");
  });
});

describe("Evaluation metrics", () => {
  it("compares predictions to ground truth and counts false auto-matches", () => {
    const { events, groundTruth } = loadAcmeDataset();
    const result = runReconciliation({ events, policies: [] });
    const metrics = evaluatePredictions(result.edges, groundTruth, events, result.exceptions.filter((item) => item.status === "open").length);
    expect(metrics.truthCount).toBe(groundTruth.length);
    expect(metrics.precision).toBeGreaterThanOrEqual(0);
    expect(metrics.recall).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(metrics.falseAutoMatchRate)).toBe(true);

    const bogus: MatchEdge = {
      id: "edge_bogus",
      fromEventId: "evt_sale_noref",
      toEventId: "evt_payout_unbal",
      relationship: "settles_into",
      confidence: 1,
      reasons: ["test"],
      status: "auto",
      crossPeriod: false,
    };
    const withFalse = evaluatePredictions([...result.edges, bogus], groundTruth, events, 0);
    expect(withFalse.falseAutoMatchCount).toBeGreaterThan(metrics.falseAutoMatchCount);
    expect(groundTruth.some((item) => truthKey(item) === truthKey(bogus))).toBe(false);
  });
});

describe("snapshot resilience", () => {
  it("returns an empty page model when NEON_PASSWORD is missing", async () => {
    const previous = process.env.NEON_PASSWORD;
    delete process.env.NEON_PASSWORD;
    const { snapshot } = await import("../lib/app/actions");
    const data = await snapshot();
    expect(data.events).toEqual([]);
    expect(data.error).toMatch(/NEON_PASSWORD/);
    if (previous) process.env.NEON_PASSWORD = previous;
    else delete process.env.NEON_PASSWORD;
  });
});
