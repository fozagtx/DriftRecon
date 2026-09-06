import { ImportPanel } from "@/components/dashboard/import-panel";
import { Money, Percent } from "@/components/money";
import { RunButton } from "@/components/run-button";
import type { snapshot } from "@/lib/app/actions";
import Link from "next/link";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

const SOURCE_MARKS = [
  { source: "stripe", src: "/logos/stripe.svg", alt: "Stripe" },
  { source: "gumroad", src: "/logos/gumroad.svg", alt: "Gumroad" },
  { source: "dodo", src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { source: "bank", src: "/logos/chase.svg", alt: "Bank" },
] as const;

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
  const open = data.exceptions.filter((item) => item.status === "open" || item.status === "unresolved");

  return (
    <div className="flex flex-col gap-8">
      {data.error ? (
        <section className="border border-destructive bg-white p-4 text-sm text-destructive">
          {data.error}
        </section>
      ) : null}

      <section className="flex flex-col gap-4 border border-black/15 bg-white p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Overview</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Payment events to bank deposits</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.events.length} imported
            {data.invalidRows.length ? ` · ${data.invalidRows.length} invalid retained` : ""}
            {data.run ? " · reconciled" : " · not reconciled yet"}
          </p>
        </div>
        <RunButton />
      </section>

      <ImportPanel />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {SOURCE_MARKS.map((mark) => {
          const count = data.events.filter((event) => event.source === mark.source).length;
          return (
            <article key={mark.source} className="flex items-center justify-between border border-black/15 bg-white px-4 py-3">
              <img src={mark.src} alt={mark.alt} className="h-5 w-auto" />
              <p className="font-mono text-lg tabular-nums">{count}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="border border-black/15 bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
            <p className="mt-2 font-mono text-2xl tabular-nums">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-base font-medium">Open review</h3>
          {open.length > 0 ? (
            <Link href="/review" className="text-sm underline-offset-4 hover:underline">
              {open.length} {open.length === 1 ? "case" : "cases"}
            </Link>
          ) : null}
        </div>
        {open.length === 0 ? (
          <p className="border border-black/15 bg-white p-4 text-sm text-muted-foreground">
            No open cases. Import files, then run reconciliation.
          </p>
        ) : (
          <ul className="border border-black/15 bg-white">
            {open.slice(0, 6).map((exception) => (
              <li key={exception.id} className="flex items-center justify-between gap-4 border-t border-black/10 px-4 py-3 first:border-t-0">
                <span className="text-sm">{exception.summary}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{exception.type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
