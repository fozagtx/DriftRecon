import { dodoWebhookSchema } from "../schemas";
import { parseCsv, blankToUndefined } from "./csv";
import { normalizeRows, mapKind, type RawEventRow } from "./normalize";
import type { EventKind, ImportResult } from "../types";

const DODO_TYPE_TO_KIND: Record<string, EventKind> = {
  "payment.succeeded": "sale",
  "refund.succeeded": "refund",
  "dispute.opened": "dispute",
  "dispute.lost": "dispute",
  "payout.success": "payout",
  sale: "sale",
  refund: "refund",
  dispute: "dispute",
  payout: "payout",
};

export function parseDodoEvents(input: unknown): ImportResult {
  const payloads = Array.isArray(input) ? input : [input];
  const rows: RawEventRow[] = [];
  const invalid: ImportResult = { events: [], invalidRows: [] };

  payloads.forEach((payload, index) => {
    const parsed = dodoWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      invalid.invalidRows.push({
        id: `invalid_dodo_${index}`,
        source: "dodo",
        raw: (payload ?? {}) as Record<string, unknown>,
        errors: parsed.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const data = parsed.data.data;
    const kind = DODO_TYPE_TO_KIND[parsed.data.type] ?? mapKind(parsed.data.type);
    if (!kind) {
      invalid.invalidRows.push({
        id: `invalid_dodo_${index}`,
        source: "dodo",
        raw: parsed.data as unknown as Record<string, unknown>,
        errors: [`Unsupported Dodo event type: ${parsed.data.type}`],
      });
      return;
    }

    const amount = data.amount ?? data.total_amount ?? data.net_amount;
    const currency = String(data.currency ?? "usd");
    const occurredAt = String(data.created_at ?? data.occurred_at ?? "");
    const externalRef = optionalString(data.payment_id ?? data.refund_id ?? data.dispute_id ?? data.payout_id ?? data.id);
    const parentRef = optionalString(data.payment_id && kind !== "sale" ? data.payment_id : data.parent_ref);
    const payoutRef = optionalString(data.payout_id ?? data.payout_ref);

    rows.push({
      drift_id: optionalString(data.drift_id),
      source: "dodo",
      kind,
      amount,
      currency,
      fee: data.fee,
      net: data.net_amount ?? data.net,
      occurredAt,
      externalRef,
      parentRef: kind === "sale" ? undefined : parentRef,
      payoutRef,
      description: optionalString(data.description ?? data.product_id),
      metadata: { raw: payload, dodoType: parsed.data.type },
    });
  });

  const normalized = normalizeRows(rows, "dodo");
  return {
    events: [...invalid.events, ...normalized.events],
    invalidRows: [...invalid.invalidRows, ...normalized.invalidRows],
  };
}

export function parseDodoCsv(text: string): ImportResult {
  const { rows } = parseCsv(text);
  const mapped: RawEventRow[] = rows.map((row) => ({
    drift_id: blankToUndefined(row.drift_id),
    source: "dodo",
    kind: row.type || row.kind,
    amount: row.amount,
    currency: row.currency || "usd",
    fee: blankToUndefined(row.fee),
    net: blankToUndefined(row.net),
    occurredAt: row.created || row.created_at || row.occurred_at,
    externalRef: blankToUndefined(row.payment_id || row.refund_id || row.dispute_id || row.payout_id || row.id || row.external_ref),
    parentRef: blankToUndefined(row.parent_ref),
    payoutRef: blankToUndefined(row.payout_id || row.payout_ref),
    description: blankToUndefined(row.description),
    metadata: { ...row, sourceFile: "dodo.csv" },
  }));
  return normalizeRows(mapped, "dodo");
}

function optionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
}
