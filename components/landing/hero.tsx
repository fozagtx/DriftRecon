import { HowCard } from "@/components/landing/how-card";
import { ArrowRight, CheckCircle2, GitBranch, ShieldCheck } from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  { icon: GitBranch, title: "One traceable ledger", copy: "See the complete path from processor event to settled bank deposit." },
  { icon: ShieldCheck, title: "Explainable decisions", copy: "Every relationship keeps confidence, evidence, and an audit trail." },
  { icon: CheckCircle2, title: "Humans where needed", copy: "Deterministic rules handle the clear cases; your team reviews the rest." },
];

export function LandingHero() {
  return (
    <main>
      <section className="px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="flex flex-col items-start">
            <p className="inline-flex rounded-full border border-[hsl(157,42%,75%)] bg-[hsl(151,45%,94%)] px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[hsl(157,54%,25%)]">Revenue reconciliation, resolved</p>
            <h1 className="mt-6 max-w-[12ch] text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Every payment, accounted for.</h1>
            <p className="mt-6 max-w-[35em] text-lg leading-8 text-muted-foreground">Connect processor activity to bank deposits with a deterministic reconciliation engine—and send only ambiguous relationships to a human.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/dashboard" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_1px_3px_hsla(0,0%,0%,.2)] hover:bg-[hsl(157,54%,20%)]">Explore the workspace <ArrowRight className="h-4 w-4" /></Link>
              <a href="https://github.com/fozagtx/DriftRecon" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-lg px-4 text-sm font-semibold text-foreground hover:bg-secondary">View on GitHub</a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">No account required · Example data included</p>
          </div>
          <div className="relative rounded-2xl bg-[hsl(220,28%,13%)] p-4 shadow-[0_15px_35px_hsla(220,28%,10%,.2)] sm:p-8">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <HowCard />
          </div>
        </div>
      </section>
      <section className="border-y bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Built for financial clarity</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, copy }) => <article key={title} className="border-t-2 border-primary pt-6"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(151,45%,94%)] text-primary"><Icon className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 max-w-[30em] text-sm leading-6 text-muted-foreground">{copy}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
