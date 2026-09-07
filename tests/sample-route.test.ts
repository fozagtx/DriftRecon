import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  loadSampleDataset: vi.fn(),
  reconcile: vi.fn(),
  emptySnapshot: vi.fn((error: string) => ({ error })),
}));

vi.mock("@/lib/app/actions", () => actions);

import { POST } from "@/src/routes/api/sample/+server";

describe("sample import route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("imports the example and immediately reconciles it", async () => {
    actions.reconcile.mockResolvedValue({ events: [{ id: "evt_1" }], run: { id: "run_1" } });

    const response = await POST();

    expect(actions.loadSampleDataset).toHaveBeenCalledOnce();
    expect(actions.reconcile).toHaveBeenCalledOnce();
    expect(await response.json()).toMatchObject({ run: { id: "run_1" } });
  });
});
