import { ReviewQueue } from "@/components/review/review-queue";
import { snapshot } from "@/lib/app/actions";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  return <ReviewQueue data={await snapshot()} />;
}
