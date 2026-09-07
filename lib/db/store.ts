import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "../config";
import type {
  ExceptionRecord,
  GroundTruthEdge,
  HumanDecision,
  InvalidRow,
  LedgerEvent,
  MatchEdge,
  ReconciliationPolicy,
  ReconciliationRun,
  RunArchive,
} from "../types";

type Sql = NeonQueryFunction<false, false>;

let sql: Sql | null = null;
let schemaReady = false;

/** Host, database, and role live in lib/config.ts. Only the password is a secret. */
function databaseUrl(): string {
  const password = process.env.NEON_PASSWORD;
  if (!password) {
    throw new Error("NEON_PASSWORD is required. Host and database come from lib/config.ts.");
  }
  const { host, database, role } = config.neon;
  return `postgresql://${encodeURIComponent(role)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
}

function getSql(): Sql {
  if (sql) return sql;
  sql = neon(databaseUrl());
  return sql;
}

async function ensureSchema(): Promise<Sql> {
  const client = getSql();
  if (schemaReady) return client;
  await client`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS invalid_rows (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS edges (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS exceptions (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS policies (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS decisions (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS run_archives (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, payload JSONB NOT NULL)`;
  schemaReady = true;
  return client;
}

async function writeAll(table: "events" | "invalid_rows" | "edges" | "exceptions" | "policies" | "decisions" | "runs", rows: Array<{ id: string }>): Promise<void> {
  const client = await ensureSchema();
  switch (table) {
    case "events":
      await client`DELETE FROM events`;
      break;
    case "invalid_rows":
      await client`DELETE FROM invalid_rows`;
      break;
    case "edges":
      await client`DELETE FROM edges`;
      break;
    case "exceptions":
      await client`DELETE FROM exceptions`;
      break;
    case "policies":
      await client`DELETE FROM policies`;
      break;
    case "decisions":
      await client`DELETE FROM decisions`;
      break;
    case "runs":
      await client`DELETE FROM runs`;
      break;
  }
  for (const row of rows) {
    await upsertRow(table, row.id, row);
  }
}

async function upsertRow(table: string, id: string, payload: unknown): Promise<void> {
  const client = await ensureSchema();
  const body = payload as Record<string, unknown>;
  switch (table) {
    case "events":
      await client`INSERT INTO events (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "invalid_rows":
      await client`INSERT INTO invalid_rows (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "edges":
      await client`INSERT INTO edges (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "exceptions":
      await client`INSERT INTO exceptions (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "policies":
      await client`INSERT INTO policies (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "decisions":
      await client`INSERT INTO decisions (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "runs":
      await client`INSERT INTO runs (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    case "run_archives":
      await client`INSERT INTO run_archives (id, payload) VALUES (${id}, ${body}) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`;
      return;
    default:
      throw new Error(`Unknown table ${table}`);
  }
}

async function readAll<T>(table: "events" | "invalid_rows" | "edges" | "exceptions" | "policies" | "decisions"): Promise<T[]> {
  const client = await ensureSchema();
  const rows =
    table === "events"
      ? await client`SELECT payload FROM events`
      : table === "invalid_rows"
        ? await client`SELECT payload FROM invalid_rows`
        : table === "edges"
          ? await client`SELECT payload FROM edges`
          : table === "exceptions"
            ? await client`SELECT payload FROM exceptions`
            : table === "policies"
              ? await client`SELECT payload FROM policies`
              : await client`SELECT payload FROM decisions`;
  return rows.map((row) => row.payload as T);
}

export async function replaceEvents(events: LedgerEvent[], invalidRows: InvalidRow[]): Promise<void> {
  await writeAll("events", events);
  await writeAll("invalid_rows", invalidRows);
}

export async function listEvents(): Promise<LedgerEvent[]> {
  return readAll<LedgerEvent>("events");
}

export async function listInvalidRows(): Promise<InvalidRow[]> {
  return readAll<InvalidRow>("invalid_rows");
}

export async function upsertEvent(event: LedgerEvent): Promise<void> {
  await upsertRow("events", event.id, event);
}

async function setLatestRun(run: ReconciliationRun): Promise<void> {
  const client = await ensureSchema();
  await client`INSERT INTO meta (key, payload) VALUES ('latest_run', ${run as unknown as Record<string, unknown>}) ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload`;
}

async function saveRunArchive(archive: RunArchive): Promise<void> {
  const run: ReconciliationRun = { ...archive.run, archived: true };
  await upsertRow("run_archives", run.id, { ...archive, run });
  await upsertRow("runs", run.id, run);
}

export async function replaceGraph(edges: MatchEdge[], exceptions: ExceptionRecord[], run: ReconciliationRun): Promise<void> {
  await writeAll("edges", edges);
  await writeAll("exceptions", exceptions);
  await saveRunArchive({
    run,
    events: await listEvents(),
    invalidRows: await listInvalidRows(),
    edges,
    exceptions,
    policies: await listPolicies(),
    decisions: await listDecisions(),
    groundTruth: await loadGroundTruth(),
  });
  await setLatestRun({ ...run, archived: true });
}

export async function restoreRunArchive(runId: string): Promise<boolean> {
  const client = await ensureSchema();
  const rows = await client`SELECT payload FROM run_archives WHERE id = ${runId}`;
  const archive = rows[0]?.payload as RunArchive | undefined;
  if (!archive?.run) return false;
  await writeAll("events", archive.events ?? []);
  await writeAll("invalid_rows", archive.invalidRows ?? []);
  await writeAll("edges", archive.edges ?? []);
  await writeAll("exceptions", archive.exceptions ?? []);
  await writeAll("policies", archive.policies ?? []);
  await writeAll("decisions", archive.decisions ?? []);
  if (archive.groundTruth?.length) {
    await saveGroundTruth(archive.groundTruth);
  } else {
    await client`DELETE FROM meta WHERE key = ${"ground_truth"}`;
  }
  await upsertRow("runs", archive.run.id, { ...archive.run, archived: true });
  await setLatestRun(archive.run);
  return true;
}

export async function listEdges(): Promise<MatchEdge[]> {
  return readAll<MatchEdge>("edges");
}

export async function listExceptions(): Promise<ExceptionRecord[]> {
  return readAll<ExceptionRecord>("exceptions");
}

export async function listPolicies(): Promise<ReconciliationPolicy[]> {
  return readAll<ReconciliationPolicy>("policies");
}

export async function listDecisions(): Promise<HumanDecision[]> {
  return readAll<HumanDecision>("decisions");
}

export async function savePolicy(policy: ReconciliationPolicy): Promise<void> {
  await upsertRow("policies", policy.id, policy);
}

export async function saveDecision(decision: HumanDecision): Promise<void> {
  await upsertRow("decisions", decision.id, decision);
}

/** Persist the human's verdict on both sides of a review case immediately. */
export async function saveReviewOutcome(
  exception: ExceptionRecord,
  edge: MatchEdge | undefined,
  action: HumanDecision["action"],
  policyId?: string,
): Promise<void> {
  await upsertRow("exceptions", exception.id, {
    ...exception,
    status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "unresolved",
  });
  if (edge && action !== "unresolved") {
    await upsertRow("edges", edge.id, {
      ...edge,
      status: action === "approve" ? "approved" : "rejected",
      ...(action === "approve" && policyId !== undefined ? { policyId } : {}),
    });
  }
}

export async function listRuns(): Promise<ReconciliationRun[]> {
  const client = await ensureSchema();
  const rows = await client`SELECT payload FROM runs ORDER BY payload->>'ranAt' DESC`;
  return rows.map((row) => row.payload as ReconciliationRun);
}

export async function latestRun(): Promise<ReconciliationRun | null> {
  const client = await ensureSchema();
  const rows = await client`SELECT payload FROM meta WHERE key = 'latest_run'`;
  return rows[0] ? (rows[0].payload as ReconciliationRun) : null;
}

export async function saveGroundTruth(edges: GroundTruthEdge[]): Promise<void> {
  const client = await ensureSchema();
  const payload = { items: edges };
  await client`INSERT INTO meta (key, payload) VALUES ('ground_truth', ${payload}) ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload`;
}

export async function loadGroundTruth(): Promise<GroundTruthEdge[]> {
  const client = await ensureSchema();
  const rows = await client`SELECT payload FROM meta WHERE key = 'ground_truth'`;
  const payload = rows[0]?.payload as { items?: GroundTruthEdge[] } | GroundTruthEdge[] | undefined;
  if (!payload) return [];
  return Array.isArray(payload) ? payload : (payload.items ?? []);
}

export async function resetPredictions(): Promise<void> {
  const client = await ensureSchema();
  await client`DELETE FROM edges`;
  await client`DELETE FROM exceptions`;
}

export async function clearLedger(): Promise<void> {
  const client = await ensureSchema();
  await client`DELETE FROM events`;
  await client`DELETE FROM invalid_rows`;
  await client`DELETE FROM edges`;
  await client`DELETE FROM exceptions`;
  await client`DELETE FROM policies`;
  await client`DELETE FROM decisions`;
  await client`DELETE FROM meta WHERE key IN ('ground_truth', 'latest_run')`;
}
