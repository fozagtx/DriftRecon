"use client";

import { BrandMark } from "@/components/brand-mark";
import { ArrowUpRight, ChartNoAxesCombined, ClipboardCheck, GitBranch, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WORKSPACE_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/graph", label: "Transaction graph", short: "Graph", icon: GitBranch },
  { href: "/review", label: "Review queue", short: "Review", icon: ClipboardCheck },
  { href: "/evaluation", label: "Evaluation", icon: ChartNoAxesCombined },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-sidebar-border">
        <header className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 lg:h-auto lg:px-5 lg:py-5">
          <BrandMark size="md" />
          <span className="rounded-full bg-sidebar-accent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground">Live</span>
        </header>
        <nav className="fixed inset-x-0 bottom-0 z-40 order-last grid grid-cols-4 border-t border-sidebar-border bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] lg:static lg:mt-4 lg:flex lg:flex-col lg:border-0 lg:bg-transparent lg:px-2.5" aria-label="Primary">
          {WORKSPACE_LINKS.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-3 text-[10px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:text-sm ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-[hsl(218,14%,72%)] hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              {active ? <span className="absolute left-0 hidden h-6 w-1 rounded-r-full bg-sidebar-primary lg:block" /> : null}
              <item.icon className="h-5 w-5 lg:h-4 lg:w-4" aria-hidden="true" />
              <span className="lg:hidden">{item.short ?? item.label}</span><span className="hidden lg:inline">{item.label}</span>
            </Link>;
          })}
        </nav>
        <div className="mt-auto hidden border-t border-sidebar-border px-4 py-4 lg:block">
          <div className="flex items-center gap-2 px-1 text-[11px] text-[hsl(218,14%,72%)]"><ShieldCheck className="h-4 w-4 text-sidebar-primary" aria-hidden="true" /> Audit trail enabled</div>
          <Link href="/" className="mt-2 flex min-h-9 items-center justify-between px-1 text-[11px] text-[hsl(218,14%,72%)] hover:text-sidebar-foreground">View website <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-24 pt-7 sm:px-8 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
