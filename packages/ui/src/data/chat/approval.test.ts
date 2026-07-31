import { describe, expect, it, vi } from "vitest";
import { postToolApproval } from "./approval";

describe("postToolApproval", () => {
  it("posts the decision to the approval bound to the active thread", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));

    await postToolApproval(
      {
        approvalApi: "/api/chat/threads/",
        threadId: "thread/1",
        approvalId: "call/account/1",
        approved: true,
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/threads/thread%2F1/approvals/call%2Faccount%2F1",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      },
    );
  });

  it("fails loudly without a thread or when the backend rejects the decision", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 409 }));

    await expect(
      postToolApproval(
        {
          approvalApi: "/api/chat/threads",
          threadId: "",
          approvalId: "call-account-1",
          approved: false,
        },
        fetchMock,
      ),
    ).rejects.toThrow("thread id is required");
    await expect(
      postToolApproval(
        {
          approvalApi: "/api/chat/threads",
          threadId: "thread-1",
          approvalId: "call-account-1",
          approved: false,
          reason: "Wrong account",
        },
        fetchMock,
      ),
    ).rejects.toThrow("status 409");
  });
});
