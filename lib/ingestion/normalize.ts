import { driftEventId } from "../ids";
import { toMinorUnits, tryToMinorUnits } from "../money";
import type { EventKind, ImportResult, InvalidRow, LedgerEvent, Source } from "../types";
import { blankToUndefined } from "./csv";

export interface RawEventRow {
  drift_id?: string;
  source: Source;
  kind: string;
  amount: unknown;
  currency: string;
  fee?: unknown;
  net?: unknown;
  gross?: unknown;
  occurredAt: string;
  settledAt?: string;
  externalRef?: string;
  parentRef?: string;
  payoutRef?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

const KIND_ALIASES: Record<string, EventKind> = {
  sale: "sale",
  charge: "sale",
  payment: "sale",
  fee: "fee",
  refund: "refund",
  dispute: "dispute",
  chargeback: "dispute",
  fx: "fx_conversion",
  fx_conversion: "fx_conversion",
  payout: "payout",
  bank_deposit: "bank_deposit",
  deposit: "bank_deposit",
};

export function mapKind(value: string | undefined): EventKind | null {
  return KIND_ALIASES[value?.trim().toLowerCase() ?? ""] ?? null;
}

export function normalizeRows(rows: RawEventRow[], source: Source): ImportResult {
  const events: LedgerEvent[] = [];
  const invalidRows: InvalidRow[] = [];

  rows.forEach((row, index) => {
    const errors: string[] = [];
    const kind = mapKind(row.kind);
    if (!kind) errors.push(`Unsupported event kind: ${row.kind || "(empty)"}`);
    if (!row.currency?.trim()) errors.push("Missing currency");
    if (!row.occurredAt?.trim()) errors.push("Missing occurredAt");

    const currency = row.currency?.trim().toUpperCase() || "USD";
    const amount = tryToMinorUnits(row.amount, currency);
    if (amount === null) errors.push("Missing or invalid amount");

    if (errors.length > 0 || !kind || amount === null) {
      invalidRows.push({
        id: `invalid_${source}_${index}`,
        source,
        raw: row as unknown as Record<string, unknown>,
        errors,
      });
      return;
    }

    const feeAmount = row.fee === undefined || row.fee === "" ? undefined : tryToMinorUnits(row.fee, currency) ?? undefined;
    const netAmount = row.net === undefined || row.net === "" ? undefined : tryToMinorUnits(row.net, currency) ?? undefined;
    const grossAmount = row.gross === undefined || row.gross === "" ? undefined : tryToMinorUnits(row.gross, currency) ?? undefined;

    const id = driftEventId({
      source,
      kind,
      externalRef: row.externalRef,
      occurredAt: row.occurredAt,
      amount,
      seed: blankToUndefined(row.drift_id),
    });

    events.push({
      id,
      source,
      kind,
      amount: Math.abs(amount),
      currency,
      grossAmount,
      feeAmount,
      netAmount,
      occurredAt: row.occurredAt,
      settledAt: blankToUndefined(row.settledAt),
      externalRef: blankToUndefined(row.externalRef),
      parentRef: blankToUndefined(row.parentRef),
      payoutRef: blankToUndefined(row.payoutRef),
      description: blankToUndefined(row.description),
      metadata: { ...row.metadata, importedAmount: row.amount, sourceKind: row.kind },
    });
  });

  return { events, invalidRows };
}

export function importedAmountUnchanged(event: LedgerEvent, original: unknown): boolean {
  return event.amount === toMinorUnits(original, event.currency) || event.amount === Math.abs(toMinorUnits(original, event.currency));
}
