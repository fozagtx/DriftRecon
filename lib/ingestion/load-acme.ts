import { readFileSync } from "node:fs";
import path from "node:path";
import type { GroundTruthEdge, ImportResult, LedgerEvent } from "../types";
import { parseBankCsv } from "./bank";
import { parseDodoEvents } from "./dodo";
import { parseGumroadCsv } from "./gumroad";
import { parseStripeCsv } from "./stripe";

export const DATA_DIR = path.join(process.cwd(), "data");

/** Seed IDs from data/. Rows that reached Neon without an import marker get purged. */
export const ACME_SEED_EVENT_IDS = new Set([
  "evt_sale_june_1000",
  "evt_refund_july_200",
  "evt_sale_noref",
  "evt_bank_unmatched",
  "evt_refund_ident",
  "evt_refund_dodo_10",
  "evt_dispute_dodo",
  "evt_sale_gum_45",
  "evt_payout_june_multi",
]);

export function isLeftoverAcmeSeed(events: LedgerEvent[]): boolean {
  return events.some((event) => {
    const seeded =
      ACME_SEED_EVENT_IDS.has(event.id) || event.externalRef === "wire_acme_500";
    if (!seeded) return false;
    const imported = event.metadata.imported;
    return imported !== "upload" && imported !== "sample" && event.metadata.ingested !== "webhook";
  });
}

export function loadAcmeDataset(): ImportResult & { groundTruth: GroundTruthEdge[] } {
  const stripe = parseStripeCsv(readFileSync(path.join(DATA_DIR, "stripe.csv"), "utf8"));
  const gumroad = parseGumroadCsv(readFileSync(path.join(DATA_DIR, "gumroad.csv"), "utf8"));
  const bank = parseBankCsv(readFileSync(path.join(DATA_DIR, "bank.csv"), "utf8"));
  const dodo = parseDodoEvents(JSON.parse(readFileSync(path.join(DATA_DIR, "dodo-events.json"), "utf8")));
  const groundTruth = JSON.parse(readFileSync(path.join(DATA_DIR, "ground-truth.json"), "utf8")) as GroundTruthEdge[];

  return {
    events: mergeEvents(stripe.events, gumroad.events, dodo.events, bank.events),
    invalidRows: [...stripe.invalidRows, ...gumroad.invalidRows, ...dodo.invalidRows, ...bank.invalidRows],
    groundTruth,
  };
}

function mergeEvents(...groups: LedgerEvent[][]): LedgerEvent[] {
  const seen = new Set<string>();
  const events: LedgerEvent[] = [];
  for (const group of groups) {
    for (const event of group) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      events.push(event);
    }
  }
  return events;
}
