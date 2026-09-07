import { ArrowDown, Check, Sparkles } from "lucide-react";
import Image from "next/image";

const SOURCES = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
] as const;

export function HowCard() {
  return (
    <article className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[hsl(220,25%,16%)] p-4 text-white shadow-[0_28px_70px_-35px_rgb(0_0_0_/_0.8)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,hsla(39,84%,55%,.13),transparent_38%)]" />
      <header className="relative flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">Live reconciliation</p>
          <p className="mt-1 text-sm font-medium">September processor activity</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Complete
        </span>
      </header>

      <div className="relative mt-4 grid gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/[.055] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">Processor events</p>
            <div className="flex items-center gap-3">
              {SOURCES.map((source) => <Image key={source.src} src={source.src} alt={source.alt} width={56} height={16} className="h-4 max-w-14 object-contain brightness-0 invert opacity-80" />)}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
            <span className="text-white/55">142 sales · 8 fees · 2 refunds</span>
            <span className="font-mono tabular-nums">$24,891.20</span>
          </div>
        </div>

        <ArrowDown className="mx-auto -my-1 h-4 w-4 text-accent" aria-hidden="true" />

        <div className="rounded-xl border border-accent/25 bg-accent/[.07] p-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-100">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Evidence linked automatically
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96%] rounded-full bg-accent" /></div>
            <span className="font-mono text-[10px] text-white/60">96% matched</span>
          </div>
        </div>

        <ArrowDown className="mx-auto -my-1 h-4 w-4 text-accent" aria-hidden="true" />

        <div className="rounded-xl border border-white/10 bg-white/[.055] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-400/15"><Image src="/logos/chase.svg" alt="Chase" width={16} height={16} className="h-4 w-4 brightness-0 invert" /></span>
              <div><p className="text-xs font-medium">Bank deposit</p><p className="mt-0.5 font-mono text-[9px] text-white/40">SEP 05 · •• 4821</p></div>
            </div>
            <div className="text-right"><p className="font-mono text-sm tabular-nums">$23,412.08</p><p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[9px] uppercase text-emerald-300"><Check className="h-3 w-3" /> Balanced</p></div>
          </div>
        </div>
      </div>

      <footer className="relative mt-4 flex items-center justify-between rounded-xl bg-white px-3.5 py-3 text-[hsl(220,28%,13%)]">
        <div><p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Needs review</p><p className="mt-0.5 text-xs font-medium">6 ambiguous relationships</p></div>
        <span className="rounded-lg bg-[hsl(157,54%,25%)] px-3 py-2 text-[10px] font-semibold text-white">Review evidence</span>
      </footer>
    </article>
  );
}
