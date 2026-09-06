import { HowCard } from "@/components/landing/how-card";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center">
        <div className="flex w-full shrink-0 flex-col items-start md:w-[26rem]">
          <h1 className="text-[2.15rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl">
            Payment events, traced to the bank.
          </h1>
          <p className="mt-4 text-base text-foreground/75 sm:text-lg">
            Verify every payment event, traced to the bank.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get started
          </Link>
        </div>

        <div className="relative w-full shrink-0 overflow-hidden rounded-2xl p-5 md:w-[22rem]">
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
