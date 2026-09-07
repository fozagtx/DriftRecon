import { ImportPanel } from "@/components/dashboard/import-panel";
import { Money, Percent } from "@/components/money";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { snapshot } from "@/lib/app/actions";
import { ArrowRight, Building2, CircleAlert, ClipboardCheck, Landmark, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

const SOURCES = ["stripe", "gumroad", "dodo", "bank"] as const;

export function Overview({ data }: { data: Snapshot }) {
  const counts = new Map<string, number>();
  for (const event of data.events) counts.set(event.source, (counts.get(event.source) ?? 0) + 1);
  const hasEvents = data.events.length > 0;
  const run = data.run;
  const hasRun = run !== null;
  const isRunStale = run !== null && run.eventCount !== data.events.length;
  const openReviews = data.exceptions.filter((item) => item.status === "open").length;

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><Building2 className="h-3.5 w-3.5" />Acme Creator Co.</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Revenue reconciliation</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Upload processor and bank activity. DriftRecon connects fees, refunds, disputes, FX, payouts, and deposits; only uncertain matches go to a human.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${isRunStale ? "bg-accent" : hasRun ? "bg-reconciled" : "bg-muted-foreground/50"}`} />
          {isRunStale ? "Update available" : hasRun ? "Ledger current" : "Awaiting first run"}
        </div>
      </header>

      <section aria-labelledby="import-heading">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 id="import-heading" className="text-sm font-semibold">Source data</h2>
          </div>
          {hasEvents ? <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{data.events.length} events ready</span> : null}
        </div>
        <ImportPanel compact canReconcile={hasEvents} showSources={!hasEvents} hasRun={hasRun} isRunStale={isRunStale} />
      </section>

      {!hasEvents ? (
        <section className="rounded-xl border bg-card shadow-[0_1px_3px_hsla(0,0%,0%,.08)] p-5 text-sm leading-6 text-muted-foreground">
          Importing never changes source amounts. Load the Acme example to explore the complete sale → payout → bank workflow without preparing files.
        </section>
      ) : (
        <>
          <section aria-labelledby="summary-heading">
            <div className="mb-3 flex items-center justify-between"><h2 id="summary-heading" className="text-sm font-semibold">Ledger summary</h2><span className="text-xs text-muted-foreground">USD · all imported activity</span></div>
            <Card className="overflow-hidden rounded-xl border py-0 shadow-[0_1px_2px_hsla(220,28%,10%,.05)]">
              <CardContent className="grid p-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
                <Metric label="Financial value" value={<Money minor={data.overview.totalFinancialValue} currency="USD" />} />
                <Metric label="Reconciled" value={hasRun ? <Money minor={data.overview.reconciledValue} currency="USD" /> : "—"} muted={!hasRun} />
                <Metric label="Unresolved" value={hasRun ? <Money minor={data.overview.unresolvedValue} currency="USD" /> : "—"} muted={!hasRun} />
                <Metric label="Autonomous coverage" value={hasRun ? <Percent value={data.overview.autonomousCoverage} /> : "—"} muted={!hasRun} />
              </CardContent>
              <div className="grid grid-cols-2 border-t bg-secondary/25 sm:grid-cols-4">
                <Count icon={<RefreshCw />} label="Transactions" value={data.overview.transactionCount} />
                <Count icon={<Landmark />} label="Payouts" value={data.overview.payoutCount} />
                <Count icon={<Landmark />} label="Deposits" value={data.overview.bankDepositCount} />
                <Count icon={<CircleAlert />} label="Exceptions" value={hasRun ? data.overview.exceptionCount : "—"} />
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="rounded-xl border py-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div><h2 className="font-medium">Imported sources</h2><p className="mt-1 text-xs text-muted-foreground">Events are staged independently from reconciliation.</p></div>
                  <span className="font-mono text-xs text-muted-foreground">{data.events.length} events</span>
                </div>
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent"><Head>Source</Head><Head align="right">Events</Head><Head>Status</Head></TableRow></TableHeader>
                  <TableBody>
                    {SOURCES.map((source) => {
                      const count = counts.get(source) ?? 0;
                      return <TableRow key={source}><TableCell className="capitalize">{source}</TableCell><Num>{count}</Num><TableCell><span className={`font-mono text-[10px] uppercase tracking-wider ${count > 0 ? "text-reconciled" : "text-muted-foreground"}`}>{count > 0 ? "Imported" : "Not imported"}</span></TableCell></TableRow>;
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <aside className="flex flex-col rounded-xl border bg-card shadow-[0_1px_3px_hsla(0,0%,0%,.08)] p-5">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Human approval</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{hasRun ? openReviews : "—"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{hasRun ? "Cases need a human decision before they can become approved policies." : "Run reconciliation to generate review cases."}</p>
              <ReviewQueueLink hasRun={hasRun} />
            </aside>
          </section>

          <Runs data={data} />
        </>
      )}
    </div>
  );
}

export function ReviewQueueLink({ hasRun }: { hasRun: boolean }) {
  const content = (
    <>
      <span>Open review queue</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </>
  );
  const className = "mt-6 inline-flex min-h-10 items-center justify-between border-t border-border pt-4 text-sm font-medium";

  return hasRun ? (
    <Link href="/review" className={className}>
      {content}
    </Link>
  ) : (
    <div className={`${className} text-muted-foreground`} aria-disabled="true">
      {content}
    </div>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: ReactNode; muted?: boolean }) {
  return <div className="border-b border-border p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className={`mt-2 font-mono text-xl tabular-nums sm:text-2xl ${muted ? "text-muted-foreground/55" : "text-foreground"}`}>{value}</p>{muted ? <p className="mt-1 text-[10px] text-muted-foreground">Available after first run</p> : null}</div>;
}

function Count({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="flex items-center gap-2.5 border-r border-border px-4 py-3 last:border-r-0 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-muted-foreground"><span>{icon}</span><span className="text-xs text-muted-foreground">{label}</span><strong className="ml-auto font-mono text-xs font-medium tabular-nums text-foreground">{value}</strong></div>;
}

function Runs({ data }: { data: Snapshot }) { return <section className="flex flex-col gap-3"><h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Run history</h2><Card className="rounded-xl border py-0"><CardContent className="p-0"><Table><TableHeader><TableRow className="hover:bg-transparent"><Head>Ran</Head><Head align="right">Events</Head><Head align="right">Edges</Head><Head align="right">Auto</Head><Head align="right">Review</Head><Head align="right">Exceptions</Head></TableRow></TableHeader><TableBody>{data.runs.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No reconciliation runs yet. Your imported events are ready.</TableCell></TableRow> : data.runs.map((run) => <TableRow key={run.id}><TableCell className="font-mono text-xs">{new Date(run.ranAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</TableCell><Num>{run.eventCount}</Num><Num>{run.edgeCount}</Num><Num>{run.autoCount}</Num><Num>{run.reviewCount}</Num><Num>{run.exceptionCount}</Num></TableRow>)}</TableBody></Table></CardContent></Card></section>; }
function Head({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) { return <TableHead className={`font-mono text-[10px] uppercase tracking-[0.12em] ${align === "right" ? "text-right" : ""}`}>{children}</TableHead>; }
function Num({ children }: { children: number }) { return <TableCell className="text-right font-mono tabular-nums">{children}</TableCell>; }
