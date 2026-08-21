import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { ChatWindowLayer } from "./ChatWindow";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";
import { mockChatTransport } from "../chat/Chat.fixtures";
import {
  CHAT_WINDOW_TEST_TOOLS,
  OpenChatWindowOnMount,
  installMemoryStorage,
} from "./ChatWindow.test-utils";

function completeTurn(): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start" });
      controller.enqueue({ type: "start-step" });
      controller.enqueue({ type: "finish-step" });
      controller.enqueue({ type: "finish" });
      controller.close();
    },
  });
}

function recordingTransport(sendMessages = vi.fn()): ChatTransport<UIMessage> {
  return {
    sendMessages(options) {
      sendMessages(options);
      return Promise.resolve(completeTurn());
    },
    reconnectToStream() {
      return Promise.resolve(null);
    },
  };
}

beforeEach(() => installMemoryStorage());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("ChatWindow", () => {
  it("lets an app-owned picker add removable context to the current window", async () => {
    render(
      <ChatWindowManagerProvider storageId="context-picker">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            sessionsApi={null}
            toolsApi={null}
            renderContextPicker={({ onAddMany }) => (
              <button
                type="button"
                onClick={() =>
                  onAddMany([
                    { id: "record-1", type: "record", label: "Record one" },
                    { id: "record-2", type: "record", label: "Record two" },
                  ])
                }
              >
                Pick records
              </button>
            )}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByRole("button", { name: "Pick records" });
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Pick records" }));
    expect(await screen.findByText("Record one")).toBeInTheDocument();
    expect(await screen.findByText("Record two")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Record one" }));
    await waitFor(() => expect(screen.queryByText("Record one")).toBeNull());
  });

  it("forwards context and tool preferences without a legacy approval policy", () => {
    const contextItems = [
      {
        id: "formula",
        type: "formula",
        label: "Formula Playground",
        fields: { entity: "Demo Co" },
        payload: { formula: "=tb.total", result: 42 },
      },
    ];

    const body = chatWindowRequestBody({
      base: { model: "test" },
      contextItems,
      tools: CHAT_WINDOW_TEST_TOOLS,
      toolPrefs: { listPods: "on" },
    });

    expect(body).toEqual({
      model: "test",
      context: "Context:\n[formula] Formula Playground (entity: Demo Co)\n\n",
      contextItems,
      toolPreferences: { listPods: "on" },
    });
    expect(body).not.toHaveProperty("toolApproval");
  });

  it("passes panel initial prompts into the inner chat", async () => {
    const sendMessages = vi.fn();

    render(
      <ChatWindowManagerProvider storageId="initial-prompt">
        <OpenChatWindowOnMount
          initialPrompt={{ id: 1, text: "Fix this formula" }}
        >
          <ChatWindowLayer
            sessionsApi={null}
            toolsApi={null}
            chat={{
              modelsApi: null,
              transport: recordingTransport(sendMessages),
            }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(1));
    expect(JSON.stringify(sendMessages.mock.calls[0]?.[0])).toContain(
      "Fix this formula",
    );
  });

  it("creates a durable thread before sending the first prompt", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === "/api/chat/sessions" && init?.method === "POST") {
          return Response.json(
            { id: "thread-1", title: "New conversation" },
            { status: 201 },
          );
        }
        if (String(input) === "/api/chat" && init?.method === "POST") {
          return new Response("", {
            status: 200,
            headers: {
              "content-type": "text/event-stream",
              "x-vercel-ai-ui-message-stream": "v1",
            },
          });
        }
        if (String(input) === "/api/chat/sessions/thread-1") {
          return Response.json({ id: "thread-1", revision: 1, messages: [] });
        }
        if (String(input) === "/api/chat/sessions") {
          return Response.json([]);
        }
        throw new Error(`unexpected request ${String(input)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatWindowManagerProvider storageId="durable-thread">
        <OpenChatWindowOnMount
          initialPrompt={{ id: 1, text: "Edit this account" }}
        >
          <ChatWindowLayer
            toolsApi={null}
            chat={{
              api: "/api/chat",
              modelsApi: null,
            }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([input, init]) =>
            String(input) === "/api/chat" && init?.method === "POST",
        ),
      ).toBe(true),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions",
      expect.objectContaining({ method: "POST" }),
    );
    const chatRequest = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input) === "/api/chat" && init?.method === "POST",
    );
    expect(JSON.parse(String(chatRequest?.[1]?.body))).toMatchObject({
      threadId: "thread-1",
    });
  });

  it("hydrates the runtime lock and opens a fork in a new panel without changing global model preferences", async () => {
    localStorage.setItem(
      "clicky-ui.chat-window.preferences",
      JSON.stringify({
        runtime: { model: "gpt-5", backend: "codex-agent" },
        permissionMode: "default",
      }),
    );
    const sourceMessage = {
      id: "source-user",
      role: "user",
      parts: [{ type: "text", text: "Source question" }],
    };
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/chat/sessions" && !init?.method) {
          return Response.json([{ id: "source-1", title: "Source" }]);
        }
        if (url === "/api/chat/sessions/source-1" && !init?.method) {
          return Response.json({
            id: "source-1",
            runtime: { model: "claude-sonnet-4-6", backend: "anthropic" },
            messages: [sourceMessage],
          });
        }
        if (
          url === "/api/chat/sessions/source-1/fork" &&
          init?.method === "POST"
        ) {
          return Response.json(
            {
              id: "fork-1",
              forkedFrom: "source-1",
              messages: [
                {
                  id: "fork-seed",
                  role: "user",
                  parts: [
                    {
                      type: "data-fork-seed",
                      data: { forkedFrom: "source-1", title: "Source" },
                    },
                    { type: "text", text: "Source transcript" },
                  ],
                },
              ],
            },
            { status: 201 },
          );
        }
        if (url === "/api/chat/sessions/fork-1" && !init?.method) {
          return Response.json({
            id: "fork-1",
            forkedFrom: "source-1",
            messages: [
              {
                id: "fork-seed",
                role: "user",
                parts: [
                  {
                    type: "data-fork-seed",
                    data: { forkedFrom: "source-1", title: "Source" },
                  },
                  { type: "text", text: "Source transcript" },
                ],
              },
            ],
          });
        }
        throw new Error(`unexpected request ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatWindowManagerProvider storageId="fork-window">
        <OpenChatWindowOnMount threadId="source-1">
          <ChatWindowLayer
            toolsApi={null}
            chat={{ modelsApi: null, transport: recordingTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Source question")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", {
        name: /Model and backend are locked for this conversation/,
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Fork conversation into a new window",
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("Forked from Source")).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions/source-1/fork",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      screen.getByRole("button", {
        name: "Send a message before forking this conversation",
      }),
    ).toBeDisabled();
    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem("clicky-ui.chat-window.preferences") ?? "{}",
      );
      expect(saved.runtime).toMatchObject({
        model: "gpt-5",
        backend: "codex-agent",
      });
    });
  });

  it("ignores a fork response after the source panel switches threads", async () => {
    let resolveFork!: (response: Response) => void;
    const pendingFork = new Promise<Response>((resolve) => {
      resolveFork = resolve;
    });
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/chat/sessions" && !init?.method) {
          return Response.json([
            { id: "source-1", title: "Source" },
            { id: "other-1", title: "Other" },
          ]);
        }
        if (url === "/api/chat/sessions/source-1" && !init?.method) {
          return Response.json({
            id: "source-1",
            messages: [
              {
                id: "source-user",
                role: "user",
                parts: [{ type: "text", text: "Source question" }],
              },
            ],
          });
        }
        if (url === "/api/chat/sessions/other-1" && !init?.method) {
          return Response.json({
            id: "other-1",
            messages: [
              {
                id: "other-user",
                role: "user",
                parts: [{ type: "text", text: "Other question" }],
              },
            ],
          });
        }
        if (
          url === "/api/chat/sessions/source-1/fork" &&
          init?.method === "POST"
        ) {
          return pendingFork;
        }
        if (url === "/api/chat/sessions/fork-1" && !init?.method) {
          throw new Error("stale fork must not be opened");
        }
        throw new Error(`unexpected request ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatWindowManagerProvider storageId="stale-fork-window">
        <OpenChatWindowOnMount threadId="source-1">
          <ChatWindowLayer
            toolsApi={null}
            chat={{ modelsApi: null, transport: recordingTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Source question")).toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Fork conversation into a new window",
      }),
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/chat/sessions/source-1/fork",
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    fireEvent.click(await screen.findByText("Other"));
    await waitFor(() =>
      expect(screen.getByText("Other question")).toBeInTheDocument(),
    );

    resolveFork(
      Response.json(
        { id: "fork-1", forkedFrom: "source-1", messages: [] },
        { status: 201 },
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Fork conversation into a new window",
        }),
      ).toBeEnabled(),
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === "/api/chat/sessions/fork-1" && !init?.method,
      ),
    ).toBe(false);
  });
});
