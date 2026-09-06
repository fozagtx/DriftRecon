import { emptySnapshot, importUploads, snapshot } from "@/lib/app/actions";
import type { Source } from "@/lib/types";

type UploadKind = Source | "groundTruth";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const uploads: Partial<Record<UploadKind, string>> = {};

    for (const value of form.getAll("files")) {
      if (!(value instanceof File) || value.size === 0) continue;
      const text = await value.text();
      const kind = classifyUpload(value.name, text);
      uploads[kind] = text;
    }

    await importUploads(uploads);
    return Response.json(await snapshot());
  } catch (error) {
    return Response.json(
      emptySnapshot(error instanceof Error ? error.message : "Import failed"),
      { status: 400 },
    );
  }
}

function classifyUpload(name: string, text: string): UploadKind {
  const lower = name.toLowerCase();
  const trimmed = text.trim();
  const isJson = lower.endsWith(".json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (isJson) {
    if (lower.includes("truth") || looksLikeGroundTruth(trimmed)) return "groundTruth";
    return "dodo";
  }
  if (lower.includes("gumroad")) return "gumroad";
  if (lower.includes("bank") || lower.includes("chase")) return "bank";
  if (lower.includes("stripe")) return "stripe";

  const header = (text.split(/\r?\n/, 1)[0] ?? "").toLowerCase();
  if (header.includes("sale_id") || header.includes("email") || header.includes("product")) return "gumroad";
  if (header.includes("charge_id") || header.includes("parent_charge")) return "stripe";
  if (header.includes("reference") || (header.includes("date") && !header.includes("type"))) return "bank";
  return "stripe";
}

function looksLikeGroundTruth(text: string): boolean {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;
    const first: unknown = parsed[0];
    return typeof first === "object" && first !== null && "fromEventId" in first && "toEventId" in first && "relationship" in first;
  } catch {
    return false;
  }
}
