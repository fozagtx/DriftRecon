import { Money, Percent } from "@/components/money";
import type { snapshot } from "@/lib/app/actions";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

export function EvaluationView({ data }: { data: Snapshot }) {
  const rows = [
    ["Precision", data.evaluation.driftrecon.precision, data.evaluation.baseline.precision, "ratio"],
    ["Recall", data.evaluation.driftrecon.recall, data.evaluation.baseline.recall, "ratio"],
    ["Payout coverage", data.evaluation.driftrecon.payoutCoverage, data.evaluation.baseline.payoutCoverage, "ratio"],
    ["Residual amount", data.evaluation.driftrecon.residualAmount, data.evaluation.baseline.residualAmount, "money"],
    ["False auto-match count", data.evaluation.driftrecon.falseAutoMatchCount, data.evaluation.baseline.falseAutoMatchCount, "int"],
    ["False auto-match rate", data.evaluation.driftrecon.falseAutoMatchRate, data.evaluation.baseline.falseAutoMatchRate, "ratio"],
    ["Human review count", data.evaluation.driftrecon.humanReviewCount, data.evaluation.baseline.humanReviewCount, "int"],
    [
      "Autonomous coverage",
      data.evaluation.driftrecon.autonomousReconciliationCoverage,
      data.evaluation.baseline.autonomousReconciliationCoverage,
      "ratio",
    ],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Evaluation</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">DriftRecon vs baseline</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Metrics are calculated from this run&apos;s predictions. Ground truth is not available during matching. Hard-coded benchmarks are forbidden.
        </p>
      </section>

      {data.events.length === 0 ? (
        <p className="border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">Run reconciliation to compute metrics.</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">DriftRecon</th>
                <th className="px-3 py-2">Baseline</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, drift, base, kind]) => (
                <tr key={label} className="border-t border-border">
                  <td className="px-3 py-2">{label}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{render(drift, kind)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{render(base, kind)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function render(value: number, kind: "ratio" | "money" | "int") {
  if (kind === "ratio") return <Percent value={value} />;
  if (kind === "money") return <Money minor={value} currency="USD" />;
  return value;
}
