"use client";

import { BrandMark } from "@/components/brand-mark";
import { ArrowLeft, ChartNoAxesCombined, ClipboardCheck, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WORKSPACE_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/review", label: "Review", icon: ClipboardCheck },
  { href: "/evaluation", label: "Evaluation", icon: ChartNoAxesCombined },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <BrandMark size="md" />
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-x-6" aria-label="Primary">
          {WORKSPACE_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-10 items-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "font-medium text-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
