import { emptySnapshot, reconcile } from "@/lib/app/actions";

export async function POST() {
  try {
    return Response.json(await reconcile());
  } catch (error) {
    return Response.json(
      emptySnapshot(error instanceof Error ? error.message : "Reconcile failed"),
      { status: 503 },
    );
  }
}
