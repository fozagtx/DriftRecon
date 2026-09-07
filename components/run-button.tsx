"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunButton({ disabled = false, compact = false }: { disabled?: boolean; compact?: boolean }) {
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
      <Button
        type="button"
        onClick={run}
        disabled={disabled || state === "loading"}
        size={compact ? "sm" : "lg"}
      >
        {state === "loading" ? "Running…" : "Run Reconciliation"}
      </Button>
      {state === "error" ? (
        <p className={compact ? "text-xs text-destructive" : "text-sm text-destructive"}>Reconciliation failed. Retry.</p>
      ) : null}
    </div>
  );
}
