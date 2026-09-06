import { TransactionGraph } from "@/components/graph/transaction-graph";
import { snapshot } from "@/lib/app/actions";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const data = await snapshot();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Transaction graph</p>
        <h2 className="mt-1 font-[family-name:var(--font-newsreader)] text-2xl">Sale to bank</h2>
      </div>
      <TransactionGraph events={data.events} edges={data.edges} />
    </div>
  );
}
