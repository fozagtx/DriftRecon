import { attachAgentRecommendations } from "../agent/investigator";
import { emitNeatlogs } from "../agent/neatlogs";
import { inferRecommendation, tensorMuxConfig } from "../agent/tensormux";
import {
  latestRun,
  listDecisions,
  listEdges,
  listEvents,
  listExceptions,
  listInvalidRows,
  listPolicies,
  loadGroundTruth,
  replaceEvents,
  replaceGraph,
  saveDecision,
  savePolicy,
  upsertEvent,
} from "../db/store";
import { runBaseline } from "../evaluation/baseline";
import { evaluatePredictions } from "../evaluation/metrics";
import { parseBankCsv } from "../ingestion/bank";
import { parseDodoEvents } from "../ingestion/dodo";
import { parseGumroadCsv } from "../ingestion/gumroad";
import { parseStripeCsv } from "../ingestion/stripe";
import { policyFromApproval } from "../policies/from-decision";
import { overviewMetrics } from "../reconciliation/overview";
import { runReconciliation } from "../reconciliation/pipeline";
import { validatePayout } from "../reconciliation/invariants";
import type { ExceptionRecord, ImportResult, LedgerEvent, MatchEdge, Source } from "../types";

export async function importUploads(files: {
  stripe?: string;
  gumroad?: string;
  bank?: string;
  dodo?: string;
}) {
  if (!files.stripe && !files.gumroad && !files.bank && !files.dodo) {
    throw new Error("Upload a Stripe, Gumroad, or bank CSV, or a Dodo JSON file.");
  }

  const incoming: ImportResult = { events: [], invalidRows: [] };
  const replaced = new Set<Source>();

  if (files.stripe) {
    replaced.add("stripe");
    const parsed = parseStripeCsv(files.stripe);
    incoming.events.push(...parsed.events);
    incoming.invalidRows.push(...parsed.invalidRows);
  }
  if (files.gumroad) {
    replaced.add("gumroad");
    const parsed = parseGumroadCsv(files.gumroad);
    incoming.events.push(...parsed.events);
    incoming.invalidRows.push(...parsed.invalidRows);
  }
  if (files.bank) {
    replaced.add("bank");
    const parsed = parseBankCsv(files.bank);
    incoming.events.push(...parsed.events);
    incoming.invalidRows.push(...parsed.invalidRows);
  }
  if (files.dodo) {
    replaced.add("dodo");
    let payload: unknown;
    try {
      payload = JSON.parse(files.dodo);
    } catch {
      throw new Error("Dodo file must be JSON.");
    }
    const parsed = parseDodoEvents(payload);
    incoming.events.push(...parsed.events);
    incoming.invalidRows.push(...parsed.invalidRows);
  }

  const existing = await listEvents();
  const existingInvalid = await listInvalidRows();
  await replaceEvents(
    [...existing.filter((event) => !replaced.has(event.source)), ...incoming.events],
    [...existingInvalid.filter((row) => !replaced.has(row.source)), ...incoming.invalidRows],
  );

  return {
    eventCount: incoming.events.length,
    invalidCount: incoming.invalidRows.length,
    sources: [...replaced],
  };
}

export async function reconcile() {
  const events = await listEvents();
  const policies = await listPolicies();
  const decisions = await listDecisions();
  const result = runReconciliation({ events, policies, decisions });
  const traced = attachAgentRecommendations(result.exceptions, events, result.edges, policies);

  for (const exception of traced.filter((item) => item.status === "open")) {
    await emitNeatlogs({
      at: new Date().toISOString(),
      type: "agent_execution",
      exceptionId: exception.id,
      detail: { type: exception.type },
    });
    const config = tensorMuxConfig();
    if (config && exception.agentRecommendation) {
      try {
        await emitNeatlogs({
          at: new Date().toISOString(),
          type: "model_request",
          exceptionId: exception.id,
          detail: { exception: exception.type },
        });
        const inferred = await inferRecommendation(
          {
            exception,
            recommendation: exception.agentRecommendation,
          },
          config,
        );
        exception.agentRecommendation = {
          ...inferred,
          requiresHumanReview: true,
          evidence: inferred.evidence,
        };
        await emitNeatlogs({
          at: new Date().toISOString(),
          type: "model_response",
          exceptionId: exception.id,
          detail: inferred,
        });
      } catch (error) {
        await emitNeatlogs({
          at: new Date().toISOString(),
          type: "validation_error",
          exceptionId: exception.id,
          detail: error instanceof Error ? error.message : "TensorMux error",
        });
      }
    }
    await emitNeatlogs({
      at: new Date().toISOString(),
      type: "recommendation",
      exceptionId: exception.id,
      detail: exception.agentRecommendation,
    });
    await emitNeatlogs({
      at: new Date().toISOString(),
      type: "human_review_escalation",
      exceptionId: exception.id,
      detail: { requiresHumanReview: true },
    });
  }

  await replaceGraph(result.edges, traced, result.run);
  return await snapshot();
}

