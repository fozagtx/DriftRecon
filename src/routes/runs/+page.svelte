<script lang="ts">
 import Shell from '$lib/components/Shell.svelte';
 import { goto, invalidateAll } from '$app/navigation';
 let { data } = $props();
 const d = $derived(data.snapshot);
 const runs = $derived([...d.runs].sort((a: any, b: any) => String(b.ranAt).localeCompare(String(a.ranAt))));
 let pending = $state('');
 let error = $state('');
 function when(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
 }
 async function openRun(id: string) {
  pending = id;
  error = '';
  try {
   const r = await fetch('/api/runs/activate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ runId: id }),
   });
   const body = await r.json();
   if (!r.ok) throw new Error(body.error || 'Could not open that run.');
   await invalidateAll();
   await goto('/dashboard');
  } catch (e) {
   error = e instanceof Error ? e.message : 'Could not open that run.';
  } finally {
   pending = '';
  }
 }
</script>
<Shell>
 <div class="runs">
  <header class="page-head">
   <h1>Runs</h1>
   <span class="status-pill"><i></i>{runs.length} stored</span>
  </header>
  {#if error}<p class="bad">{error}</p>{/if}
  {#if !runs.length}
   <p class="blank">Run on Overview first. Each later Run is stored here so you can open it without replacing this list.</p>
  {:else}
   <div class="card table">
    <table>
     <thead>
      <tr>
       <th>When</th>
       <th class="right">Events</th>
       <th class="right">Matches</th>
       <th class="right">Auto</th>
       <th class="right">Review</th>
       <th class="right">Exceptions</th>
       <th></th>
      </tr>
     </thead>
     <tbody>
      {#each runs as run}
       <tr class:current={d.run && run.id === d.run.id}>
        <td class="mono">{when(run.ranAt)}</td>
        <td class="right mono">{run.eventCount}</td>
        <td class="right mono">{run.edgeCount}</td>
        <td class="right mono">{run.autoCount}</td>
        <td class="right mono">{run.reviewCount}</td>
        <td class="right mono">{run.exceptionCount}</td>
        <td class="action">
         {#if d.run && run.id === d.run.id}
          Current
         {:else}
          <button class="btn ghost" disabled={pending === run.id} onclick={() => openRun(run.id)}>
           {pending === run.id ? 'Opening…' : 'Open'}
          </button>
         {/if}
        </td>
       </tr>
      {/each}
     </tbody>
    </table>
   </div>
  {/if}
 </div>
</Shell>
<style>
 .runs{display:flex;flex-direction:column;gap:16px}
 .blank{margin:0;color:var(--muted);font-size:13px}
 .table{overflow:hidden}
 tr.current td{background:#f5f8f1}
 .action{text-align:right;white-space:nowrap}
 .action .btn{min-height:32px;padding:0 10px;font-size:11px}
</style>
