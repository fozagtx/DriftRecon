import { Overview } from "@/components/dashboard/overview";
import { snapshot } from "@/lib/app/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await snapshot();
  return <Overview data={data} />;
}