export async function reviewException(exceptionId: string, action: "approve" | "reject" | "unresolved") {
  const events = await listEvents();
  const edges = await listEdges();
  const exceptions = await listExceptions();
  const exception = exceptions.find((item) => item.id === exceptionId);
  if (!exception) throw new Error("Exception not found");

  const decidedAt = new Date().toISOString();
  const edge = pickEdge(exception, edges);
  const decisionId = `dec_${exceptionId}_${decidedAt}`;
  let policyId: string | undefined;

  if (action === "approve" && edge) {
    const from = events.find((event) => event.id === edge.fromEventId);
    const to = events.find((event) => event.id === edge.toEventId);
    if (from && to) {
      const policy = policyFromApproval({
        exception,
        edge,
        from,
        to,
        decidedAt,
        decisionId,
      });
      await savePolicy(policy);
      policyId = policy.id;
    }
  }

  await saveDecision({
    id: decisionId,
    exceptionId,
    action,
    edgeId: edge?.id,
    policyId,
    decidedAt,
  });

  return { decisionId, policyId };
}

export async function ingestDodoEvent(payload: unknown) {
  const result = parseDodoEvents(payload);
  for (const event of result.events) {
    await upsertEvent({ ...event, metadata: { ...event.metadata, ingested: "webhook" } });
  }
  return result;
}

const emptyEvaluation = {
  precision: 0,
  recall: 0,
  payoutCoverage: 0,
  residualAmount: 0,
  falseAutoMatchCount: 0,
  falseAutoMatchRate: 0,
  humanReviewCount: 0,
  autonomousReconciliationCoverage: 0,
  predictedCount: 0,
  truthCount: 0,
  correctCount: 0,
};

export function emptySnapshot(error?: string) {
  return {
    company: "DriftRecon",
    events: [],
    edges: [],
    exceptions: [],
    policies: [],
    invalidRows: [],
    decisions: [],
    run: null,
    overview: overviewMetrics([], [], []),
    evaluation: { driftrecon: emptyEvaluation, baseline: emptyEvaluation },
    validations: [],
    error,
  };
}

export async function snapshot() {
  try {
    const events = await listEvents();
    const edges = await listEdges();
    const exceptions = await listExceptions();
    const policies = await listPolicies();
    const invalidRows = await listInvalidRows();
    const truth = await loadGroundTruth();
    const metrics = overviewMetrics(events, edges, exceptions);
    const drift = evaluatePredictions(
      edges,
      truth,
      events,
      exceptions.filter((item) => item.status === "open").length,
    );
    const baseline = evaluatePredictions(runBaseline(events), truth, events, 0);

    return {
      company: "DriftRecon",
      events,
      edges,
      exceptions,
      policies,
      invalidRows,
      decisions: await listDecisions(),
      run: await latestRun(),
      overview: metrics,
      evaluation: { driftrecon: drift, baseline },
      validations: events
        .filter((event) => event.kind === "payout")
        .map((payout) => validatePayout(payout, events, edges)),
      error: undefined as string | undefined,
    };
  } catch (error) {
    return emptySnapshot(error instanceof Error ? error.message : "Database unavailable");
  }
}

function pickEdge(exception: ExceptionRecord, edges: MatchEdge[]) {
  if (exception.agentRecommendation?.proposedEdgeId) {
    return edges.find((edge) => edge.id === exception.agentRecommendation?.proposedEdgeId);
  }
  if (exception.candidateEdgeIds[0]) {
    return edges.find((edge) => edge.id === exception.candidateEdgeIds[0]);
  }
  return undefined;
}

export async function eventById(id: string): Promise<LedgerEvent | undefined> {
  return (await listEvents()).find((event) => event.id === id);
}
