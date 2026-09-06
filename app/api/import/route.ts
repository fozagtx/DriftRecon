import { importAcme, snapshot } from "@/lib/app/actions";

export async function POST() {
  await importAcme();
  return Response.json(await snapshot());
}
