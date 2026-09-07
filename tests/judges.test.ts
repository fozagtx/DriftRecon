import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseBankCsv } from "../lib/ingestion/bank";
import { parseDodoCsv } from "../lib/ingestion/dodo";
import { parseGumroadCsv } from "../lib/ingestion/gumroad";
import { parseStripeCsv } from "../lib/ingestion/stripe";
import { parseGroundTruth } from "../lib/app/actions";
import { runReconciliation } from "../lib/reconciliation/pipeline";

const DATA = path.join(process.cwd(), "data");

describe("judges CSV pack", () => {
  it("loads the downloadable CSVs and reconciles Stripe and Dodo Payments activity", () => {
    const stripe = parseStripeCsv(readFileSync(path.join(DATA, "stripe.csv"), "utf8"));
    const gumroad = parseGumroadCsv(readFileSync(path.join(DATA, "gumroad.csv"), "utf8"));
    const bank = parseBankCsv(readFileSync(path.join(DATA, "bank.csv"), "utf8"));
    const dodo = parseDodoCsv(readFileSync(path.join(DATA, "dodo.csv"), "utf8"));
    const truth = parseGroundTruth(readFileSync(path.join(DATA, "ground-truth.csv"), "utf8"));
    const events = [...stripe.events, ...gumroad.events, ...dodo.events, ...bank.events];

    expect(events.some((event) => event.source === "stripe" && event.kind === "sale")).toBe(true);
    expect(events.some((event) => event.source === "dodo" && event.kind === "sale")).toBe(true);
    expect(events.some((event) => event.source === "dodo" && event.kind === "payout")).toBe(true);
    expect(truth.length).toBeGreaterThan(0);

    const result = runReconciliation({ events, policies: [] });
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.run.eventCount).toBe(events.length);

    const byId = new Map(events.map((event) => [event.id, event]));
    const touches = (source: string) =>
      result.edges.some((edge) => byId.get(edge.fromEventId)?.source === source || byId.get(edge.toEventId)?.source === source);

    expect(touches("stripe")).toBe(true);
    expect(touches("dodo")).toBe(true);
  });
});
