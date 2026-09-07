<script lang="ts">
 import Logo from '$lib/components/Logo.svelte';
 import { ArrowRight } from 'lucide-svelte';
</script>
<svelte:head><title>DriftRecon</title></svelte:head>
<header class="top">
 <div class="top-inner">
  <Logo/>
  <a class="launch" href="/dashboard">Open workspace <ArrowRight size={14}/></a>
 </div>
</header>
<style>
 .top{height:56px;border-bottom:1px solid var(--line);background:#fff}
 .top-inner{height:100%;max-width:1100px;margin:auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}
 .launch{display:flex;align-items:center;gap:8px;background:var(--ink);color:white;padding:8px 12px;border-radius:14px;font-size:12px;font-weight:600;white-space:nowrap}
 @media(max-width:700px){.top-inner{padding-inline:16px}}
</style>
