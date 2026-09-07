<script lang="ts">
 import Logo from '$lib/components/Logo.svelte';
 import { ArrowRight } from 'lucide-svelte';
</script>
<svelte:head><title>DriftRecon</title></svelte:head>
<header class="top">
 <div class="top-inner">
  <Logo/>
  <div class="logos"><img src="/logos/stripe.svg" alt="Stripe"/><img class="dodo" src="/logos/dodo.webp" alt="Dodo Payments"/><img src="/logos/gumroad.svg" alt="Gumroad"/><img src="/logos/chase.svg" alt="Chase"/></div>
  <a class="launch" href="/dashboard">Open workspace <ArrowRight size={14}/></a>
 </div>
</header>
<main>
 <p>Upload <code>data/judges-test.json</code> on Overview.</p>
</main>
<style>
 .top{height:56px;border-bottom:1px solid var(--line);background:#fff}
 .top-inner{height:100%;max-width:1100px;margin:auto;padding:0 20px;display:flex;align-items:center;gap:20px}
 .logos{display:flex;align-items:center;gap:16px;margin-left:auto;margin-right:16px}
 .logos img{height:16px;width:auto;object-fit:contain}
 .logos img.dodo{height:20px;border-radius:50%}
 .launch{display:flex;align-items:center;gap:8px;background:var(--ink);color:white;padding:8px 12px;border-radius:14px;font-size:12px;font-weight:600;white-space:nowrap}
 main{max-width:1100px;margin:auto;padding:18px 20px}
 main p{margin:0;color:var(--muted);font-size:13px}
 main code{font:12px 'IBM Plex Mono';background:#efefe8;padding:1px 5px;border-radius:4px}
 @media(max-width:700px){.logos{display:none}.top-inner,main{padding-inline:16px}}
</style>
