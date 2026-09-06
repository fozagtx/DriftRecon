import { LandingHero } from "@/components/landing/hero";
import { SiteNav } from "@/components/site-nav";

export default function LandingPage() {
  return (
    <div className="min-h-full">
      <SiteNav launch />
      <LandingHero />
      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 sm:px-6">
          <p className="text-sm font-medium">DriftRecon</p>
          <p className="font-mono text-[11px] text-muted-foreground">sale → payout → bank</p>
        </div>
      </footer>
    </div>
  );
}
