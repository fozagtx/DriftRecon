import { ImportPanel } from "@/components/dashboard/import-panel";
import { Money, Percent } from "@/components/money";
import { RunButton } from "@/components/run-button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { snapshot } from "@/lib/app/actions";
import { ArrowRight, CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

const SOURCES = ["stripe", "gumroad", "dodo", "bank"] as const;

export function Overview({ data }: { data: Snapshot }) {
  const counts = new Map<string, number>();
  for (const event of data.events) counts.set(event.source, (counts.get(event.source) ?? 0) + 1);
  const hasEvents = data.events.length > 0;
  const hasRun = data.run !== null;
  const isRunStale = hasRun && data.run.eventCount !== data.events.length;
  const hasCurrentRun = hasRun && !isRunStale;
  const openReviews = data.exceptions.filter((item) => item.status === "open").length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col justify-between gap-5 border-b border-black/15 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Acme Creator Co.</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Reconciliation overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Import payment and bank activity, run the deterministic engine, then approve uncertain relationships.
          </p>
        </div>
        {hasEvents ? <RunButton /> : null}
      </header>

      <ol className="grid border border-black/15 bg-white sm:grid-cols-3" aria-label="Reconciliation progress">
        <Step number="01" label="Import events" complete={hasEvents} active={!hasEvents} />
        <Step number="02" label="Run reconciliation" complete={hasCurrentRun} active={hasEvents && !hasCurrentRun} />
        <Step number="03" label="Human review" complete={hasCurrentRun && openReviews === 0} active={hasCurrentRun && openReviews > 0} />
      </ol>

      {!hasEvents ? (
        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.8fr)]">
          <div className="py-4 lg:py-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Start here</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">Bring in the ledger before any matching begins.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Load the Acme example or upload source files. Importing only stages events—the reconciliation runs when you choose Run Reconciliation.
            </p>
          </div>
          <ImportPanel />
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total financial value" value={<Money minor={data.overview.totalFinancialValue} currency="USD" />} prominent />
            <Metric label="Reconciled value" value={hasRun ? <Money minor={data.overview.reconciledValue} currency="USD" /> : "Not run"} />
            <Metric label="Unresolved value" value={hasRun ? <Money minor={data.overview.unresolvedValue} currency="USD" /> : "Not run"} />
            <Metric label="Autonomous coverage" value={hasRun ? <Percent value={data.overview.autonomousCoverage} /> : "Not run"} />
            <Metric label="Transactions" value={data.overview.transactionCount} />
            <Metric label="Payouts" value={data.overview.payoutCount} />
            <Metric label="Bank deposits" value={data.overview.bankDepositCount} />
            <Metric label="Exceptions / review" value={hasRun ? `${data.overview.exceptionCount} / ${data.overview.humanReviewCount}` : "Not run"} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="rounded-none border-black/15 py-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                  <div><h2 className="font-medium">Imported sources</h2><p className="mt-1 text-xs text-muted-foreground">Events are staged independently from reconciliation.</p></div>
                  <span className="font-mono text-xs text-muted-foreground">{data.events.length} events</span>
                </div>
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent"><Head>Source</Head><Head align="right">Events</Head><Head>Status</Head></TableRow></TableHeader>
                  <TableBody>{SOURCES.map((source) => <TableRow key={source}><TableCell className="capitalize">{source}</TableCell><Num>{counts.get(source) ?? 0}</Num><TableCell><span className="font-mono text-[10px] uppercase tracking-wider text-reconciled">Imported</span></TableCell></TableRow>)}</TableBody>
                </Table>
              </CardContent>
            </Card>

            <aside className="flex flex-col border border-black/15 bg-white p-5">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Human approval</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{hasRun ? openReviews : "—"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{hasRun ? "Cases need a human decision before they can become approved policies." : "Run reconciliation to generate review cases."}</p>
              <Link href="/review" className={`mt-6 inline-flex min-h-10 items-center justify-between border-t border-black/10 pt-4 text-sm font-medium ${!hasRun ? "pointer-events-none text-muted-foreground" : ""}`} aria-disabled={!hasRun}>
                Open review queue <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </section>

          <Runs data={data} />
          <div className="max-w-xl"><ImportPanel canReconcile={false} showSources={false} hasRun={hasRun} isRunStale={isRunStale} /></div>
        </>
      )}
    </div>
  );
}

function Step({ number, label, complete, active }: { number: string; label: string; complete: boolean; active: boolean }) {
  return <li className={`flex items-center gap-3 border-black/15 px-4 py-4 sm:border-r sm:last:border-r-0 ${active ? "bg-secondary" : ""}`}>{complete ? <CheckCircle2 className="h-4 w-4 text-reconciled" /> : <Circle className="h-4 w-4 text-muted-foreground" />}<span className="font-mono text-[10px] text-muted-foreground">{number}</span><span className="text-sm font-medium">{label}</span></li>;
}

function Metric({ label, value, prominent = false }: { label: string; value: ReactNode; prominent?: boolean }) {
  return <Card className={`rounded-none border-black/15 py-0 ${prominent ? "bg-primary text-primary-foreground" : ""}`}><CardContent className="p-5"><p className={`font-mono text-[10px] uppercase tracking-[0.12em] ${prominent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{label}</p><p className="mt-4 font-mono text-2xl tabular-nums">{value}</p></CardContent></Card>;
}

function Runs({ data }: { data: Snapshot }) { return <section className="flex flex-col gap-3"><h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Run history</h2><Card className="rounded-none border-black/15 py-0"><CardContent className="p-0"><Table><TableHeader><TableRow className="hover:bg-transparent"><Head>Ran</Head><Head align="right">Events</Head><Head align="right">Edges</Head><Head align="right">Auto</Head><Head align="right">Review</Head><Head align="right">Exceptions</Head></TableRow></TableHeader><TableBody>{data.runs.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No reconciliation runs yet. Your imported events are ready.</TableCell></TableRow> : data.runs.map((run) => <TableRow key={run.id}><TableCell className="font-mono text-xs">{new Date(run.ranAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</TableCell><Num>{run.eventCount}</Num><Num>{run.edgeCount}</Num><Num>{run.autoCount}</Num><Num>{run.reviewCount}</Num><Num>{run.exceptionCount}</Num></TableRow>)}</TableBody></Table></CardContent></Card></section>; }
function Head({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) { return <TableHead className={`font-mono text-[10px] uppercase tracking-[0.12em] ${align === "right" ? "text-right" : ""}`}>{children}</TableHead>; }
function Num({ children }: { children: number }) { return <TableCell className="text-right font-mono tabular-nums">{children}</TableCell>; }
