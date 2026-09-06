"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function run() {
    setState("loading");
    try {
      const response = await fetch("/api/reconcile", { method: "POST" });
      if (!response.ok) throw new Error("reconcile failed");
      setState("idle");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={state === "loading"}
        className="inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {state === "loading" ? "Running…" : "Run Reconciliation"}
      </button>
      {state === "error" ? (
        <p className="text-sm text-destructive">Reconciliation failed. Retry.</p>
      ) : null}
    </div>
  );
}
