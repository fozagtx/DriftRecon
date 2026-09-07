import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CaseCard, ReviewQueue } from "../components/review/review-queue";
import { emptySnapshot } from "../lib/app/actions";
import type { ExceptionRecord } from "../lib/types";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const unresolved: ExceptionRecord = {
  id: "exception-unresolved",
  type: "missing_reference",
  summary: "Unresolved payout reference",
  relatedEventIds: ["event-1"],
  candidateEdgeIds: [],
  recommendation: "Review this exception again",
  confidence: 0.5,
  evidence: [],
  status: "unresolved",
};

describe("ReviewQueue", () => {
  beforeEach(() => refresh.mockReset());

  it("includes an unresolved exception in the actionable queue", () => {
    const data = {
      ...emptySnapshot(),
      events: [
        {
          id: "event-1",
          source: "stripe" as const,
          kind: "payout" as const,
          amount: 1250,
          currency: "USD",
          occurredAt: "2026-09-01T00:00:00Z",
          metadata: {},
        },
      ],
      exceptions: [unresolved],
      run: {
        id: "run-1",
        ranAt: "2026-09-01T00:00:00Z",
        eventCount: 1,
        edgeCount: 0,
        exceptionCount: 1,
        autoCount: 0,
        reviewCount: 1,
      },
    };

    const markup = renderToStaticMarkup(createElement(ReviewQueue, { data }));

    expect(markup).toContain("1 actionable case");
    expect(markup).toContain("Unresolved payout reference");
  });

  it.each(["approve", "reject"] as const)("allows an unresolved exception to be %sd", (action) => {
    const onDecide = vi.fn();
    const card = CaseCard({
      exception: unresolved,
      index: 0,
      total: 1,
      eventsById: new Map(),
      edgesById: new Map(),
      validations: [],
      pending: false,
      onDecide,
    });
    const label = action === "approve" ? "Approve" : "Reject";
    const button = findButton(card, label);

    expect(button).toBeDefined();
    button?.props.onClick();
    expect(onDecide).toHaveBeenCalledWith(unresolved.id, action);
  });
});

function findButton(node: ReactNode, label: string): ReactElement<{ onClick: () => void }> | undefined {
  if (Array.isArray(node)) {
    return node.map((child) => findButton(child, label)).find(Boolean);
  }
  if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(node)) {
    return undefined;
  }
  if (node.type === "button" && node.props.children === label && node.props.onClick) {
    return node as ReactElement<{ onClick: () => void }>;
  }
  return findButton(node.props.children, label);
}
