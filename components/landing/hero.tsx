import { HowCard } from "@/components/landing/how-card";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col items-start">
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Verify every payment event, traced to the bank.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
            Import processor and bank activity, run deterministic reconciliation, and review only the relationships that need judgment.
          </p>
        </div>
        <a
          href="https://github.com/fozagtx/DriftRecon"
          target="_blank"
          rel="noreferrer"
          aria-label="Open DriftRecon on GitHub"
          className="absolute left-1/2 top-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.46-1.11-1.46-.91-.61.07-.6.07-.6 1 .07 1.54 1.04 1.54 1.04.9 1.53 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.55 9.55 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.9.68 1.81v2.68c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
          </svg>
        </a>
        <div className="relative min-h-[22rem] overflow-hidden rounded-2xl p-7 sm:min-h-[26rem] sm:p-8">
          <img
            src="/hero/container.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/30" />
          <div className="relative flex h-full min-h-[20rem] items-center sm:min-h-[24rem]">
            <HowCard />
          </div>
        </div>
      </div>
    </section>
  );
}
