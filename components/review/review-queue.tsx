"use client";

import { formatMinor } from "@/lib/money";
import type { snapshot } from "@/lib/app/actions";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;
type Exception = Snapshot["exceptions"][number];
type LedgerEvent = Snapshot["events"][number];

export function ReviewQueue({ data }: { data: Snapshot }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const eventsById = useMemo(() => new Map(data.events.map((event) => [event.id, event])), [data.events]);
  const edgesById = useMemo(() => new Map(data.edges.map((edge) => [edge.id, edge])), [data.edges]);
  const open = useMemo(
    () => data.exceptions.filter((item) => item.status === "open" || item.status === "unresolved"),
    [data.exceptions],
  );
  const [selectedId, setSelectedId] = useState(open[0]?.id ?? null);
  const current = open.find((item) => item.id === selectedId) ?? open[0] ?? null;
  const currentIndex = current ? open.findIndex((item) => item.id === current.id) : -1;

  async function decide(exceptionId: string, action: "approve" | "reject" | "unresolved") {
    setError(null);
    setPending(exceptionId);
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exceptionId, action }),
    });
    setPending(null);
    if (!response.ok) {
      setError("Decision failed. Retry.");
      return;
    }
    const remaining = open.filter((item) => item.id !== exceptionId);
    setSelectedId(remaining[0]?.id ?? null);
    router.refresh();
  }

  if (data.events.length === 0) {
    return (
      <section className="border border-dashed border-border bg-card p-8">
        <h2 className="text-base font-medium">Review queue empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Import data and run reconciliation from Overview first.</p>
      </section>
    );
  }

  if (!data.run) {
    return (
      <section className="border border-dashed border-border bg-card p-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Human approval</p>
        <h2 className="mt-2 text-xl font-medium">Reconciliation has not run</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your events are imported. Run reconciliation from Overview to create review cases.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Human approval</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {open.length} actionable {open.length === 1 ? "case" : "cases"}
        </h2>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </section>

      {current ? (
        <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <ol className="flex max-h-[70vh] flex-col gap-1 overflow-auto rounded-xl border bg-card shadow-[0_1px_3px_hsla(0,0%,0%,.08)] p-2">
            {open.map((exception, index) => (
              <li key={exception.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(exception.id)}
                  className={`flex min-h-10 w-full flex-col items-start px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring ${
                    exception.id === current.id ? "bg-secondary" : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {index + 1} · {exception.type}
                  </span>
                  <span className="mt-0.5 line-clamp-2">{exception.summary}</span>
                </button>
              </li>
            ))}
          </ol>

          <CaseCard
            exception={current}
            index={currentIndex}
            total={open.length}
            eventsById={eventsById}
            edgesById={edgesById}
            validations={data.validations}
            pending={pending === current.id}
            onDecide={decide}
          />
        </div>
      ) : (
        <p className="border border-border bg-card p-6 text-sm text-muted-foreground">No actionable review cases.</p>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-medium">Approved policies</h3>
        {data.policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet. Approve a case to create one.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.policies.map((policy) => (
              <li key={policy.id} className="border border-border bg-card px-4 py-3 text-sm">
                <p>
                  {policy.source} · {policy.eventKind} · {policy.action}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {policy.id} · {policy.conditions.map((item) => item.type).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function CaseCard({
  exception,
  index,
  total,
  eventsById,
  edgesById,
  validations,
  pending,
  onDecide,
}: {
  exception: Exception;
  index: number;
  total: number;
  eventsById: Map<string, LedgerEvent>;
  edgesById: Map<string, Snapshot["edges"][number]>;
  validations: Snapshot["validations"];
  pending: boolean;
  onDecide: (exceptionId: string, action: "approve" | "reject" | "unresolved") => void;
}) {
  const edge = edgesById.get(exception.agentRecommendation?.proposedEdgeId ?? exception.candidateEdgeIds[0] ?? "");
  const related = exception.relatedEventIds.map((id) => eventsById.get(id)).filter(Boolean);
  const validation =
    exception.validation ?? dataValidation(validations, exception.relatedEventIds);
  const agent = exception.agentRecommendation;
  const tools = [...(agent?.evidence ?? []), ...exception.evidence].filter((item) => item.kind === "tool" || item.kind === "reference");

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card shadow-[0_1px_3px_hsla(0,0%,0%,.08)] p-5">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Case {index + 1} of {total} · {exception.type}
        </p>
        <h3 className="text-base font-medium">{exception.summary}</h3>
      </header>

      <section className="border border-border bg-secondary p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recon Agent</p>
        <p className="mt-2 text-sm">{agent?.recommendation ?? exception.recommendation}</p>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          {edge ? `${edge.relationship} ${edge.fromEventId} → ${edge.toEventId}` : "No candidate edge"}
          {" · "}
          confidence {(agent?.confidence ?? exception.confidence).toFixed(2)}
          {validation
            ? ` · ${validation.balanced ? "balanced" : `residual ${validation.residualMinor}`}`
            : ""}
        </p>
      </section>

      <dl className="grid gap-2 sm:grid-cols-2">
        {related.map((event) =>
          event ? (
            <div key={event.id} className="border border-border p-3 text-sm">
              <p className="font-mono text-[10px] text-muted-foreground">{event.id}</p>
              <p className="mt-1">
                {event.source} · {event.kind} · {formatMinor(event.amount, event.currency)} {event.currency}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">{event.occurredAt.slice(0, 10)}</p>
            </div>
          ) : null,
        )}
      </dl>

      {tools.length > 0 ? (
        <details className="border border-border p-3">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Agent tools
          </summary>
          <ul className="mt-3 flex flex-col gap-1 font-mono text-[11px] text-muted-foreground">
            {tools.map((item, toolIndex) => (
              <li key={`${item.label}-${toolIndex}`}>
                {item.label}: {item.detail}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-10 items-center bg-primary px-3 text-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          onClick={() => onDecide(exception.id, "approve")}
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-10 items-center border border-border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          onClick={() => onDecide(exception.id, "reject")}
        >
          Reject
        </button>
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-10 items-center border border-border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          onClick={() => onDecide(exception.id, "unresolved")}
        >
          Leave Unresolved
        </button>
      </div>
    </article>
  );
}

function dataValidation(validations: Snapshot["validations"], relatedEventIds: string[]) {
  return validations.find((item) => relatedEventIds.includes(item.payoutEventId ?? ""));
}
