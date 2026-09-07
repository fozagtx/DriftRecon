import { describe, expect, it, vi } from "vitest";
import { ReviewExceptionConflictError } from "../lib/app/errors";

const actions = vi.hoisted(() => ({
  reviewException: vi.fn(),
  snapshot: vi.fn(),
}));

vi.mock("../lib/app/actions", () => actions);

import { POST } from "../app/api/review/route";

describe("POST /api/review", () => {
  it("maps an already terminal exception to HTTP 409", async () => {
    actions.reviewException.mockRejectedValueOnce(new ReviewExceptionConflictError("exception-1", "approved"));
    const request = new Request("http://localhost/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exceptionId: "exception-1", action: "reject" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Exception exception-1 has already been approved and cannot be reviewed again.",
    });
    expect(actions.snapshot).not.toHaveBeenCalled();
  });
});
