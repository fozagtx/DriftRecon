import { Money, Percent } from "@/components/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { snapshot } from "@/lib/app/actions";
import type { EvaluationMetrics } from "@/lib/types";
import { CheckCircle2, CircleDashed, FileJson } from "lucide-react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;
type Kind = "ratio" | "money" | "int";

type Row = {
  label: string;
  formula: string;
  key: keyof EvaluationMetrics;
  kind: Kind;
  needsTruth: boolean;
};

const ROWS: Row[] = [
  { label: "Predicted relationships", formula: "Active edges from this run", key: "predictedCount", kind: "int", needsTruth: false },
  { label: "Human review count", formula: "Open exceptions routed to a person", key: "humanReviewCount", kind: "int", needsTruth: false },
  { label: "Residual amount", formula: "Σ unexplained payout differences", key: "residualAmount", kind: "money", needsTruth: false },
  { label: "Precision", formula: "Correct ÷ predicted", key: "precision", kind: "ratio", needsTruth: true },
  { label: "Recall", formula: "Correct ÷ true relationships", key: "recall", kind: "ratio", needsTruth: true },
  { label: "Payout coverage", formula: "Explained payouts ÷ payouts", key: "payoutCoverage", kind: "ratio", needsTruth: true },
  { label: "False auto-match count", formula: "Incorrect automatic relationships", key: "falseAutoMatchCount", kind: "int", needsTruth: true },
  { label: "False auto-match rate", formula: "Incorrect automatic ÷ automatic", key: "falseAutoMatchRate", kind: "ratio", needsTruth: true },
  { label: "Autonomous coverage", formula: "Correct auto-reconciled value ÷ total value", key: "autonomousReconciliationCoverage", kind: "ratio", needsTruth: true },
];

export function EvaluationView({ data }: { data: Snapshot }) {
  const run = data.run;
  const truthCount = data.evaluation.driftrecon.truthCount;
  const hasTruth = truthCount > 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">DriftRecon vs baseline</h2>
        <div className="flex flex-wrap items-center gap-2">
          {run ? (
            <Badge variant="secondary" className="rounded-lg font-mono text-[11px] uppercase tracking-[0.08em]">
              <CheckCircle2 aria-hidden="true" />
              Ran {new Date(run.ranAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-lg font-mono text-[11px] uppercase tracking-[0.08em]">
              <CircleDashed aria-hidden="true" />
              Not run
            </Badge>
          )}
          <Badge variant={hasTruth ? "secondary" : "outline"} className="rounded-lg font-mono text-[11px] uppercase tracking-[0.08em]">
            <FileJson aria-hidden="true" />
            {hasTruth ? `${truthCount} ground-truth edges` : "No ground truth"}
          </Badge>
        </div>
      </section>

      <Card className="rounded-none py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.12em]">Metric</TableHead>
                <TableHead className="hidden font-mono text-[10px] uppercase tracking-[0.12em] sm:table-cell">Formula</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.12em]">DriftRecon</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.12em]">Baseline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => {
                const available = run !== null && (!row.needsTruth || hasTruth);
                return (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{row.formula}</TableCell>
                    <TableCell className="text-right">{available ? render(data.evaluation.driftrecon[row.key], row.kind) : <Dash />}</TableCell>
                    <TableCell className="text-right">{available ? render(data.evaluation.baseline[row.key], row.kind) : <Dash />}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Dash() {
  return <span className="font-mono tabular-nums text-muted-foreground">—</span>;
}

function render(value: number, kind: Kind) {
  if (kind === "ratio") return <Percent value={value} />;
  if (kind === "money") return <Money minor={value} currency="USD" />;
  return <span className="font-mono tabular-nums">{value}</span>;
}
