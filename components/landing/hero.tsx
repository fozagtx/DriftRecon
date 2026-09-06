import { HowCard } from "@/components/landing/how-card";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex max-w-xl flex-col items-start gap-8 pt-2 md:pt-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-[2.35rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Payment events, traced to the bank.
            </h1>
            <p className="max-w-md text-lg text-foreground/70 sm:text-xl">
              Verify every payout to the deposit.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get started
          </Link>
        </div>

        <div className="relative min-h-[26rem] overflow-hidden rounded-[28px] sm:min-h-[30rem]">
          <img
            src="/hero/container.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/35" />
          <div className="relative flex min-h-[26rem] items-center justify-center px-4 py-8 sm:min-h-[30rem] sm:px-6">
            <HowCard />
          </div>
        </div>
      </div>
    </section>
  );
}
