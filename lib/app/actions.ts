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
  saveGroundTruth,
  savePolicy,
  upsertEvent,
} from "../db/store";
import { runBaseline } from "../evaluation/baseline";
import { evaluatePredictions } from "../evaluation/metrics";
import { parseDodoEvents } from "../ingestion/dodo";
import { loadAcmeDataset } from "../ingestion/load-acme";
import { policyFromApproval } from "../policies/from-decision";
import { overviewMetrics } from "../reconciliation/overview";
import { runReconciliation } from "../reconciliation/pipeline";
import { validatePayout } from "../reconciliation/invariants";
import type { ExceptionRecord, LedgerEvent, MatchEdge } from "../types";

export async function importAcme() {
  const dataset = loadAcmeDataset();
  await replaceEvents(dataset.events, dataset.invalidRows);
  await saveGroundTruth(dataset.groundTruth);
  return {
    eventCount: dataset.events.length,
    invalidCount: dataset.invalidRows.length,
  };
}

export async function reconcile() {
  const extras = (await listEvents()).filter((event) => event.metadata?.ingested === "webhook");
  await importAcme();
  for (const extra of extras) await upsertEvent(extra);
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
