import { HowCard } from "@/components/landing/how-card";

export function LandingHero() {
  return (
    <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-12">
        <h1 className="max-w-xl text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Payment events, traced to the bank.
        </h1>

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
