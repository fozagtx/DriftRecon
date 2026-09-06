import { daysApart } from "../period";
import type { LedgerEvent } from "../types";
import { absMinor } from "../money";

export interface ScoreParts {
  referenceScore: number;
  amountScore: number;
  timingScore: number;
  currencyScore: number;
  metadataScore: number;
}

export function structuredScore(parts: ScoreParts): number {
  return (
    parts.referenceScore * 0.4 +
    parts.amountScore * 0.25 +
    parts.timingScore * 0.15 +
    parts.currencyScore * 0.1 +
    parts.metadataScore * 0.1
  );
}

export function referenceScore(from: LedgerEvent, to: LedgerEvent): number {
  if (from.parentRef && (from.parentRef === to.externalRef || from.parentRef === to.id)) return 1;
  if (from.payoutRef && (from.payoutRef === to.externalRef || from.payoutRef === to.id)) return 1;
  if (from.externalRef && from.externalRef === to.externalRef) return 0.85;
  if (sharesToken(from.description, to.description) || sharesToken(from.description, to.externalRef)) return 0.45;
  if (
    (from.kind === "refund" || from.kind === "dispute") &&
    to.kind === "sale" &&
    from.amount === to.amount &&
    from.currency === to.currency
  ) {
    return 0.55;
  }
  return 0;
}

export function amountScore(from: LedgerEvent, to: LedgerEvent): number {
  if (from.amount === to.amount) return 1;
  const larger = Math.max(absMinor(from.amount), absMinor(to.amount));
  if (larger === 0) return 0;
  const delta = Math.abs(from.amount - to.amount);
  if (delta <= 1) return 0.95;
  const ratio = 1 - delta / larger;
  return Math.max(0, Math.min(1, ratio));
}

export function timingScore(from: LedgerEvent, to: LedgerEvent): number {
  const days = daysApart(from.occurredAt, to.occurredAt);
  if (days === 0) return 1;
  if (days <= 3) return 0.85;
  if (days <= 14) return 0.6;
  if (days <= 45) return 0.35;
  return 0.1;
}

export function currencyScore(from: LedgerEvent, to: LedgerEvent): number {
  return from.currency === to.currency ? 1 : 0;
}

export function metadataScore(from: LedgerEvent, to: LedgerEvent): number {
  const fromDesc = (from.description ?? "").toLowerCase();
  const toDesc = (to.description ?? "").toLowerCase();
  if (fromDesc && toDesc && (fromDesc.includes(toDesc) || toDesc.includes(fromDesc))) return 0.8;
  if (from.payoutRef && from.payoutRef === to.payoutRef) return 0.7;
  if (from.source === to.source) return 0.4;
  return 0.1;
}

export function scorePair(from: LedgerEvent, to: LedgerEvent): { score: number; parts: ScoreParts; reasons: string[] } {
  const parts: ScoreParts = {
    referenceScore: referenceScore(from, to),
    amountScore: amountScore(from, to),
    timingScore: timingScore(from, to),
    currencyScore: currencyScore(from, to),
    metadataScore: metadataScore(from, to),
  };
  const score = structuredScore(parts);
  const reasons = [
    `reference ${parts.referenceScore.toFixed(2)}`,
    `amount ${parts.amountScore.toFixed(2)}`,
    `timing ${parts.timingScore.toFixed(2)}`,
    `currency ${parts.currencyScore.toFixed(2)}`,
    `metadata ${parts.metadataScore.toFixed(2)}`,
  ];
  return { score, parts, reasons };
}

function sharesToken(left?: string, right?: string): boolean {
  if (!left || !right) return false;
  const tokens = left.toLowerCase().split(/[^a-z0-9_]+/).filter((token) => token.length > 3);
  const hay = right.toLowerCase();
  return tokens.some((token) => hay.includes(token));
}
