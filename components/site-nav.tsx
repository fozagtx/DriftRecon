"use client";

import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function SiteNav({ launch }: { launch?: boolean }) {
  if (launch) {
    return (
      <header className="relative z-20 mx-auto flex max-w-6xl justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex w-full items-center justify-between rounded-xl border bg-white/80 px-4 py-3 shadow-[0_8px_28px_-20px_hsla(220,28%,10%,.45)] backdrop-blur-xl sm:px-5">
          <BrandMark size="sm" />
          <a href="#workflow" className="ml-auto mr-2 hidden min-h-10 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">How it works</a>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_1px_3px_hsla(0,0%,0%,.2)] transition-colors hover:bg-[hsl(157,54%,20%)] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Launch app
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-20 border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6">
        <BrandMark size="md" />
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Home
        </Link>
      </div>
    </header>
  );
}
