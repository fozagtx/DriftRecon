"use client";

import { RunButton } from "@/components/run-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";

const SOURCE_LOGOS = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Bank" },
] as const;

type State = "idle" | "uploading" | "sampling" | "error";

export type ImportPanelState = {
  state: State;
  error: string | null;
  importedCount: number | null;
};

type ImportPanelAction =
  | { type: "start"; kind: "uploading" | "sampling" }
  | { type: "failed"; error: string }
  | { type: "succeeded"; importedCount: number | null }
  | { type: "reconciled" };

export const initialImportPanelState: ImportPanelState = {
  state: "idle",
  error: null,
  importedCount: null,
};

export function importPanelReducer(state: ImportPanelState, action: ImportPanelAction): ImportPanelState {
  switch (action.type) {
    case "start":
      return { state: action.kind, error: null, importedCount: null };
    case "failed":
      return { state: "error", error: action.error, importedCount: null };
    case "succeeded":
      return { state: "idle", error: null, importedCount: action.importedCount };
    case "reconciled":
      return { ...state, importedCount: null };
  }
}

export function ImportPanel({
  redirectAfterUpload = false,
  canReconcile = false,
  showSources = true,
  hasRun = false,
  isRunStale = false,
  compact = false,
}: {
  redirectAfterUpload?: boolean;
  canReconcile?: boolean;
  showSources?: boolean;
  hasRun?: boolean;
  isRunStale?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [{ state, error, importedCount }, dispatch] = useReducer(importPanelReducer, initialImportPanelState);
  const [names, setNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const busy = state === "uploading" || state === "sampling";

  // A refreshed snapshot changing from stale to current means this import has
  // now been included in a reconciliation run, so its local notice is done.
  useEffect(() => {
    if (hasRun && !isRunStale) dispatch({ type: "reconciled" });
  }, [hasRun, isRunStale]);

  async function submit(kind: "uploading" | "sampling", request: () => Promise<Response>) {
    dispatch({ type: "start", kind });
    try {
      const response = await request();
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        dispatch({ type: "failed", error: payload?.error ?? "Import failed. Retry." });
        return;
      }
      const payload = (await response.json()) as { eventCount?: number; events?: unknown[] };
      dispatch({ type: "succeeded", importedCount: payload.eventCount ?? payload.events?.length ?? null });
      if (redirectAfterUpload) router.push("/dashboard");
      else router.refresh();
    } catch {
      dispatch({ type: "failed", error: "Import failed. Retry." });
    }
  }

  function upload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const form = new FormData();
    const picked: string[] = [];
    for (const file of Array.from(fileList)) {
      form.append("files", file);
      picked.push(file.name);
    }
    setNames(picked);
    void submit("uploading", () => fetch("/api/import", { method: "POST", body: form }));
  }

  function loadSample() {
    setNames([]);
    void submit("sampling", () => fetch("/api/sample", { method: "POST" }));
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Card className="rounded-none border-black/15 py-0">
        <CardContent className={compact ? "p-3" : "p-5"}>
          <label
            htmlFor="import-files"
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              upload(event.dataTransfer.files);
            }}
            className={`flex w-full cursor-pointer items-center justify-between border border-dashed text-left transition-colors focus-within:ring-2 focus-within:ring-ring ${
              compact ? "min-h-20 flex-col gap-3 px-4 py-3 sm:flex-row sm:gap-4" : "min-h-48 flex-col justify-center gap-3 px-5 py-6 text-center"
            } ${
              isDragging ? "border-primary bg-secondary" : "border-black/25 hover:border-primary hover:bg-secondary/50"
            }`}
          >
            <img src="/logos/excel.svg" alt="" className={compact ? "h-9 w-9 shrink-0" : "h-12 w-12"} />
            <div className={compact ? "min-w-0 flex-1" : "contents"}>
              <p className="text-sm font-medium text-foreground">
                {state === "uploading" ? "Importing files…" : "Upload source files"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Stripe, Gumroad, Dodo, or bank · CSV and JSON</p>
            </div>
            <span
              className={`inline-flex min-h-10 shrink-0 items-center bg-primary px-4 text-sm font-medium text-primary-foreground ${
                busy ? "invisible" : ""
              }`}
            >
              Choose files
            </span>
            {names.length > 0 && !compact ? (
              <span className="font-mono text-[11px] text-muted-foreground">{names.join(" · ")}</span>
            ) : null}
            <input
              id="import-files"
              type="file"
              accept=".csv,.json,text/csv,application/json"
              multiple
              disabled={busy}
              className="sr-only"
              onChange={(event) => {
                upload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {error ? <p className="mt-3 text-center text-sm text-destructive">{error}</p> : null}
          {importedCount !== null ? <p className="mt-3 text-center text-sm text-reconciled">{importedCount} events imported.</p> : null}
        </CardContent>
        <CardFooter className={`flex items-center justify-between gap-3 border-t border-black/10 bg-transparent ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={loadSample}>
            <FlaskConical aria-hidden="true" />
            {state === "sampling" ? "Loading example…" : "Load Acme example"}
          </Button>
          {redirectAfterUpload ? null : <RunButton disabled={!canReconcile || busy} />}
        </CardFooter>
      </Card>
      {showSources ? (
        <div className="flex items-center justify-center gap-x-5">
          <span className="whitespace-nowrap text-sm text-muted-foreground">Works with</span>
          <ul className="flex items-center gap-x-5" aria-label="Supported sources">
            {SOURCE_LOGOS.map((logo) => (
              <li key={logo.src}>
                <img src={logo.src} alt={logo.alt} className="h-5 w-auto" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
