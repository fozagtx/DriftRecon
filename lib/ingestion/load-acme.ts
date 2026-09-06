import { readFileSync } from "node:fs";
import path from "node:path";
import type { GroundTruthEdge, ImportResult, LedgerEvent } from "../types";
import { parseBankCsv } from "./bank";
import { parseDodoEvents } from "./dodo";
import { parseGumroadCsv } from "./gumroad";
import { parseStripeCsv } from "./stripe";

export const DATA_DIR = path.join(process.cwd(), "data");

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
