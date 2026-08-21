import { describe, expect, it, vi } from "vitest";
import { forkChatSession, getChatSession, postToolApproval } from "./approval";

const session = {
  id: "session-1",
  revision: 4,
  messages: [
    {
      id: "assistant-1",
      role: "assistant" as const,
      parts: [{ type: "text" as const, text: "Updated." }],
    },
  ],
};

describe("Captain chat sessions", () => {
  it("hydrates the canonical session projection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(session), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      getChatSession("/api/chat/sessions/", "session/1", fetchMock),
    ).resolves.toEqual(session);
    expect(fetchMock).toHaveBeenCalledWith("/api/chat/sessions/session%2F1", {
      headers: { Accept: "application/json" },
    });
  });

  it("hydrates an empty session when Captain omits messages", async () => {
    const emptySession = { id: "session-1", revision: 0 };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(emptySession), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      getChatSession("/api/chat/sessions", emptySession.id, fetchMock),
    ).resolves.toEqual({ ...emptySession, messages: [] });
  });

  it("returns the canonical session after posting an approval", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(session), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      postToolApproval(
        {
          sessionsApi: "/api/chat/sessions/",
          sessionId: "session/1",
          approvalId: "approval/1",
          approved: true,
        },
        fetchMock,
      ),
    ).resolves.toEqual(session);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions/session%2F1/approvals/approval%2F1",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      },
    );
  });

  it("forks the encoded Captain session identity", async () => {
    const fork = { id: "fork-1", forkedFrom: "session/1", messages: [] };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json(fork, { status: 201 }));

    await expect(
      forkChatSession("/api/chat/sessions/", "session/1", fetchMock),
    ).resolves.toEqual(fork);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions/session%2F1/fork",
      {
        method: "POST",
        headers: { Accept: "application/json" },
      },
    );
  });

  it.each([
    { sessionsApi: "/api/chat/sessions", endpoint: "/api/chat/sessions/s-1" },
    { sessionsApi: "/api/chat/sessions/", endpoint: "/api/chat/sessions/s-1" },
    {
      sessionsApi: "/api/chat/sessions////",
      endpoint: "/api/chat/sessions/s-1",
    },
    { sessionsApi: "////", endpoint: "/s-1" },
    { sessionsApi: "", endpoint: "/s-1" },
  ])(
    "strips trailing slashes from $sessionsApi without a backtracking regex",
    async ({ sessionsApi, endpoint }) => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(session), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      await getChatSession(sessionsApi, "s-1", fetchMock);

      expect(fetchMock).toHaveBeenCalledWith(endpoint, {
        headers: { Accept: "application/json" },
      });
    },
  );

  it("fails loudly without a session", async () => {
    await expect(
      postToolApproval(
        {
          sessionsApi: "/api/chat/sessions",
          sessionId: "",
          approvalId: "approval-1",
          approved: false,
        },
        vi.fn(),
      ),
    ).rejects.toThrow(
      new Error("A session id is required to resolve this tool approval."),
    );
  });

  it("includes the backend reason when the decision is rejected", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("approval is already resolved", { status: 409 }),
      );

    await expect(
      postToolApproval(
        {
          sessionsApi: "/api/chat/sessions",
          sessionId: "session-1",
          approvalId: "approval-1",
          approved: false,
          reason: "Wrong account",
        },
        fetchMock,
      ),
    ).rejects.toThrow(
      new Error(
        "Tool approval failed with status 409: approval is already resolved",
      ),
    );
  });
});
