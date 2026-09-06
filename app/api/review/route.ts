import { reviewException, snapshot } from "@/lib/app/actions";
import { reviewActionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = reviewActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await reviewException(parsed.data.exceptionId, parsed.data.action);
  return Response.json({ ...result, state: await snapshot() });
}
