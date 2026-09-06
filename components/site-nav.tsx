"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

const PRODUCT = [
  { href: "/dashboard", label: "Overview" },
  { href: "/graph", label: "Graph" },
  { href: "/review", label: "Review" },
  { href: "/evaluation", label: "Evaluation" },
];

export function SiteNav({ launch }: { launch?: boolean }) {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-[1.35rem] font-semibold tracking-tight">
          DriftRecon
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Menu as="div" className="relative">
            <MenuButton className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Product
              <span aria-hidden className="text-[10px]">
                ▾
              </span>
            </MenuButton>
            <MenuItems className="absolute right-0 z-30 mt-2 w-44 origin-top-right border border-black/15 bg-white p-1 shadow-[0_12px_40px_-20px_rgb(0_0_0_/_0.35)]">
              {PRODUCT.map((item) => (
                <MenuItem key={item.href}>
                  {({ focus }) => (
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm ${focus ? "bg-muted" : ""}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          {launch ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center border border-black/20 bg-white px-3 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              Launch app
            </Link>
          ) : (
            <Link
              href="/"
              className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:inline"
            >
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
