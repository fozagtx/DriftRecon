import type { LedgerEvent } from "./types";

export function accountingPeriod(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function eventPeriod(event: LedgerEvent): string {
  return accountingPeriod(event.occurredAt);
}

export function isCrossPeriod(left: LedgerEvent, right: LedgerEvent): boolean {
  return eventPeriod(left) !== eventPeriod(right);
}

export function daysApart(leftIso: string, rightIso: string): number {
  const left = Date.parse(leftIso);
  const right = Date.parse(rightIso);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return Number.POSITIVE_INFINITY;
  return Math.abs(left - right) / 86_400_000;
}
