import { SiteNav } from "@/components/site-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
