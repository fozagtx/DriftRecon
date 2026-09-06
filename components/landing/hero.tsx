import { HowCard } from "@/components/landing/how-card";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col items-start">
          <h1 className="max-w-[11ch] text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Payment events, traced to the bank.
          </h1>
          <p className="mt-5 max-w-md text-lg text-foreground/75 sm:text-xl">
            Verify every payment event, traced to the bank.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get started
          </Link>
        </div>

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
