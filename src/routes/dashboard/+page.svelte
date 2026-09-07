<script lang="ts">
  import Shell from '$lib/components/Shell.svelte';
  import ImportPanel from '$lib/components/ImportPanel.svelte';
  import { ArrowRight, Landmark, RefreshCw, CircleAlert, ClipboardCheck } from 'lucide-svelte';

  let { data } = $props();
  const d = $derived(data.snapshot);
  const counts = $derived.by(() => {
    const map = new Map<string, number>();
    for (const event of d.events) map.set(event.source, (map.get(event.source) ?? 0) + 1);
    return map;
  });
  const has = $derived(d.events.length > 0);
  const stale = $derived(!!d.run && d.run.eventCount !== d.events.length);
  const openCount = $derived(d.exceptions.filter((item: { status: string }) => item.status === 'open').length);
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const sources = [
    { id: 'stripe', label: 'Stripe', logo: '/logos/stripe.svg' },
    { id: 'dodo', label: 'Dodo Payments', logo: '/logos/dodo.webp', round: true },
    { id: 'gumroad', label: 'Gumroad', logo: '/logos/gumroad.svg' },
    { id: 'bank', label: 'Bank', logo: '/logos/chase.svg' },
  ];
</script>

<Shell>
  <div class="dashboard">
    <header class="page-head">
      <div>
        <h1>Overview</h1>
      </div>
      <span class="status-pill">
        <i class:amber={stale}></i>
        {stale ? 'Stale' : d.run ? 'Current' : has ? 'Ready to reconcile' : 'Idle'}
      </span>
    </header>

    <ImportPanel canReconcile={has} />

    {#if d.error}
      <p class="notice bad">{d.error}</p>
    {/if}

    <div class="metrics card">
      <article><span>Value</span><strong>{has ? money(d.overview.totalFinancialValue) : '—'}</strong></article>
      <article><span>Reconciled</span><strong>{d.run ? money(d.overview.reconciledValue) : '—'}</strong></article>
      <article><span>Unresolved</span><strong>{d.run ? money(d.overview.unresolvedValue) : '—'}</strong></article>
      <article><span>Coverage</span><strong>{d.run ? pct(d.overview.autonomousCoverage) : '—'}</strong></article>
      <div class="counts">
        <p><RefreshCw /> Tx <b>{d.overview.transactionCount}</b></p>
        <p><Landmark /> Payouts <b>{d.overview.payoutCount}</b></p>
        <p><Landmark /> Deposits <b>{d.overview.bankDepositCount}</b></p>
        <p><CircleAlert /> Exceptions <b>{d.run ? d.overview.exceptionCount : '—'}</b></p>
      </div>
    </div>

    <section class="lower">
      <div class="card sources">
        <header><h2>Sources</h2><span>{d.events.length}</span></header>
        <table>
          <thead><tr><th>Source</th><th class="right">Events</th><th>Status</th></tr></thead>
          <tbody>
            {#each sources as source}
              <tr>
                <td class="source"><img class:round={source.round} src={source.logo} alt="" />{source.label}</td>
                <td class="right mono">{counts.get(source.id) ?? 0}</td>
                <td class:good={(counts.get(source.id) ?? 0) > 0} class="mono state">
                  {(counts.get(source.id) ?? 0) > 0 ? 'Imported' : '—'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <aside class="review-card card">
        <ClipboardCheck size={21} />
        <span>Review</span>
        <strong>{d.run ? openCount : '—'}</strong>
        {#if d.run}
          <a href="/review">Open review queue <ArrowRight size={15} /></a>
        {:else}
          <div>Open review queue <ArrowRight size={15} /></div>
        {/if}
      </aside>
    </section>

    <section>
      <div class="section-head"><h2>Run history</h2></div>
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Ran</th>
              <th class="right">Events</th>
              <th class="right">Edges</th>
              <th class="right">Auto</th>
              <th class="right">Review</th>
              <th class="right">Exceptions</th>
            </tr>
          </thead>
          <tbody>
            {#if d.runs.length === 0}
              <tr><td colspan="6" class="none">No reconciliation runs yet.</td></tr>
            {:else}
              {#each d.runs as run}
                <tr>
                  <td>{new Date(run.ranAt).toLocaleString()}</td>
                  <td class="right mono">{run.eventCount}</td>
                  <td class="right mono">{run.edgeCount}</td>
                  <td class="right mono">{run.autoCount}</td>
                  <td class="right mono">{run.reviewCount}</td>
                  <td class="right mono">{run.exceptionCount}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</Shell>

<style>
  .dashboard { display: flex; flex-direction: column; gap: 20px; }
  .status-pill i.amber { background: var(--amber); }
  .notice { margin: 0; font-size: 13px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); overflow: hidden; }
  .metrics article { padding: 18px; border-right: 1px solid var(--line); }
  .metrics article span {
    display: block;
    font: 9px 'IBM Plex Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
  }
  .metrics article strong { display: block; margin-top: 10px; font: 500 22px 'IBM Plex Mono', monospace; }
  .counts {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    background: #fafbf8;
  }
  .counts p {
    margin: 0;
    padding: 11px 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: 11px;
    border-right: 1px solid var(--line);
  }
  .counts :global(svg) { width: 13px; }
  .counts b { margin-left: auto; color: var(--ink); font: 500 11px 'IBM Plex Mono', monospace; }
  .lower { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; }
  .sources { overflow: hidden; }
  .sources header {
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }
  .sources h2 { font-size: 14px; margin: 0; }
  .sources header span { font: 10px 'IBM Plex Mono', monospace; color: var(--muted); }
  .source { display: flex; align-items: center; gap: 10px; }
  .source img { height: 16px; width: auto; object-fit: contain; }
  .source img.round { height: 20px; border-radius: 50%; }
  .state { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; }
  .review-card { padding: 18px; display: flex; flex-direction: column; }
  .review-card > span {
    margin-top: 18px;
    font: 9px 'IBM Plex Mono', monospace;
    text-transform: uppercase;
    color: var(--muted);
    letter-spacing: 0.12em;
  }
  .review-card > strong { font: 500 29px 'IBM Plex Mono', monospace; margin-top: 7px; }
  .review-card a,
  .review-card > div {
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 650;
  }
  .review-card > div { color: #9ba39e; }
  .none { text-align: center; color: var(--muted); padding: 22px; }
  @media (max-width: 1000px) {
    .lower { grid-template-columns: 1fr; }
    .metrics { grid-template-columns: repeat(2, 1fr); }
    .metrics article { border-bottom: 1px solid var(--line); }
  }
  @media (max-width: 600px) {
    .metrics article strong { font-size: 17px; }
    .counts { grid-template-columns: repeat(2, 1fr); }
  }
</style>
