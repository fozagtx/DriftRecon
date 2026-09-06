import { parseCsv, blankToUndefined } from "./csv";
import { normalizeRows, type RawEventRow } from "./normalize";
import type { ImportResult } from "../types";

export function parseBankCsv(text: string): ImportResult {
  const { rows } = parseCsv(text);
  const mapped: RawEventRow[] = rows.map((row) => ({
    drift_id: blankToUndefined(row.drift_id),
    source: "bank",
    kind: "bank_deposit",
    amount: row.amount,
    currency: row.currency || "usd",
    occurredAt: row.date || row.occurred_at,
    externalRef: blankToUndefined(row.reference || row.external_ref),
    payoutRef: blankToUndefined(row.payout_ref),
    description: blankToUndefined(row.description),
    metadata: { ...row, sourceFile: "bank.csv" },
  }));
  return normalizeRows(mapped, "bank");
}
