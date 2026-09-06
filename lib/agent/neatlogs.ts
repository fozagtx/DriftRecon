import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { config } from "../config";

export interface AgentTrace {
  at: string;
  type:
    | "agent_execution"
    | "model_request"
    | "model_response"
    | "tool_call"
    | "tool_result"
    | "validation_error"
    | "agent_error"
    | "recommendation"
    | "confidence"
    | "human_review_escalation";
  exceptionId?: string;
  detail: unknown;
}

const TRACE_DIR = path.join(process.cwd(), "data", "traces");

export function recordTrace(trace: AgentTrace): void {
  mkdirSync(TRACE_DIR, { recursive: true });
  appendFileSync(path.join(TRACE_DIR, "neatlogs.jsonl"), `${JSON.stringify(trace)}\n`);
}

export async function emitNeatlogs(trace: AgentTrace): Promise<void> {
  recordTrace(trace);
  const apiKey = process.env.NEATLOGS_API_KEY;
  if (!apiKey) return;
  try {
    await fetch(config.neatlogs.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trace),
    });
  } catch {
    recordTrace({ at: new Date().toISOString(), type: "agent_error", detail: "Neatlogs emit failed" });
  }
}
