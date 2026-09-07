import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/dashboard/import-panel", () => ({
  ImportPanel: () => createElement("div", { "data-testid": "import-panel" }),
}));
vi.mock("@/components/run-button", () => ({
  RunButton: () => createElement("button", null, "Run reconciliation"),
}));

import { Overview } from "@/components/dashboard/overview";
import { emptySnapshot } from "@/lib/app/actions";
import type { LedgerEvent } from "@/lib/types";

function event(id: string, source: LedgerEvent["source"]): LedgerEvent {
  return {
    id,
    source,
    kind: "sale",
    amount: 100,
    currency: "USD",
    occurredAt: "2026-09-07T00:00:00.000Z",
    metadata: {},
  };
}

describe("Overview", () => {
  it("distinguishes imported sources from sources absent in the snapshot", () => {
    const snapshot = {
      ...emptySnapshot(),
      events: [event("stripe-1", "stripe"), event("stripe-2", "stripe"), event("bank-1", "bank")],
    };
    const markup = renderToStaticMarkup(createElement(Overview, { data: snapshot }));
    const importedSourcesTable = markup.match(/<h2[^>]*>Imported sources<\/h2>[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/)?.[1];
    const rows = [...(importedSourcesTable ?? "").matchAll(/<tr[^>]*><td[^>]*>([^<]+)<\/td><td[^>]*>(\d+)<\/td><td[^>]*><span class="([^"]+)">([^<]+)<\/span><\/td><\/tr>/g)]
      .map(([, source, count, className, label]) => ({ source, count: Number(count), label, className }));

    expect(rows).toMatchInlineSnapshot(`
      [
        {
          "className": "font-mono text-[10px] uppercase tracking-wider text-reconciled",
          "count": 2,
          "label": "Imported",
          "source": "stripe",
        },
        {
          "className": "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
          "count": 0,
          "label": "Not imported",
          "source": "gumroad",
        },
        {
          "className": "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
          "count": 0,
          "label": "Not imported",
          "source": "dodo",
        },
        {
          "className": "font-mono text-[10px] uppercase tracking-wider text-reconciled",
          "count": 1,
          "label": "Imported",
          "source": "bank",
        },
      ]
    `);
  });
});
