<script lang="ts">
  import type { LedgerEvent, MatchEdge } from '../../../lib/types';

  let {
    events,
    edges,
    onselect,
  }: {
    events: LedgerEvent[];
    edges: MatchEdge[];
    onselect: (event: LedgerEvent) => void;
  } = $props();

  const columns = [
    ['sale', 'fee', 'refund', 'dispute'],
    ['fx_conversion'],
    ['payout'],
    ['bank_deposit'],
  ];
  const columnNames = ['Source activity', 'Conversion', 'Processor payout', 'Bank'];
  const nodeWidth = 190;
  const nodeHeight = 92;
  const columnGap = 84;
  const rowGap = 22;
  const top = 58;
  const left = 24;

  const layout = $derived.by(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const groups = columns.map((kinds) => events.filter((event) => kinds.includes(event.kind)));
    groups.forEach((group, column) => {
      group.forEach((event, row) => {
        positions.set(event.id, {
          x: left + column * (nodeWidth + columnGap),
          y: top + row * (nodeHeight + rowGap),
        });
      });
    });
    return { positions, groups };
  });

  const visibleEdges = $derived(
    edges.filter((edge) => layout.positions.has(edge.fromEventId) && layout.positions.has(edge.toEventId)),
  );
  const canvasHeight = $derived(
    Math.max(320, top + Math.max(...layout.groups.map((group) => group.length), 1) * (nodeHeight + rowGap)),
  );
  const canvasWidth = left * 2 + columns.length * nodeWidth + (columns.length - 1) * columnGap;

  const amount = (event: LedgerEvent) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency }).format(event.amount / 100);
  const label = (kind: string) => kind.replaceAll('_', ' ');
</script>

<div class="graph-scroll" aria-label="Transaction relationship graph">
  <div class="graph-canvas" style:width={`${canvasWidth}px`} style:height={`${canvasHeight}px`}>
    {#each columnNames as name, index}
      <p class="column-label" style:left={`${left + index * (nodeWidth + columnGap)}px`}>{name}</p>
    {/each}

    <svg class="edge-layer" width={canvasWidth} height={canvasHeight} aria-hidden="true">
      <defs>
        <marker id="arrow-auto" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      {#each visibleEdges as edge (edge.id)}
        {@const from = layout.positions.get(edge.fromEventId)!}
        {@const to = layout.positions.get(edge.toEventId)!}
        {@const x1 = from.x + nodeWidth}
        {@const y1 = from.y + nodeHeight / 2}
        {@const x2 = to.x}
        {@const y2 = to.y + nodeHeight / 2}
        <path
          class:review-edge={edge.status === 'review'}
          class:rejected-edge={edge.status === 'rejected'}
          d={`M ${x1} ${y1} C ${x1 + 44} ${y1}, ${x2 - 44} ${y2}, ${x2} ${y2}`}
          marker-end="url(#arrow-auto)"
        />
        <title>{label(edge.relationship)} · {Math.round(edge.confidence * 100)}% confidence · {edge.status}</title>
      {/each}
    </svg>

    {#each events as event (event.id)}
      {@const position = layout.positions.get(event.id)}
      {#if position}
        <button
          class="graph-node"
          class:bank-node={event.kind === 'bank_deposit'}
          class:payout-node={event.kind === 'payout'}
          style:left={`${position.x}px`}
          style:top={`${position.y}px`}
          onclick={() => onselect(event)}
          aria-label={`Select ${event.source} ${label(event.kind)} ${amount(event)}`}
        >
          <span class="node-top"><span>{event.source}</span><span>{label(event.kind)}</span></span>
          <strong>{amount(event)}</strong>
          <small>{event.externalRef ?? event.payoutRef ?? 'Reference missing'}</small>
        </button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .graph-scroll { overflow: auto; border: 1px solid #d7dccf; background: #f8faf5; }
  .graph-canvas { position: relative; min-width: 100%; }
  .column-label { position: absolute; top: 20px; width: 190px; margin: 0; color: #68705f; font: 600 10px ui-monospace; letter-spacing: .12em; text-transform: uppercase; }
  .edge-layer { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
  path { fill: none; stroke: #43634b; stroke-width: 1.75; opacity: .78; }
  marker path { fill: #43634b; stroke: none; }
  path.review-edge { stroke: #9a6f20; stroke-dasharray: 5 4; }
  path.rejected-edge { stroke: #a3453c; opacity: .45; }
  .graph-node { position: absolute; width: 190px; height: 92px; padding: 12px; border: 1px solid #cbd2c2; background: white; color: #171914; text-align: left; cursor: pointer; box-shadow: 0 4px 14px rgb(32 39 28 / .06); }
  .graph-node:hover, .graph-node:focus-visible { border-color: #171914; outline: 2px solid #171914; outline-offset: 2px; }
  .payout-node { border-color: #a28b47; background: #fffcf0; }
  .bank-node { border-color: #557da0; background: #f2f8fc; }
  .node-top { display: flex; justify-content: space-between; gap: 8px; color: #68705f; font: 600 9px ui-monospace; letter-spacing: .08em; text-transform: uppercase; }
  strong { display: block; margin-top: 13px; font: 600 18px ui-monospace; }
  small { display: block; margin-top: 7px; overflow: hidden; color: #68705f; font: 10px ui-monospace; text-overflow: ellipsis; white-space: nowrap; }
</style>
