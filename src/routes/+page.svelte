<script lang="ts">
 import Logo from '$lib/components/Logo.svelte';
 import { ArrowRight, Check, CircleCheck, Sparkles } from 'lucide-svelte';
</script>
<svelte:head>
 <title>DriftRecon</title>
 <meta name="description" content="Reconcile Stripe, Gumroad, Dodo, and bank deposits in one explainable ledger."/>
</svelte:head>
<header class="top">
 <div class="top-inner">
  <Logo/>
  <a class="launch" href="/dashboard">Open workspace <ArrowRight size={14}/></a>
 </div>
</header>
<main>
 <section class="hero">
  <div class="hero-inner">
   <div class="hero-copy">
    <p class="eyebrow">Revenue reconciliation</p>
    <h1>Close the books.<br/>Keep the story.</h1>
    <p class="dek">Stripe, Gumroad, Dodo, and the bank in one ledger. Code calculates. The Recon Agent investigates. A human decides.</p>
    <a class="btn dark" href="/dashboard">Open workspace <ArrowRight size={16}/></a>
    <div class="assurance">
     <span><Check size={13}/>Evidence on every match</span>
     <span><Check size={13}/>Recon Agent on Review</span>
     <span><Check size={13}/>Human-controlled</span>
    </div>
   </div>
   <div class="scene">
    <div class="glow one"></div>
    <div class="glow two"></div>
    <div class="product-shot" aria-label="DriftRecon workspace preview">
     <div class="shot-bar">
      <span class="lights"><i></i><i></i><i></i></span>
      <b>DriftRecon</b>
      <small>Ledger current</small>
     </div>
     <div class="shot">
      <aside>
       <Logo/>
       <label>Workspace</label>
       <span class="active">Overview</span>
       <span>Graph</span>
       <span>Review <b>1</b></span>
       <span>Runs</span>
       <span>Evaluation</span>
      </aside>
      <div class="board">
       <header>
        <div>
         <small>JUNE CLOSE</small>
         <strong>Revenue reconciliation</strong>
        </div>
        <span class="run">Run</span>
       </header>
       <div class="metrics">
        <article><span>Financial value</span><b>$15,488.00</b></article>
        <article><span>Reconciled</span><b>$14,717.30</b></article>
        <article><span>Coverage</span><b>95.0%</b></article>
       </div>
       <h3>Money trail</h3>
       <div class="trail">
        <article><small>STRIPE · SALE</small><b>+$1,000.00</b><span>ch_84F2</span></article>
        <i></i>
        <article><small>FEE</small><b>−$29.30</b><span>automatic</span></article>
        <i></i>
        <article><small>BANK DEPOSIT</small><b>$970.70</b><span class="matched"><CircleCheck size={9}/> Matched</span></article>
       </div>
       <div class="notice">
        <span class="spark"><Sparkles size={15}/></span>
        <p><b>Recon Agent</b><span>A refund crossed a reporting period. Evidence is ready.</span></p>
        <span class="review">Review</span>
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
  <div class="logos">
   <img src="/logos/stripe.svg" alt="Stripe"/>
   <img class="dodo" src="/logos/dodo.webp" alt="Dodo Payments"/>
   <img src="/logos/gumroad.svg" alt="Gumroad"/>
   <img src="/logos/chase.svg" alt="Chase"/>
  </div>
 </section>
