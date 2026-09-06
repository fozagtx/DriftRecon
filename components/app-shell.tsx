"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/graph", label: "Graph" },
  { href: "/review", label: "Review" },
  { href: "/evaluation", label: "Evaluation" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Acme Creator Co.</p>
            <h1 className="font-[family-name:var(--font-newsreader)] text-3xl tracking-tight">DriftRecon</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Code calculates. Agent investigates. Human decides uncertainty.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Primary">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex min-h-10 items-center border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    active
                      ? "border-accent bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
