"use client";

import { useEffect, useState } from "react";

const sources = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

const STEPS = ["import", "agent", "decide"] as const;

export function HowCard() {
  const [step, setStep] = useState(0);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motion) return;
    const id = window.setInterval(() => setStep((current) => (current + 1) % STEPS.length), 4000);
    return () => window.clearInterval(id);
  }, [motion]);

  const current = STEPS[step];

  return (
    <article className="w-full rounded-xl border border-black/10 bg-white p-4 shadow-[0_18px_50px_-24px_rgb(0_0_0_/_0.55)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">How it works</p>
      <div className="mt-4 min-h-[9.5rem]">
        {motion ? (
          <Stage name={current} />
        ) : (
          <div className="flex flex-col gap-5">
            <Stage name="import" />
            <Stage name="agent" />
            <Stage name="decide" />
          </div>
        )}
      </div>
    </article>
  );
}

function Stage({ name }: { name: (typeof STEPS)[number] }) {
  if (name === "import") {
    return (
      <div key="import">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Import</p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {sources.map((source, index) => (
            <li key={source.src} className="how-check" style={{ animationDelay: `${120 + index * 90}ms` }}>
              <img src={source.src} alt={source.alt} className="h-6 w-auto" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (name === "agent") {
    return (
      <div key="agent">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recon Agent</p>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {["Exception", "Related events", "Recommendation"].map((item, index) => (
            <li key={item} className="how-check border border-black/10 px-3 py-2" style={{ animationDelay: `${120 + index * 120}ms` }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div key="decide">
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
  );
}
