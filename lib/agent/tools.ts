import { validatePayout } from "../reconciliation/invariants";
import type { ExceptionRecord, LedgerEvent, MatchEdge, ReconciliationPolicy } from "../types";

export interface AgentContext {
  events: LedgerEvent[];
  edges: MatchEdge[];
  policies: ReconciliationPolicy[];
  exception: ExceptionRecord;
}

export function getEvent(context: AgentContext, id: string): LedgerEvent | null {
  return context.events.find((event) => event.id === id) ?? null;
}

export function findEvents(
  context: AgentContext,
  query: { parentRef?: string; externalRef?: string; amount?: number; currency?: string; kind?: LedgerEvent["kind"] },
): LedgerEvent[] {
  return context.events.filter((event) => {
    if (query.parentRef && event.externalRef !== query.parentRef && event.parentRef !== query.parentRef) return false;
    if (query.externalRef && event.externalRef !== query.externalRef) return false;
    if (query.amount !== undefined && event.amount !== query.amount) return false;
    if (query.currency && event.currency !== query.currency) return false;
    if (query.kind && event.kind !== query.kind) return false;
    return true;
  });
}

export function getCandidateMatches(context: AgentContext): MatchEdge[] {
  if (context.exception.candidateEdgeIds.length > 0) {
    return context.edges.filter((edge) => context.exception.candidateEdgeIds.includes(edge.id));
  }
  return context.edges.filter((edge) => context.exception.relatedEventIds.includes(edge.fromEventId) || context.exception.relatedEventIds.includes(edge.toEventId));
}

export function calculateChain(context: AgentContext, payoutId: string) {
  const payout = getEvent(context, payoutId);
  if (!payout || payout.kind !== "payout") return null;
  return validatePayout(payout, context.events, context.edges);
}

export function getPolicies(context: AgentContext): ReconciliationPolicy[] {
  return context.policies;
}
