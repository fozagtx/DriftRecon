"use client";

import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/graph", label: "Graph" },
  { href: "/review", label: "Review" },
  { href: "/evaluation", label: "Evaluation" },
];

export function SiteNav({ launch }: { launch?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-black/10 bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6">
        <BrandMark size="md" />

        {launch ? (
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center border border-black/20 bg-white px-3 font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            Launch app
          </Link>
        ) : (
          <>
            <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2" aria-label="Primary">
              {LINKS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm ${active ? "font-medium text-foreground" : "text-foreground/70 hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Home
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
