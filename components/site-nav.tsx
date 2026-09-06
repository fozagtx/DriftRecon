"use client";

import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function SiteNav({ launch }: { launch?: boolean }) {
  if (launch) {
    return (
      <header className="relative z-20 flex justify-center px-4 pt-6">
        <div className="flex w-full max-w-md items-center justify-between rounded-full border border-black/10 bg-white/85 px-4 py-2 shadow-[0_8px_30px_-18px_rgb(0_0_0_/_0.45)] backdrop-blur">
          <BrandMark size="sm" />
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center bg-primary px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Launch app
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-20 border-b border-black/10 bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6">
        <BrandMark size="md" />
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Home
        </Link>
      </div>
    </header>
  );
}
