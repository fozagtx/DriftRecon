import { HowCard } from "@/components/landing/how-card";
import { ArrowRight, CheckCircle2, GitBranch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const BENEFITS = [
  { icon: GitBranch, number: "01", title: "One traceable ledger", copy: "Follow every sale through fees, refunds, payouts, and its final bank deposit." },
  { icon: ShieldCheck, number: "02", title: "Evidence, not guesswork", copy: "Every relationship includes its confidence, supporting signals, and decision history." },
  { icon: CheckCircle2, number: "03", title: "Review only the edge cases", copy: "Deterministic rules clear the obvious matches. Your team handles genuine ambiguity." },
] as const;

const LOGOS = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

export function LandingHero() {
  return (
    <main>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.04fr_.96fr] lg:gap-20">
          <div className="flex flex-col items-start">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-primary shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Revenue reconciliation, resolved
            </p>
            <h1 className="mt-7 max-w-[11ch] text-[2.8rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">Close the books with every dollar explained.</h1>
            <p className="mt-6 max-w-[37rem] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">DriftRecon connects processor activity to bank deposits, builds an audit-ready trail, and sends only uncertain matches to a human.</p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/dashboard" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_hsl(157,54%,20%)] transition hover:-translate-y-0.5 hover:bg-[hsl(157,54%,20%)]">Explore with sample data <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
              <a href="#workflow" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-white/70 px-5 text-sm font-semibold text-foreground transition hover:border-foreground/30 hover:bg-white">See how it works</a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> No account required. Example data included.</p>
          </div>

          <div className="relative lg:py-4">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-accent/10 blur-2xl" />
            <HowCard />
          </div>
        </div>
      </section>

      <section className="border-y border-border/80 bg-white/70 px-4 py-6 sm:px-6" aria-label="Supported data sources">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Connect the tools already in your stack</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:justify-end">
            {LOGOS.map((logo) => <Image key={logo.src} src={logo.src} alt={logo.alt} width={80} height={20} className="h-5 max-w-20 object-contain grayscale opacity-60" />)}
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-8 bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">Built for financial clarity</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">From scattered records to a clear close.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">A transparent workflow your finance team can inspect, explain, and trust.</p>
          </div>
          <div className="mt-12 grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {BENEFITS.map(({ icon: Icon, number, title, copy }) => (
              <article key={title} className="group border-b border-border py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
                <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(151,45%,94%)] text-primary"><Icon className="h-5 w-5" /></span><span className="font-mono text-[10px] text-muted-foreground">{number}</span></div>
                <h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 max-w-[30em] text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
