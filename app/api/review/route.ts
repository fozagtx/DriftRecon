import { reviewException, snapshot } from "@/lib/app/actions";
import { ReviewExceptionConflictError } from "@/lib/app/errors";
import { reviewActionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = reviewActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await reviewException(parsed.data.exceptionId, parsed.data.action);
    return Response.json({ ...result, state: await snapshot() });
  } catch (error) {
    if (error instanceof ReviewExceptionConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
