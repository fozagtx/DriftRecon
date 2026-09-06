import { Money, Percent } from "@/components/money";
import { RunButton } from "@/components/run-button";
import type { snapshot } from "@/lib/app/actions";
import { formatMinor } from "@/lib/money";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

export function Overview({ data }: { data: Snapshot }) {
  const metrics = [
    { label: "Total financial value", value: <Money minor={data.overview.totalFinancialValue} currency="USD" /> },
    { label: "Reconciled value", value: <Money minor={data.overview.reconciledValue} currency="USD" /> },
    { label: "Unresolved value", value: <Money minor={data.overview.unresolvedValue} currency="USD" /> },
    { label: "Autonomous coverage", value: <Percent value={data.overview.autonomousCoverage} /> },
    { label: "Transactions", value: data.overview.transactionCount },
    { label: "Payouts", value: data.overview.payoutCount },
    { label: "Bank deposits", value: data.overview.bankDepositCount },
    { label: "Exceptions", value: data.overview.exceptionCount },
    { label: "Human review", value: data.overview.humanReviewCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      {data.error ? (
        <section className="border border-destructive bg-card p-4 text-sm text-destructive-foreground">
          {data.error}
        </section>
      ) : null}

      <section className="flex flex-col gap-4 border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {data.events.length === 0 ? "Import the demo dataset and reconcile" : "Payment events to bank deposits"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {data.invalidRows.length} invalid row{data.invalidRows.length === 1 ? "" : "s"} retained.
            {data.run ? ` Last run ${data.run.id}.` : " No run yet."}
          </p>
        </div>
        <RunButton />
      </section>

      {data.events.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
                <p className="mt-2 font-mono text-2xl tabular-nums">{metric.value}</p>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-medium">Exceptions</h3>
            {data.exceptions.length === 0 ? (
              <p className="border border-border bg-card p-4 text-sm text-muted-foreground">No exceptions. Run reconciliation.</p>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-secondary text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Summary</th>
                      <th className="px-3 py-2">Confidence</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.exceptions.map((exception) => (
                      <tr key={exception.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-xs">{exception.type}</td>
                        <td className="px-3 py-2">{exception.summary}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{exception.confidence.toFixed(2)}</td>
                        <td className="px-3 py-2">{exception.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-medium">Imported transactions</h3>
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">External</th>
                    <th className="px-3 py-2">Parent</th>
                    <th className="px-3 py-2">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((event) => (
                    <tr key={event.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-xs">{event.id}</td>
                      <td className="px-3 py-2">{event.source}</td>
                      <td className="px-3 py-2">{event.kind}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatMinor(event.amount, event.currency)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{event.occurredAt.slice(0, 10)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{event.externalRef ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{event.parentRef ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{event.payoutRef ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <section className="border border-dashed border-border bg-card p-8">
      <h3 className="text-base font-medium">No transactions loaded</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Run reconciliation to import Stripe, Gumroad, Dodo, and bank CSVs. Invalid rows stay visible.
      </p>
    </section>
  );
}
