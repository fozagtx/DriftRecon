const sources = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.svg", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-10 left-2 w-3 ruler-y sm:left-4" />
      <div className="pointer-events-none absolute inset-y-10 right-2 w-3 ruler-y sm:right-4" />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24">
        <div className="tick-frame overflow-hidden rounded-[28px] px-4 pb-14 pt-16 sm:px-10 sm:pt-20">
          <div className="pointer-events-none absolute inset-x-10 top-3 h-3 ruler-x" />

          <h1 className="reveal mx-auto max-w-4xl text-center text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Payment events, traced to the bank.
          </h1>

          <article className="reveal reveal-2 mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.4)] sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
            <div className="how-reel mt-5">
              <div className="how-stage">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Import</p>
                <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {sources.map((source) => (
                    <li key={source.src}>
                      <img src={source.src} alt={source.alt} className="h-5 w-auto" />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="how-stage">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recon Agent</p>
                <p className="mt-2 text-sm font-medium">cross_period_adjustment</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  refund evt_refund_july_200 connects to a different accounting period
                </p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="border border-black/10 p-3">
                    <p className="font-mono text-[10px] text-muted-foreground">evt_refund_july_200</p>
                    <p className="mt-1 text-sm">
                      <img src="/logos/stripe.svg" alt="" className="mr-2 inline h-3.5 w-auto" />
                      refund · $200.00
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">2026-07-03</p>
                  </div>
                  <div className="border border-black/10 p-3">
                    <p className="font-mono text-[10px] text-muted-foreground">evt_sale_june_1000</p>
                    <p className="mt-1 text-sm">
                      <img src="/logos/stripe.svg" alt="" className="mr-2 inline h-3.5 w-auto" />
                      sale · $1,000.00
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">2026-06-12</p>
                  </div>
                </dl>
                <ul className="mt-4 space-y-1 font-mono text-[11px] text-muted-foreground">
                  <li>get_event: refund evt_refund_july_200 $200.00 USD</li>
                  <li>get_event: sale evt_sale_june_1000 $1,000.00 USD</li>
                  <li>find_events: Found original sale ch_june_1000 in 2026-06</li>
                </ul>
              </div>

              <div className="how-stage">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Human decides</p>
                <p className="mt-2 text-sm">
                  Cross-period refund belongs to the original sale. Approve to create a refund policy.
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  Candidate: refunds evt_refund_july_200 → evt_sale_june_1000 · confidence 1.00
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="how-approve inline-flex min-h-10 items-center bg-primary px-3 text-sm text-primary-foreground">
                    Approve
                  </span>
                  <span className="inline-flex min-h-10 items-center border border-black/15 px-3 text-sm text-muted-foreground">
                    Reject
                  </span>
                  <span className="inline-flex min-h-10 items-center border border-black/15 px-3 text-sm text-muted-foreground">
                    Leave Unresolved
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