</main>
<style>
 .top{height:56px;border-bottom:1px solid var(--line);background:#fff}
 .top-inner{height:100%;max-width:1280px;margin:auto;padding:0 30px;display:flex;align-items:center;justify-content:space-between;gap:20px}
 .launch{display:flex;align-items:center;gap:8px;background:var(--ink);color:white;padding:8px 12px;border-radius:14px;font-size:12px;font-weight:600;white-space:nowrap}
 .hero{min-height:calc(100vh - 56px);display:flex;flex-direction:column;padding:48px 30px 0}
 .hero-inner{max-width:1280px;margin:auto;width:100%;flex:1;display:grid;grid-template-columns:.82fr 1.18fr;gap:56px;align-items:center}
 .hero-copy{max-width:560px}
 .hero h1{font-size:clamp(44px,5.4vw,72px);line-height:.98;letter-spacing:-.058em;font-weight:400;margin:18px 0 22px}
 .dek{font-size:18px;line-height:1.65;color:var(--muted);max-width:520px;margin:0 0 28px}
 .assurance{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px;color:var(--muted);font-size:11px}
 .assurance span{display:flex;gap:6px;align-items:center}
 .assurance :global(svg){color:var(--brand);flex:0 0 auto}
 .scene{position:relative;padding:24px 0 12px}
 .glow{position:absolute;border-radius:50%;pointer-events:none}
 .glow.one{width:380px;height:380px;right:-70px;top:-20px;background:radial-gradient(circle,#edc8a9 0,#eaded0 40%,transparent 72%)}
 .glow.two{width:320px;height:260px;left:-40px;bottom:-8px;background:radial-gradient(circle,#d4d1ad 0,#e9e5d3 46%,transparent 72%)}
 .product-shot{position:relative;background:#fff;border:1px solid #cfcfc5;border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
 .shot-bar{height:40px;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 14px;font-size:10px}
 .lights{display:flex;gap:5px;margin-right:22px}
 .lights i{width:7px;height:7px;border-radius:50%;background:#ddd}
 .lights i:first-child{background:#e8804a}
 .shot-bar small{margin-left:auto;font:8px 'IBM Plex Mono';color:var(--muted);text-transform:uppercase}
 .shot{display:grid;grid-template-columns:124px 1fr;min-height:360px}
 .shot aside{background:#f4f4ee;border-right:1px solid var(--line);padding:16px 10px;display:flex;flex-direction:column;gap:4px}
 .shot aside :global(.logo){font-size:11px;transform:scale(.8);transform-origin:left top;margin-bottom:16px}
 .shot aside label{font:7px 'IBM Plex Mono';color:#999;text-transform:uppercase;padding:0 8px 6px}
 .shot aside>span{font-size:9px;padding:8px;border-radius:7px;color:var(--muted)}
 .shot aside span.active{background:#fff;color:var(--ink)}
 .shot aside span b{float:right;background:#eee3db;color:var(--brand);border-radius:8px;padding:1px 4px}
 .board{padding:18px}
 .board>header{display:flex;justify-content:space-between;align-items:center}
 .board header div{display:grid;gap:4px}
 .board header small,.board h3{font:8px 'IBM Plex Mono';color:var(--muted);letter-spacing:.08em}
 .board header strong{font-size:15px}
 .run{border-radius:12px;background:var(--ink);color:#fff;padding:8px 10px;font-size:8px}
 .metrics{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);margin:18px 0}
 .metrics article{padding:10px;border-right:1px solid var(--line)}
 .metrics article:last-child{border:0}
 .metrics span{display:block;font:7px 'IBM Plex Mono';color:var(--muted);text-transform:uppercase}
 .metrics b{display:block;font:500 13px 'IBM Plex Mono';margin-top:6px}
 .trail{display:flex;align-items:center}
 .trail article{width:104px;border:1px solid var(--line);border-left:2px solid var(--brand);border-radius:7px;padding:8px;background:#fff}
 .trail small,.trail span{display:block;font:6px 'IBM Plex Mono';color:var(--muted)}
 .trail b{display:block;font:500 10px 'IBM Plex Mono';margin:6px 0}
 .trail>i{height:1px;background:#c9c9c0;width:16px}
 .matched{display:flex;align-items:center;gap:3px;color:#55734e}
 .notice{display:flex;align-items:center;gap:10px;margin-top:22px;padding:12px;background:#f2f1ea;border:1px solid var(--line);border-radius:8px}
 .spark{color:var(--brand);display:grid;place-items:center}
 .notice p{display:grid;gap:3px;margin:0;font-size:8px}
 .notice p span{color:var(--muted)}
 .review{margin-left:auto;background:#fff;padding:7px 8px;border-radius:10px;font-size:8px;border:1px solid var(--line)}
 .logos{max-width:1280px;width:100%;margin:0 auto;padding:22px 0;display:flex;align-items:center;gap:36px;border-top:1px solid var(--line)}
 .logos img{width:72px;max-height:20px;object-fit:contain;filter:grayscale(1);opacity:.62}
 .logos img.dodo{width:28px;height:28px;max-height:28px;border-radius:50%;filter:none;opacity:.9}
 @media(max-width:980px){
  .hero-inner{grid-template-columns:1fr;gap:36px}
  .scene{max-width:760px}
 }
 @media(max-width:700px){
  .top-inner,.hero{padding-inline:16px}
  .hero{padding-top:28px}
  .hero h1{font-size:40px}
  .dek{font-size:16px}
  .product-shot{overflow:auto}
  .shot{width:560px}
  .logos{gap:20px;flex-wrap:wrap}
 }
</style>
