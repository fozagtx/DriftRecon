"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const LOGOS = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/gumroad.svg", alt: "Gumroad" },
  { src: "/logos/dodo.webp", alt: "Dodo Payments" },
  { src: "/logos/chase.svg", alt: "Chase" },
] as const;

export function ImportPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);

  async function upload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const form = new FormData();
    const picked: string[] = [];
    for (const file of Array.from(fileList)) {
      form.append("files", file);
      picked.push(file.name);
    }
    setNames(picked);
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
    router.refresh();
  }

  return (
    <div className="border border-black/15 bg-white p-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "loading"}
        className="flex w-full flex-col items-center gap-5 py-4 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <ul className="flex items-center">
          {LOGOS.map((logo, index) => (
            <li
              key={logo.src}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white"
              style={{ marginLeft: index === 0 ? 0 : -12, zIndex: LOGOS.length - index }}
            >
              <img src={logo.src} alt={logo.alt} className="h-5 w-auto max-w-[1.75rem]" />
            </li>
          ))}
        </ul>
        <span className="text-sm font-medium">{state === "loading" ? "Importing…" : "Upload"}</span>
        {names.length > 0 ? (
          <span className="font-mono text-[11px] text-muted-foreground">{names.join(" · ")}</span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        multiple
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files);
          event.target.value = "";
        }}
      />
      {error ? <p className="mt-3 text-center text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
