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
            threadsApi={null}
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

  it("forwards rich context items alongside the serialized context summary", () => {
    const contextItems = [
      {
        id: "formula",
        type: "formula",
        label: "Formula Playground",
        fields: { entity: "Demo Co" },
        payload: { formula: "=tb.total", result: 42 },
      },
    ];

    expect(
      chatWindowRequestBody({
        base: { model: "test" },
        contextItems,
        tools: CHAT_WINDOW_TEST_TOOLS,
        toolPrefs: { listPods: "on" },
      }),
    ).toEqual({
      model: "test",
      context: "Context:\n[formula] Formula Playground (entity: Demo Co)\n\n",
      contextItems,
      toolPreferences: { listPods: "on" },
    });
  });

  it("passes panel initial prompts into the inner chat", async () => {
    const sendMessages = vi.fn();

    render(
      <ChatWindowManagerProvider storageId="initial-prompt">
        <OpenChatWindowOnMount
          initialPrompt={{ id: 1, text: "Fix this formula" }}
        >
          <ChatWindowLayer
            threadsApi={null}
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
});
