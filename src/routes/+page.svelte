<script lang="ts">
  import Logo from '$lib/components/Logo.svelte';
  import { ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
  <title>DriftRecon</title>
  <meta name="description" content="Reconcile Stripe, Gumroad, Dodo, and bank activity into one ledger." />
</svelte:head>

<header class="top">
  <div class="top-inner">
    <Logo />
    <div class="logos">
      <img src="/logos/stripe.svg" alt="Stripe" />
      <img class="dodo" src="/logos/dodo.webp" alt="Dodo Payments" />
      <img src="/logos/gumroad.svg" alt="Gumroad" />
      <img src="/logos/chase.svg" alt="Chase" />
    </div>
    <a class="launch" href="/dashboard">Open workspace <ArrowRight size={14} /></a>
  </div>
</header>

<main>
  <section class="hero">
    <p class="eyebrow">Revenue reconciliation</p>
    <h1>Sales, payouts, and bank deposits in one ledger.</h1>
    <p class="dek">Import processor and bank files, run reconciliation, then review only the exceptions that need a person.</p>
    <a class="btn dark" href="/dashboard">Open workspace <ArrowRight size={16} /></a>
  </section>
  <ol class="steps">
    <li><b>1</b> Import Stripe, Dodo, Gumroad, or bank files</li>
    <li><b>2</b> Run reconciliation</li>
    <li><b>3</b> Approve remaining exceptions</li>
  </ol>
</main>

<style>
  .top {
    height: 64px;
    border-bottom: 1px solid var(--line);
    background: #fff;
  }
  .top-inner {
    height: 100%;
    max-width: 1100px;
    margin: auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .logos {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-left: auto;
    margin-right: 16px;
  }
  .logos img { height: 16px; width: auto; object-fit: contain; }
  .logos img.dodo { height: 20px; border-radius: 50%; }
  .launch {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--ink);
    color: white;
    padding: 9px 14px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  main { max-width: 760px; margin: auto; padding: 72px 24px 96px; }
  .hero h1 {
    font-size: clamp(36px, 5vw, 56px);
    line-height: 1.05;
    letter-spacing: -0.045em;
    font-weight: 500;
    margin: 12px 0 16px;
  }
  .dek { font-size: 17px; line-height: 1.6; color: var(--muted); max-width: 560px; }
  .hero .btn { margin-top: 28px; }
  .steps {
    list-style: none;
    padding: 0;
    margin: 48px 0 0;
    display: grid;
    gap: 10px;
  }
  .steps li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
    font-size: 14px;
  }
  .steps b {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--surface);
    font: 500 11px 'IBM Plex Mono', monospace;
  }
  @media (max-width: 700px) {
    .logos { display: none; }
    .top-inner, main { padding-inline: 16px; }
  }
</style>
