import { reconcile } from "@/lib/app/actions";

export async function POST() {
  const data = await reconcile();
  return Response.json(data);
}
