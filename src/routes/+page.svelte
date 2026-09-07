<script lang="ts">
 import Logo from '$lib/components/Logo.svelte';
 import { ArrowRight } from 'lucide-svelte';
</script>
<svelte:head><title>DriftRecon</title></svelte:head>
<header class="top"><div class="top-inner"><Logo/><a class="launch" href="/dashboard">Open workspace <ArrowRight size={14}/></a></div></header>
<main>
 <section class="hero">
  <h1>Stripe and Dodo Payments, to the bank.</h1>
  <a class="btn dark" href="/dashboard">Open workspace <ArrowRight size={16}/></a>
  <div class="logos"><img src="/logos/stripe.svg" alt="Stripe"/><img class="dodo" src="/logos/dodo.webp" alt="Dodo Payments"/><img src="/logos/gumroad.svg" alt="Gumroad"/><img src="/logos/chase.svg" alt="Chase"/></div>
 </section>
</main>
<style>
 .top{position:fixed;inset:0 0 auto;z-index:50;height:56px;background:rgba(248,248,244,.9);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
 .top-inner{height:100%;max-width:1100px;margin:auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
 .launch{display:flex;align-items:center;gap:8px;background:var(--ink);color:white;padding:9px 14px;border-radius:16px;font-size:12px;font-weight:600}
 .hero{min-height:100vh;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:22px;max-width:1100px;margin:auto;padding:96px 24px}
 .hero h1{font-size:clamp(36px,6vw,64px);line-height:1.02;letter-spacing:-.05em;font-weight:400;margin:0;max-width:14ch}
 .logos{display:flex;align-items:center;gap:28px;margin-top:18px}
 .logos img{width:72px;max-height:20px;object-fit:contain}
 .logos img.dodo{width:28px;height:28px;max-height:28px;border-radius:50%}
 @media(max-width:620px){.top-inner,.hero{padding-inline:16px}.hero h1{font-size:36px}}
</style>
