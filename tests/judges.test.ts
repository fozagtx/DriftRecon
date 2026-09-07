import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseBankCsv } from "../lib/ingestion/bank";
import { parseDodoEvents } from "../lib/ingestion/dodo";
import { parseGumroadCsv } from "../lib/ingestion/gumroad";
import { isJudgePack, judgePackToUploads } from "../lib/ingestion/judge-pack";
import { parseStripeCsv } from "../lib/ingestion/stripe";
import { runReconciliation } from "../lib/reconciliation/pipeline";

const PACK = path.join(process.cwd(), "data", "judges-test.json");

describe("judges test file", () => {
  it("loads data/judges-test.json and reconciles Stripe and Dodo Payments activity", () => {
    const pack = JSON.parse(readFileSync(PACK, "utf8"));
    expect(isJudgePack(pack)).toBe(true);

    const files = Object.fromEntries(judgePackToUploads(pack).map((item) => [item.filename, item.content]));
    const stripe = parseStripeCsv(files["stripe.csv"]);
    const gumroad = parseGumroadCsv(files["gumroad.csv"]);
    const bank = parseBankCsv(files["bank.csv"]);
    const dodo = parseDodoEvents(JSON.parse(files["dodo-events.json"]));
    const events = [...stripe.events, ...gumroad.events, ...dodo.events, ...bank.events];

    expect(events.some((event) => event.source === "stripe" && event.kind === "sale")).toBe(true);
    expect(events.some((event) => event.source === "dodo" && event.kind === "sale")).toBe(true);
    expect(events.some((event) => event.source === "dodo" && event.kind === "payout")).toBe(true);
    expect(JSON.parse(files["ground-truth.json"]).length).toBeGreaterThan(0);

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
