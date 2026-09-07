import { initialImportPanelState, importPanelReducer } from "@/components/dashboard/import-panel";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("ImportPanel import status", () => {
  it("records the initial successful import", () => {
    const pending = importPanelReducer(initialImportPanelState, { type: "start", kind: "uploading" });
    expect(pending).toEqual({ state: "uploading", error: null, importedCount: null });
    expect(importPanelReducer(pending, { type: "succeeded", importedCount: 12 })).toEqual({
      state: "idle",
      error: null,
      importedCount: 12,
    });
  });

  it("clears an old success before a failed reimport", () => {
    const previous = importPanelReducer(initialImportPanelState, { type: "succeeded", importedCount: 12 });
    const pending = importPanelReducer(previous, { type: "start", kind: "sampling" });
    expect(pending.importedCount).toBeNull();
    expect(importPanelReducer(pending, { type: "failed", error: "Bad file" })).toEqual({
      state: "error",
      error: "Bad file",
      importedCount: null,
    });
  });

  it("makes an import after a prior run describe the new import", () => {
    const previousRunNotice = importPanelReducer(initialImportPanelState, { type: "reconciled" });
    const pending = importPanelReducer(previousRunNotice, { type: "start", kind: "uploading" });
    expect(importPanelReducer(pending, { type: "succeeded", importedCount: 3 }).importedCount).toBe(3);
  });

  it("removes the import-local notice after reconciliation", () => {
    const imported = importPanelReducer(initialImportPanelState, { type: "succeeded", importedCount: 3 });
    expect(importPanelReducer(imported, { type: "reconciled" }).importedCount).toBeNull();
  });
});
