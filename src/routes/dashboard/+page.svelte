<script lang="ts">
 import Shell from '$lib/components/Shell.svelte';
 import ImportPanel from '$lib/components/ImportPanel.svelte';
 import { ArrowRight, Landmark, RefreshCw, CircleAlert } from 'lucide-svelte';
 let { data } = $props();
 const d = $derived(data.snapshot);
 const counts = $derived.by(() => {
  const m = new Map<string, number>();
  for (const e of d.events) m.set(e.source, (m.get(e.source) ?? 0) + 1);
  return m;
 });
 const has = $derived(d.events.length > 0);
 const stale = $derived(!!d.run && d.run.eventCount !== d.events.length);
 const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);
 const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
 const sources: Array<{ id: string; label: string; logo: string; dodo?: boolean; icon?: boolean }> = [
  { id: 'stripe', label: 'Stripe', logo: '/logos/stripe.svg' },
  { id: 'dodo', label: 'Dodo Payments', logo: '/logos/dodo.webp', dodo: true },
  { id: 'gumroad', label: 'Gumroad', logo: '/logos/gumroad.svg', icon: true },
  { id: 'bank', label: 'Bank', logo: '/logos/chase.svg' },
 ];
</script>
<Shell>
 <div class="dashboard">
  <header class="page-head">
   <div class="title-row">
    <h1>Overview</h1>
    <span class="status-pill"><i class:amber={stale}></i>{stale ? 'Stale' : d.run ? 'Current' : 'Idle'}</span>
   </div>
   <ImportPanel canReconcile={has}/>
  </header>
  <div class="metrics card">
   <article><span>Value</span><strong>{has ? money(d.overview.totalFinancialValue) : '—'}</strong></article>
   <article><span>Reconciled</span><strong>{d.run ? money(d.overview.reconciledValue) : '—'}</strong></article>
   <article><span>Unresolved</span><strong>{d.run ? money(d.overview.unresolvedValue) : '—'}</strong></article>
   <article><span>Coverage</span><strong>{d.run ? pct(d.overview.autonomousCoverage) : '—'}</strong></article>
   <div class="counts">
    <p><RefreshCw/> Tx <b>{d.overview.transactionCount}</b></p>
    <p><Landmark/> Payouts <b>{d.overview.payoutCount}</b></p>
    <p><Landmark/> Deposits <b>{d.overview.bankDepositCount}</b></p>
    <p><CircleAlert/> Exceptions <b>{d.run ? d.overview.exceptionCount : '—'}</b></p>
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
        <td class="source"><img class:dodo={source.dodo} class:icon={source.icon} src={source.logo} alt=""/>{source.label}</td>
        <td class="right mono">{counts.get(source.id) ?? 0}</td>
        <td class:good={(counts.get(source.id) ?? 0) > 0} class="mono state">{(counts.get(source.id) ?? 0) > 0 ? 'Imported' : '—'}</td>
       </tr>
      {/each}
     </tbody>
    </table>
   </div>
   <aside class="review-card card">
    <span>Review</span>
    <strong>{d.run ? d.exceptions.filter((x: any) => x.status === 'open').length : '—'}</strong>
    {#if d.run}<a href="/review">Open <ArrowRight size={15}/></a>{:else}<div>Open <ArrowRight size={15}/></div>{/if}
   </aside>
  </section>
 </div>
</Shell>
<style>
 .dashboard{display:flex;flex-direction:column;gap:16px;width:100%}
 .dashboard .page-head{align-items:center}
 .title-row{display:flex;align-items:center;gap:12px;min-width:0}
 .status-pill i.amber{background:var(--amber)}
 .metrics{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden}
 .metrics article{padding:16px;border-right:1px solid var(--line)}
 .metrics article span{display:block;font:9px 'IBM Plex Mono';text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
 .metrics article strong{display:block;margin-top:8px;font:500 20px 'IBM Plex Mono'}
 .counts{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);background:#fafbf8}
 .counts p{margin:0;padding:9px 14px;display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px;border-right:1px solid var(--line)}
 .counts :global(svg){width:13px}
 .counts b{margin-left:auto;color:var(--ink);font:500 11px 'IBM Plex Mono'}
 .lower{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:16px;align-items:start}
 .sources{overflow:hidden}
 .sources header{display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line)}
 .sources h2{font-size:14px;margin:0}
 .sources header span{font:10px 'IBM Plex Mono';color:var(--muted)}
 .source{display:flex;align-items:center;gap:10px}
 .source img{height:16px;width:auto;object-fit:contain}
 .source img.dodo{height:20px;width:20px;border-radius:50%;object-fit:cover}
 .source img.icon{height:18px}
 .state{font-size:9px;text-transform:uppercase;letter-spacing:.08em}
 .review-card{padding:16px;display:flex;flex-direction:column}
 .review-card>span{font:9px 'IBM Plex Mono';text-transform:uppercase;color:var(--muted);letter-spacing:.12em}
 .review-card>strong{font:500 28px 'IBM Plex Mono';margin:8px 0 16px}
 .review-card a,.review-card>div{padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:12px;font-weight:650}
 .review-card>div{color:#9ba39e}
 @media(max-width:1000px){.lower{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,1fr)}.metrics article{border-bottom:1px solid var(--line)}}
 @media(max-width:600px){.metrics article strong{font-size:17px}.counts{grid-template-columns:repeat(2,1fr)}}
</style>
