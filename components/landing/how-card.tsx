import type { CSSProperties } from "react";

const SOURCES = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

export function HowCard() {
  return (
    <article className="relative flex h-full min-h-[20rem] w-full flex-col rounded-xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.55)] sm:min-h-[24rem] sm:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
      <div className="relative mt-6 flex-1">
        <div className="how-stage how-stage-1 absolute inset-0 flex flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Import</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {SOURCES.map((source, index) => (
              <li key={source.src} className="how-item" style={{ "--how-delay": `${index * 120}ms` } as CSSProperties}>
                <img src={source.src} alt={source.alt} className="h-6 w-auto" />
              </li>
            ))}
          </ul>
        </div>

        <div className="how-stage how-stage-2 absolute inset-0 flex flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recon Agent</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {["Exception", "Related events", "Recommendation"].map((item, index) => (
              <li key={item} className="how-item border border-black/10 px-3 py-2" style={{ "--how-delay": `${index * 140}ms` } as CSSProperties}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="how-stage how-stage-3 absolute inset-0 flex flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Human decides</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="how-item how-approve inline-flex min-h-10 items-center bg-primary px-3 text-sm text-primary-foreground">
              Approve
            </span>
            <span className="how-item inline-flex min-h-10 items-center border border-black/15 px-3 text-sm text-muted-foreground" style={{ "--how-delay": "120ms" } as CSSProperties}>
              Reject
            </span>
            <span className="how-item inline-flex min-h-10 items-center border border-black/15 px-3 text-sm text-muted-foreground" style={{ "--how-delay": "240ms" } as CSSProperties}>
              Leave Unresolved
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
