import { parseCsv, blankToUndefined } from "./csv";
import { normalizeRows, type RawEventRow } from "./normalize";
import type { ImportResult } from "../types";

export function parseStripeCsv(text: string): ImportResult {
  const { rows } = parseCsv(text);
  const mapped: RawEventRow[] = rows.map((row) => ({
    drift_id: blankToUndefined(row.drift_id),
    source: "stripe",
    kind: row.type || row.kind,
    amount: row.amount,
    currency: row.currency || "usd",
    fee: blankToUndefined(row.fee),
    net: blankToUndefined(row.net),
    gross: blankToUndefined(row.gross),
    occurredAt: row.created || row.occurred_at,
    settledAt: blankToUndefined(row.available_on || row.settled_at),
    externalRef: blankToUndefined(row.charge_id || row.id || row.external_ref),
    parentRef: blankToUndefined(row.parent_charge_id || row.parent_ref),
    payoutRef: blankToUndefined(row.payout_id || row.payout_ref),
    description: blankToUndefined(row.description),
    metadata: { ...row, sourceFile: "stripe.csv" },
  }));
  return normalizeRows(mapped, "stripe");
}
