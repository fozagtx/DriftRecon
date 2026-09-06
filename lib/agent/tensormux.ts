import { agentRecommendationSchema } from "../schemas";
import type { AgentRecommendation } from "../types";

export interface TensorMuxConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function tensorMuxConfig(): TensorMuxConfig | null {
  const baseUrl = process.env.TENSORMUX_BASE_URL;
  const apiKey = process.env.TENSORMUX_API_KEY;
  const model = process.env.TENSORMUX_MODEL ?? "recon-agent";
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey, model };
}

export async function inferRecommendation(input: unknown, config: TensorMuxConfig): Promise<AgentRecommendation> {
  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return only JSON matching AgentRecommendation. You may inspect and rank. You may not change amounts, invent evidence, approve cases, or perform accounting arithmetic.",
        },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`TensorMux execution error: ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("TensorMux execution error: empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("TensorMux execution error: invalid JSON");
  }

  const validated = agentRecommendationSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("TensorMux execution error: response failed Zod validation");
  }
  return validated.data;
}
