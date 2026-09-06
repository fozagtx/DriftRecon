import { parseCsv, blankToUndefined } from "./csv";
import { normalizeRows, type RawEventRow } from "./normalize";
import type { ImportResult } from "../types";

export function parseGumroadCsv(text: string): ImportResult {
  const { rows } = parseCsv(text);
  const mapped: RawEventRow[] = rows.map((row) => ({
    drift_id: blankToUndefined(row.drift_id),
    source: "gumroad",
    kind: row.type || row.kind || "sale",
    amount: row.amount,
    currency: row.currency || "usd",
    fee: blankToUndefined(row.fee),
    net: blankToUndefined(row.net),
    occurredAt: row.created_at || row.created,
    externalRef: blankToUndefined(row.sale_id || row.external_ref),
    parentRef: blankToUndefined(row.parent_ref),
    payoutRef: blankToUndefined(row.payout_id || row.payout_ref),
    description: blankToUndefined(row.product || row.description),
    metadata: { ...row, email: row.email, sourceFile: "gumroad.csv" },
  }));
  return normalizeRows(mapped, "gumroad");
}
