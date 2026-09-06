import { ImportPanel } from "@/components/dashboard/import-panel";
import { Money } from "@/components/money";
import { RunButton } from "@/components/run-button";
import type { snapshot } from "@/lib/app/actions";
import Link from "next/link";
import type { ReactNode } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

const SOURCE_MARKS = [
  { source: "stripe", src: "/logos/stripe.svg", alt: "Stripe" },
  { source: "gumroad", src: "/logos/gumroad.svg", alt: "Gumroad" },
  { source: "dodo", src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { source: "bank", src: "/logos/chase.svg", alt: "Bank" },
] as const;

export function Overview({ data }: { data: Snapshot }) {
  const open = data.exceptions.filter((item) => item.status === "open" || item.status === "unresolved").length;

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
            {data.run ? " · reconciled" : " · not reconciled yet"}
          </p>
        </div>
        <RunButton />
      </section>

      <ImportPanel />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Total" value={<Money minor={data.overview.totalFinancialValue} currency="USD" />} />
        <Metric label="Reconciled" value={<Money minor={data.overview.reconciledValue} currency="USD" />} />
        <Metric label="Unresolved" value={<Money minor={data.overview.unresolvedValue} currency="USD" />} />
      </section>

      {open > 0 ? (
        <Link href="/review" className="text-sm underline-offset-4 hover:underline">
          Review {open} {open === 1 ? "case" : "cases"}
        </Link>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="border border-black/15 bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums">{value}</p>
    </article>
  );
}
