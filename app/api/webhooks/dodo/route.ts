import { ingestDodoEvent } from "@/lib/app/actions";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await ingestDodoEvent(payload);
  if (result.invalidRows.length > 0 && result.events.length === 0) {
    return Response.json({ invalidRows: result.invalidRows }, { status: 400 });
  }
  return Response.json({
    stored: result.events.map((event) => event.id),
    invalidRows: result.invalidRows,
  });
}
