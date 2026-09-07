import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReviewQueueLink } from "../components/dashboard/overview";

describe("overview review queue accessibility", () => {
  it("renders disabled, non-navigable content before reconciliation has run", () => {
    const markup = renderToStaticMarkup(createElement(ReviewQueueLink, { hasRun: false }));

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain("text-muted-foreground");
    expect(markup).not.toContain("<a");
    expect(markup).not.toContain('href="/review"');
  });

  it("exposes a navigable review link after reconciliation has run", () => {
    const markup = renderToStaticMarkup(createElement(ReviewQueueLink, { hasRun: true }));

    expect(markup).toContain("<a");
    expect(markup).toContain('href="/review"');
    expect(markup).not.toContain("aria-disabled");
  });
});
