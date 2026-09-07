"use client";

import { formatMinor } from "@/lib/money";
import type { LedgerEvent, MatchEdge } from "@/lib/types";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

const KIND_COLUMN: Record<LedgerEvent["kind"], number> = {
  sale: 0,
  fee: 1,
  refund: 1,
  dispute: 1,
  fx_conversion: 2,
  payout: 3,
  bank_deposit: 4,
};

export function TransactionGraph({ events, edges }: { events: LedgerEvent[]; edges: MatchEdge[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = events.find((event) => event.id === selectedId) ?? null;
  const related = edges.filter((edge) => edge.fromEventId === selectedId || edge.toEventId === selectedId);

  const { nodes, flowEdges } = useMemo(() => buildGraph(events, edges), [events, edges]);

  if (events.length === 0) {
    return (
      <section className="border border-dashed border-border bg-card p-8">
        <h2 className="text-base font-medium">No graph yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Run reconciliation from Overview first.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="h-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_hsla(0,0%,0%,.08)]">
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          fitView
          onNodeClick={(_, node) => setSelectedId(node.id)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c5cbb8" />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </div>
      <aside className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_hsla(0,0%,0%,.08)]">
        {selected ? (
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Selected</dt>
              <dd className="mt-1 font-mono text-xs">{selected.id}</dd>
            </div>
            <Row label="Source" value={selected.source} />
            <Row label="Type" value={selected.kind} />
            <Row label="Amount" value={formatMinor(selected.amount, selected.currency)} />
            <Row label="Currency" value={selected.currency} />
            <Row label="Date" value={selected.occurredAt} />
            <Row label="External reference" value={selected.externalRef ?? "—"} />
            <Row label="Parent reference" value={selected.parentRef ?? "—"} />
            <Row label="Payout reference" value={selected.payoutRef ?? "—"} />
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Connected transactions</dt>
              <dd className="mt-2 flex flex-col gap-2">
                {related.length === 0 ? <span className="text-muted-foreground">None</span> : null}
                {related.map((edge) => (
                  <p key={edge.id} className="font-mono text-xs">
                    {edge.relationship} · {edge.status} · {edge.confidence.toFixed(2)}
                    {edge.policyId ? ` · ${edge.policyId}` : ""}
                  </p>
                ))}
              </dd>
            </div>
            {related[0] ? (
              <>
                <Row label="Confidence" value={related[0].confidence.toFixed(2)} />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Evidence</dt>
                  <dd className="mt-1 text-muted-foreground">{related[0].reasons.join(" · ")}</dd>
                </div>
                <Row label="Status" value={related[0].status} />
              </>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Select a node to inspect source, amount, references, and evidence.</p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xs">{value}</dd>
    </div>
  );
}

function buildGraph(events: LedgerEvent[], edges: MatchEdge[]): { nodes: Node[]; flowEdges: Edge[] } {
  const counters = new Map<number, number>();
  const nodes: Node[] = events.map((event) => {
    const column = KIND_COLUMN[event.kind];
    const row = counters.get(column) ?? 0;
    counters.set(column, row + 1);
    return {
      id: event.id,
      position: { x: column * 220, y: row * 72 },
      data: { label: `${event.kind}\n${formatMinor(event.amount, event.currency)}` },
      style: {
        background: "#ffffff",
        color: "#111111",
        border: "1px solid #111111",
        fontSize: 11,
        width: 180,
        whiteSpace: "pre-wrap",
      },
    };
  });

  const flowEdges: Edge[] = edges
    .filter((edge) => edge.status !== "rejected")
    .map((edge) => ({
      id: edge.id,
      source: edge.fromEventId,
      target: edge.toEventId,
      label: edge.relationship,
      style: { stroke: edge.status === "auto" || edge.status === "approved" ? "#3f7a5a" : "#c4a46a" },
    }));

  return { nodes, flowEdges };
}
