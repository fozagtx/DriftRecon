<script lang="ts">
 import Shell from '$lib/components/Shell.svelte';
 let { data } = $props();
 const d = $derived(data.snapshot);
 const runs = $derived([...d.runs].sort((a: any, b: any) => String(b.ranAt).localeCompare(String(a.ranAt))));
 function when(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
 }
</script>
<Shell>
 <div class="runs">
  <header class="page-head">
   <h1>Runs</h1>
   <span class="status-pill"><i></i>{runs.length} stored</span>
  </header>
  {#if !runs.length}
   <p class="blank">Run on Overview first. Later runs stay here instead of replacing this list.</p>
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
      {#each runs as run, i}
       <tr class:current={d.run && run.id === d.run.id}>
        <td class="mono">{when(run.ranAt)}</td>
        <td class="right mono">{run.eventCount}</td>
        <td class="right mono">{run.edgeCount}</td>
        <td class="right mono">{run.autoCount}</td>
        <td class="right mono">{run.reviewCount}</td>
        <td class="right mono">{run.exceptionCount}</td>
        <td>{i === 0 && d.run && run.id === d.run.id ? 'Current' : ''}</td>
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
</style>
