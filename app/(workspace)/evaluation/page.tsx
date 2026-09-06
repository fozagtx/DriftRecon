import { EvaluationView } from "@/components/evaluation/evaluation-view";
import { snapshot } from "@/lib/app/actions";

export const dynamic = "force-dynamic";

export default async function EvaluationPage() {
  return <EvaluationView data={await snapshot()} />;
}
