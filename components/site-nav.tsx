"use client";

import { BrandMark } from "@/components/brand-mark";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/graph", label: "Graph" },
  { href: "/review", label: "Review" },
  { href: "/evaluation", label: "Evaluation" },
];

export function SiteNav({ launch }: { launch?: boolean }) {
  return (
    <Disclosure as="header" className="relative z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <BrandMark size="md" />

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-foreground/80 hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <DisclosureButton className="inline-flex h-9 w-9 items-center justify-center border border-black/15 bg-white text-sm md:hidden">
            <span className="sr-only">Open menu</span>
            Menu
          </DisclosureButton>
          {launch ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center border border-black/20 bg-white px-3 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              Launch app
            </Link>
          ) : null}
        </div>
      </div>

      <DisclosurePanel className="border-t border-black/10 bg-white md:hidden">
        <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2" aria-label="Mobile">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="py-2 text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      </DisclosurePanel>
    </Disclosure>
  );
}
