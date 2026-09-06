import { HowCard } from "@/components/landing/how-card";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] md:gap-16">
        <div className="flex max-w-lg flex-col items-start">
          <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.75rem]">
            Payment events, traced to the bank.
          </h1>
          <p className="mt-4 text-base text-foreground/75 sm:text-lg">
            Verify every payout to the deposit.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get started
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6">
          <img
            src="/hero/container.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/30" />
          <div className="relative">
            <HowCard />
          </div>
        </div>
      </div>
    </section>
  );
}
