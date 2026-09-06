import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-10 left-2 w-3 ruler-y sm:left-4" />
      <div className="pointer-events-none absolute inset-y-10 right-2 w-3 ruler-y sm:right-4" />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24">
        <div className="tick-frame overflow-hidden rounded-[28px] px-4 pb-12 pt-16 sm:px-10 sm:pt-20">
          <div className="pointer-events-none absolute inset-x-10 top-3 h-3 ruler-x" />

          <h1 className="reveal mx-auto max-w-4xl text-center text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Payment events, traced to the bank.
          </h1>

          <div className="reveal reveal-2 relative mx-auto mt-10 min-h-[280px] max-w-3xl sm:min-h-[340px]">
            <Wireform />

            <div className="absolute left-0 top-6 w-[46%] max-w-[220px] space-y-2 sm:top-10">
              <DataPlate label="Transaction id" value="ch_8f21a9c0" />
              <DataPlate label="Source" value="stripe · sale" />
            </div>

            <article className="reveal reveal-3 absolute right-0 top-16 w-[58%] max-w-[260px] rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.4)] sm:top-20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Stripe payout</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">2026-07-03 14:12:08</p>
                </div>
                <p className="font-mono text-sm tabular-nums">+$7,708.00</p>
              </div>
            </article>

            <article className="reveal reveal-4 absolute bottom-2 right-[8%] w-[54%] max-w-[240px] rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.4)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Bank deposit</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">matched · deposited_as</p>
                </div>
                <p className="font-mono text-sm tabular-nums">+$7,708.00</p>
              </div>
            </article>
          </div>

          <p className="reveal reveal-3 mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-foreground/75 sm:text-base">
            Stripe, Gumroad, Dodo, and bank rows become one ledger. Sale → fee / refund / dispute / FX → payout → deposit. Code does the arithmetic. The Recon Agent investigates exceptions. A human decides uncertainty.
          </p>

          <div className="reveal reveal-4 mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center bg-primary px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground"
            >
              Launch app
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataPlate({ label, value }: { label: string; value: string }) {
  return (
    <div className="tick-frame bg-white/80 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xs">{value}</p>
    </div>
  );
}

function Wireform() {
  return (
    <svg
      viewBox="0 0 420 280"
      className="mx-auto h-[240px] w-full text-black/30 sm:h-[300px]"
      aria-hidden
    >
      <ellipse cx="210" cy="148" rx="118" ry="118" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="210" cy="148" rx="88" ry="88" fill="none" stroke="currentColor" strokeWidth="1" />
      {Array.from({ length: 18 }, (_, i) => {
        const y = 40 + i * 12;
        const r = 118;
        const dy = y - 148;
        if (Math.abs(dy) >= r) return null;
        const half = Math.sqrt(r * r - dy * dy);
        return <line key={y} x1={210 - half} y1={y} x2={210 + half} y2={y} stroke="currentColor" strokeWidth="0.8" />;
      })}
    </svg>
  );
}
