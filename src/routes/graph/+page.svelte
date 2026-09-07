<script lang="ts">
  import TransactionGraph from '$lib/components/TransactionGraph.svelte';
  import type { LedgerEvent } from '../../../lib/types';

  let { data } = $props();
  let snapshot = $derived(data.snapshot);
  let selected = $state<LedgerEvent | null>(null);
  let selectedEdges = $derived(
    selected
      ? snapshot.edges.filter((edge: any) => edge.fromEventId === selected?.id || edge.toEventId === selected?.id)
      : [],
  );
  const money = (event: LedgerEvent) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency }).format(event.amount / 100);
</script>

<svelte:head><title>Transaction graph · DriftRecon</title></svelte:head>

<main class="shell workspace">
  <p class="eyebrow">Financial lineage</p>
  <h1 class="title">Transaction graph</h1>
  <p class="lede">Every connector below is a reconciliation edge produced by the current run—not a decorative sample. Follow source activity through payouts to bank deposits.</p>

  {#if !snapshot.run}
    <div class="card empty section">Import activity and run reconciliation to build the transaction graph.</div>
  {:else}
    <div class="section">
      <TransactionGraph events={snapshot.events} edges={snapshot.edges} onselect={(event) => (selected = event)} />
    </div>

    {#if selected}
      <section class="card section" aria-live="polite">
        <header class="card-head" style="display:flex;justify-content:space-between;gap:16px">
          <strong>{selected.source} · {selected.kind.replaceAll('_', ' ')}</strong>
          <span class="mono">{money(selected)}</span>
        </header>
        <div class="card-body detail-grid">
          <div><span class="eyebrow">Occurred</span><p>{new Date(selected.occurredAt).toLocaleDateString()}</p></div>
          <div><span class="eyebrow">External reference</span><p class="mono">{selected.externalRef ?? 'Missing'}</p></div>
          <div><span class="eyebrow">Parent reference</span><p class="mono">{selected.parentRef ?? '—'}</p></div>
          <div><span class="eyebrow">Payout reference</span><p class="mono">{selected.payoutRef ?? '—'}</p></div>
        </div>
        <div class="card-head"><strong>Connected relationships ({selectedEdges.length})</strong></div>
        {#if selectedEdges.length}
          <table class="table">
            <thead><tr><th>Relationship</th><th>Confidence</th><th>Status</th><th>Evidence</th></tr></thead>
            <tbody>
              {#each selectedEdges as edge}
                <tr>
                  <td>{edge.relationship.replaceAll('_', ' ')}</td>
                  <td class="mono">{Math.round(edge.confidence * 100)}%</td>
                  <td><span class="pill">{edge.status}</span></td>
                  <td>{edge.reasons.join(' · ') || 'No evidence recorded'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <p class="empty">This event has no predicted relationship.</p>
        {/if}
      </section>
    {/if}
  {/if}
</main>

<style>
  .detail-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
  .detail-grid p { overflow-wrap: anywhere; }
  @media (max-width: 760px) { .detail-grid { grid-template-columns: 1fr 1fr; } }
</style>
