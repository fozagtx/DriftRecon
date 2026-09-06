const sources = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.svg", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <h1 className="reveal max-w-xl text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Payment events, traced to the bank.
        </h1>

        <div className="reveal reveal-2 relative min-h-[28rem] overflow-hidden rounded-[28px] sm:min-h-[32rem]">
          <img
            src="/hero/container.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/35" />

          <div className="relative flex min-h-[28rem] items-center justify-center px-4 py-8 sm:min-h-[32rem] sm:px-6">
            <article className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.55)] sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
              <div className="how-reel mt-5">
                <div className="how-stage">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Import</p>
                  <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    {sources.map((source) => (
                      <li key={source.src} className="how-check">
                        <img src={source.src} alt={source.alt} className="h-5 w-auto" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="how-stage">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recon Agent</p>
                  <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <li className="how-line">get_event</li>
                    <li className="how-line how-line-2">get_candidate_matches</li>
                    <li className="how-line how-line-3">find_events</li>
                    <li className="how-line how-line-4">validate_payout</li>
                  </ul>
                </div>

                <div className="how-stage">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Human decides</p>
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
      </div>
    </section>
  );
}
