"use client";

import { SiteNav } from "@/components/site-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/graph", label: "Graph" },
  { href: "/review", label: "Review" },
  { href: "/evaluation", label: "Evaluation" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      <SiteNav />
      <div className="border-y border-black/10 bg-white/40">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Workspace">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-9 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
