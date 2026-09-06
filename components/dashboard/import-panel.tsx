"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const FIELDS = [
  { name: "stripe", label: "Stripe", accept: ".csv,text/csv", logo: "/logos/stripe.svg" },
  { name: "gumroad", label: "Gumroad", accept: ".csv,text/csv", logo: "/logos/gumroad.svg" },
  { name: "dodo", label: "Dodo Payments", accept: ".json,application/json", logo: "/logos/dodo.webp" },
  { name: "bank", label: "Bank", accept: ".csv,text/csv", logo: "/logos/chase.svg" },
] as const;

export function ImportPanel() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    const hasFile = FIELDS.some((field) => {
      const value = form.get(field.name);
      return value instanceof File && value.size > 0;
    });
    if (!hasFile) {
      setError("Choose at least one file.");
      return;
    }

    setState("loading");
    setError(null);
    const response = await fetch("/api/import", { method: "POST", body: form });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Import failed. Retry.");
      setState("error");
      return;
    }
    setState("idle");
    setSelected({});
    formEvent.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border border-black/15 bg-white p-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Import</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Upload source files</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Stripe, Gumroad, and bank take CSV. Dodo takes JSON, or POST to{" "}
          <code className="font-mono text-xs">/api/webhooks/dodo</code>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.name} className="flex min-h-16 flex-col justify-center gap-2 border border-black/10 px-3 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <img src={field.logo} alt="" className="h-4 w-auto" />
              {field.label}
            </span>
            <input
              type="file"
              name={field.name}
              accept={field.accept}
              className="text-sm file:mr-3 file:min-h-10 file:border file:border-black/15 file:bg-secondary file:px-3 file:text-sm focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setSelected((current) => ({ ...current, [field.name]: file?.name ?? "" }));
              }}
            />
            {selected[field.name] ? (
              <span className="font-mono text-[11px] text-muted-foreground">{selected[field.name]}</span>
            ) : null}
          </label>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex min-h-10 w-fit items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {state === "loading" ? "Importing…" : "Import files"}
      </button>
    </form>
  );
}
