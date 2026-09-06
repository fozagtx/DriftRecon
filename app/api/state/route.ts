import { snapshot } from "@/lib/app/actions";

export async function GET() {
  return Response.json(await snapshot());
}
