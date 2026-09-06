import { createHash } from "node:crypto";

export function driftEventId(parts: {
  source: string;
  kind: string;
  externalRef?: string;
  occurredAt: string;
  amount: number;
  seed?: string;
}): string {
  if (parts.seed) return parts.seed;
  const basis = [
    parts.source,
    parts.kind,
    parts.externalRef ?? "noref",
    parts.occurredAt,
    String(parts.amount),
  ].join("|");
  const hash = createHash("sha256").update(basis).digest("hex").slice(0, 12);
  return `dr_${parts.source}_${parts.kind}_${hash}`;
}

export function edgeId(fromEventId: string, toEventId: string, relationship: string): string {
  return `edge_${relationship}_${fromEventId}_${toEventId}`;
}

export function exceptionId(type: string, relatedEventIds: string[]): string {
  return `exc_${type}_${relatedEventIds.slice().sort().join("_")}`.slice(0, 180);
}

export function policyId(source: string, eventKind: string, relationship: string, createdAt: string): string {
  const hash = createHash("sha256")
    .update([source, eventKind, relationship, createdAt].join("|"))
    .digest("hex")
    .slice(0, 10);
  return `pol_${source}_${eventKind}_${hash}`;
}

export function runId(iso: string): string {
  return `run_${iso.replace(/[:.]/g, "-")}`;
}
