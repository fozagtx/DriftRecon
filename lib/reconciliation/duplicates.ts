import type { LedgerEvent } from "../types";

export function findDuplicateGroups(events: LedgerEvent[]): LedgerEvent[][] {
  const groups = new Map<string, LedgerEvent[]>();
  for (const event of events) {
    if (!event.externalRef) continue;
    const key = [event.source, event.kind, event.externalRef, event.amount, event.occurredAt.slice(0, 10)].join("|");
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}
