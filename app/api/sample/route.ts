import { emptySnapshot, loadSampleDataset, snapshot } from "@/lib/app/actions";

export async function POST() {
  try {
    await loadSampleDataset();
    return Response.json(await snapshot());
  } catch (error) {
    return Response.json(
      emptySnapshot(error instanceof Error ? error.message : "Sample load failed"),
      { status: 503 },
    );
  }
}
