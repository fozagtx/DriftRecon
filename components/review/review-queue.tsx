"use client";

import { formatMinor } from "@/lib/money";
import type { snapshot } from "@/lib/app/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Snapshot = Awaited<ReturnType<typeof snapshot>>;

export function ReviewQueue({ data }: { data: Snapshot }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const eventsById = new Map(data.events.map((event) => [event.id, event]));
  const edgesById = new Map(data.edges.map((edge) => [edge.id, edge]));
  const open = data.exceptions.filter((item) => item.status === "open" || item.status === "unresolved");

  async function decide(exceptionId: string, action: "approve" | "reject" | "unresolved") {
    setError(null);
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exceptionId, action }),
    });
    if (!response.ok) {
      setError("Decision failed. Retry.");
      return;
    }
    router.refresh();
  }

  if (data.events.length === 0) {
    return (
      <section className="border border-dashed border-border bg-card p-8">
        <h2 className="text-base font-medium">Review queue empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Load Acme and run reconciliation first.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Review queue</p>
        <h2 className="mt-1 font-[family-name:var(--font-newsreader)] text-2xl">Agent recommendations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Approve creates a constrained policy. The agent cannot approve its own case.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </section>

      {open.length === 0 ? (
        <p className="border border-border bg-card p-6 text-sm text-muted-foreground">No open review cases.</p>
      ) : null}

      {open.map((exception) => {
        const edge = edgesById.get(exception.agentRecommendation?.proposedEdgeId ?? exception.candidateEdgeIds[0] ?? "");
        const related = exception.relatedEventIds.map((id) => eventsById.get(id)).filter(Boolean);
        const validation = exception.validation ?? data.validations.find((item) => exception.relatedEventIds.includes(item.payoutEventId ?? ""));
        return (
          <article key={exception.id} className="flex flex-col gap-4 border border-border bg-card p-5">
            <header className="flex flex-col gap-1">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{exception.type}</p>
              <h3 className="text-base font-medium">{exception.summary}</h3>
              <p className="text-sm text-muted-foreground">{exception.agentRecommendation?.recommendation ?? exception.recommendation}</p>
            </header>
            <dl className="grid gap-3 md:grid-cols-2">
              {related.map((event) =>
                event ? (
                  <div key={event.id} className="border border-border p-3 text-sm">
                    <p className="font-mono text-xs">{event.id}</p>
                    <p>
                      {event.source} · {event.kind} · {formatMinor(event.amount, event.currency)} {event.currency}
                    </p>
                    <p className="text-muted-foreground">{event.occurredAt.slice(0, 10)}</p>
                  </div>
                ) : null,
              )}
            </dl>
            <p className="font-mono text-xs">
              Candidate: {edge ? `${edge.relationship} ${edge.fromEventId} → ${edge.toEventId}` : "none"}
            </p>
            <p className="font-mono text-xs">Confidence {exception.confidence.toFixed(2)}</p>
            <p className="text-sm">
              Financial validation:{" "}
              {validation ? (validation.balanced ? "balanced" : `residual ${validation.residualMinor}`) : "not a payout case"}
            </p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {exception.evidence.slice(0, 8).map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  {item.label}: {item.detail}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-10 items-center bg-primary px-3 text-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => decide(exception.id, "approve")}
              >
                Approve
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center border border-border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => decide(exception.id, "reject")}
              >
                Reject
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center border border-border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => decide(exception.id, "unresolved")}
              >
                Leave Unresolved
              </button>
            </div>
          </article>
        );
      })}

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-medium">Approved policies</h3>
        {data.policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet. Approve a review case to create one.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.policies.map((policy) => (
              <li key={policy.id} className="border border-border bg-card p-4 text-sm">
                <p className="font-mono text-xs">{policy.id}</p>
                <p>
                  {policy.source} · {policy.eventKind} · {policy.action}
                </p>
                <p className="text-muted-foreground">{policy.conditions.map((item) => item.type).join(" · ")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
