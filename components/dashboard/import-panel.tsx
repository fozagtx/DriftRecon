"use client";

import { RunButton } from "@/components/run-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SOURCE_LOGOS = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Bank" },
] as const;

type State = "idle" | "uploading" | "sampling" | "error";

export function ImportPanel({
  redirectAfterUpload = false,
  canReconcile = false,
  showSources = true,
}: {
  redirectAfterUpload?: boolean;
  canReconcile?: boolean;
  showSources?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const busy = state === "uploading" || state === "sampling";

  async function submit(kind: "uploading" | "sampling", request: () => Promise<Response>) {
    setState(kind);
    setError(null);
    const response = await request();
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Import failed. Retry.");
      setState("error");
      return;
    }
    const payload = (await response.json()) as { eventCount?: number; events?: unknown[] };
    setImportedCount(payload.eventCount ?? payload.events?.length ?? null);
    setState("idle");
    if (redirectAfterUpload) router.push("/dashboard");
    else router.refresh();
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
        <CardContent className="p-5">
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
            className={`flex min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-5 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-ring ${
              isDragging ? "border-primary bg-secondary" : "border-black/25 hover:border-primary hover:bg-secondary/50"
            }`}
          >
            <img src="/logos/excel.svg" alt="" className="h-12 w-12" />
            <p className="text-sm text-muted-foreground">
              {state === "uploading" ? "Importing files…" : "Drop files here"}
            </p>
            <span
              className={`inline-flex min-h-10 items-center bg-primary px-4 text-sm font-medium text-primary-foreground ${
                busy ? "invisible" : ""
              }`}
            >
              Choose files
            </span>
            {names.length > 0 ? (
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
          {importedCount !== null ? <p className="mt-3 text-center text-sm text-reconciled">{importedCount} events imported. Nothing reconciled yet.</p> : null}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3 border-t border-black/10 bg-transparent px-5 py-4">
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
