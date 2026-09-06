import { LandingHero } from "@/components/landing/hero";
import { SiteNav } from "@/components/site-nav";

export default function LandingPage() {
  return (
    <div className="min-h-full">
      <SiteNav launch />
      <LandingHero />
    </div>
  );
}
