"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="border border-border bg-card p-8">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Server error</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Page failed to load</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        The database request failed. Reload after DATABASE_URL is set on the host.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Reload
      </button>
    </section>
  );
}
