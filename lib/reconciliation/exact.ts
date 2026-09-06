import { edgeId } from "../ids";
import { isCrossPeriod } from "../period";
import type { LedgerEvent, MatchEdge, Relationship } from "../types";
import { EXACT_CONFIDENCE } from "./confidence";

export function applyExactReferences(events: LedgerEvent[]): MatchEdge[] {
  const byExternal = indexBy(events, (event) => event.externalRef);
  const payouts = events.filter((event) => event.kind === "payout");
  const deposits = events.filter((event) => event.kind === "bank_deposit");
  const edges: MatchEdge[] = [];

  for (const event of events) {
    if (event.parentRef) {
      const parents = byExternal.get(event.parentRef) ?? [];
      for (const parent of parents) {
        if (event.kind === "fx_conversion" && parent.kind === "sale") {
          edges.push(exactEdge(parent, event, "converts_into", "Exact parent reference"));
          continue;
        }
        const relationship = relationshipFor(event, parent);
        if (relationship) {
          edges.push(exactEdge(event, parent, relationship, "Exact parent reference"));
        }
      }
    }

    if (event.payoutRef) {
      const targets = payouts.filter((payout) => payout.externalRef === event.payoutRef || payout.id === event.payoutRef);
      for (const payout of targets) {
        if (event.id === payout.id) continue;
        edges.push(exactEdge(event, payout, "settles_into", "Exact payout reference"));
      }
    }
  }

  for (const payout of payouts) {
    for (const deposit of deposits) {
      const refHit =
        (payout.externalRef && (deposit.externalRef === payout.externalRef || deposit.payoutRef === payout.externalRef)) ||
        (payout.externalRef && (deposit.description ?? "").includes(payout.externalRef));
      if (refHit) {
        edges.push(exactEdge(payout, deposit, "deposited_as", "Exact external reference"));
      }
    }
  }

  return dedupeEdges(edges);
}

function relationshipFor(child: LedgerEvent, parent: LedgerEvent): Relationship | null {
  if (child.kind === "refund" && parent.kind === "sale") return "refunds";
  if (child.kind === "dispute" && parent.kind === "sale") return "disputes";
  if (child.kind === "fee" && (parent.kind === "sale" || parent.kind === "refund" || parent.kind === "payout")) {
    return "belongs_to";
  }
  if (child.kind === "fx_conversion") return "converts_into";
  if (parent.kind === "sale" || parent.kind === "payout") return "belongs_to";
  return null;
}

function exactEdge(from: LedgerEvent, to: LedgerEvent, relationship: Relationship, reason: string): MatchEdge {
  return {
    id: edgeId(from.id, to.id, relationship),
    fromEventId: from.id,
    toEventId: to.id,
    relationship,
    confidence: EXACT_CONFIDENCE,
    reasons: [reason],
    status: "review",
    crossPeriod: isCrossPeriod(from, to),
  };
}

function indexBy(events: LedgerEvent[], key: (event: LedgerEvent) => string | undefined): Map<string, LedgerEvent[]> {
  const map = new Map<string, LedgerEvent[]>();
  for (const event of events) {
    const value = key(event);
    if (!value) continue;
    const list = map.get(value) ?? [];
    list.push(event);
    map.set(value, list);
  }
  return map;
}

function dedupeEdges(edges: MatchEdge[]): MatchEdge[] {
  const map = new Map<string, MatchEdge>();
  for (const edge of edges) map.set(edge.id, edge);
  return [...map.values()];
}
