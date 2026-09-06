import { ImportPanel } from "@/components/dashboard/import-panel";
import { Money, Percent } from "@/components/money";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { snapshot } from "@/lib/app/actions";
import type { ReactNode } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

const SOURCES = [
  { key: "stripe", label: "Stripe" },
  { key: "gumroad", label: "Gumroad" },
  { key: "dodo", label: "Dodo" },
  { key: "bank", label: "Bank" },
] as const;

export function Overview({ data }: { data: Snapshot }) {
  const counts = new Map<string, number>();
  for (const event of data.events) counts.set(event.source, (counts.get(event.source) ?? 0) + 1);
  const hasEvents = data.events.length > 0;
  const hasRun = data.run !== null;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Card className="rounded-none border-black/15 py-0 lg:order-1">
          <CardContent className="flex h-full flex-col gap-6 p-5">
            <Figure
              label="Total"
              size="lg"
              value={hasEvents ? <Money minor={data.overview.totalFinancialValue} currency="USD" /> : "—"}
            />
            <div className="grid grid-cols-2 gap-4">
              <Figure label="Reconciled" value={hasRun ? <Money minor={data.overview.reconciledValue} currency="USD" /> : "—"} />
              <Figure label="Unresolved" value={hasRun ? <Money minor={data.overview.unresolvedValue} currency="USD" /> : "—"} />
            </div>

            <dl className="mt-auto grid grid-cols-4 gap-4 border-t border-black/10 pt-4">
              {SOURCES.map((source) => (
                <div key={source.key}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{source.label}</dt>
                  <dd className="mt-1 font-mono text-lg tabular-nums">{hasEvents ? (counts.get(source.key) ?? 0) : "—"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="lg:order-2">
          <ImportPanel canReconcile={hasEvents} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Runs</h2>
        <Card className="rounded-none border-black/15 py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <Head>#</Head>
                  <Head>Ran</Head>
                  <Head align="right">Events</Head>
                  <Head align="right">Edges</Head>
                  <Head align="right">Auto</Head>
                  <Head align="right">Review</Head>
                  <Head align="right">Exceptions</Head>
                  <Head align="right">Auto rate</Head>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.runs.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No runs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  data.runs.map((run, index) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-mono tabular-nums text-muted-foreground">{data.runs.length - index}</TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {new Date(run.ranAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </TableCell>
                      <Num>{run.eventCount}</Num>
                      <Num>{run.edgeCount}</Num>
                      <Num>{run.autoCount}</Num>
                      <Num>{run.reviewCount}</Num>
                      <Num>{run.exceptionCount}</Num>
                      <TableCell className="text-right">
                        <Percent value={run.edgeCount === 0 ? 0 : run.autoCount / run.edgeCount} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Figure({ label, value, size = "md" }: { label: string; value: ReactNode; size?: "md" | "lg" }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-mono tabular-nums ${size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{value}</p>
    </div>
  );
}

function Head({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <TableHead className={`font-mono text-[10px] uppercase tracking-[0.12em] ${align === "right" ? "text-right" : ""}`}>
      {children}
    </TableHead>
  );
}

function Num({ children }: { children: number }) {
  return <TableCell className="text-right font-mono tabular-nums">{children}</TableCell>;
}
