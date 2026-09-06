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

          <article className="reveal reveal-2 mx-auto mt-12 w-full max-w-xl rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.4)] sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
            <ol className="flow-steps mt-5 flex flex-col gap-3">
              <li className="flow-step">
                <span className="font-mono text-[10px] text-muted-foreground">01</span>
                <div>
                  <p className="text-sm font-medium">Import</p>
                  <p className="font-mono text-[11px] text-muted-foreground">Stripe · Gumroad · Dodo · bank</p>
                </div>
              </li>
              <li className="flow-step">
                <span className="font-mono text-[10px] text-muted-foreground">02</span>
                <div>
                  <p className="text-sm font-medium">Match</p>
                  <p className="font-mono text-[11px] text-muted-foreground">exact refs → policies → score</p>
                </div>
              </li>
              <li className="flow-step">
                <span className="font-mono text-[10px] text-muted-foreground">03</span>
                <div>
                  <p className="text-sm font-medium">Validate</p>
                  <p className="font-mono text-[11px] text-muted-foreground">sale − refund − dispute − fee ± FX = payout ≈ deposit</p>
                </div>
              </li>
              <li className="flow-step">
                <span className="font-mono text-[10px] text-muted-foreground">04</span>
                <div>
                  <p className="text-sm font-medium">Review</p>
                  <p className="font-mono text-[11px] text-muted-foreground">agent investigates · human decides</p>
                </div>
              </li>
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
