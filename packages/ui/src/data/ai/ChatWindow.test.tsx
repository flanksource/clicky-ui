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
});
