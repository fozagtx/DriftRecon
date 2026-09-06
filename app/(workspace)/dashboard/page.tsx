import { Overview } from "@/components/dashboard/overview";
import { snapshot } from "@/lib/app/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return <Overview data={await snapshot()} />;
}
