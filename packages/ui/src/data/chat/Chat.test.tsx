import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { Chat } from "./Chat";
import type { ChatModel } from "./types";

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

const RESOLVED_MODEL: ChatModel = {
  id: "anthropic/claude-sonnet-4-5",
  provider: "anthropic",
  label: "Claude Sonnet 4.5",
  reasoning: true,
  contextWindow: 200_000,
};

describe("Chat initialPrompt", () => {
  it("sends each initial prompt id once", async () => {
    const sendMessages = vi.fn();
    const onInitialPromptSent = vi.fn();
    const transport = recordingTransport(sendMessages);

    const { rerender } = render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={transport}
        initialPrompt={{ id: 1, text: "Fix this formula" }}
        onInitialPromptSent={onInitialPromptSent}
      />,
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(1));
    expect(JSON.stringify(sendMessages.mock.calls[0]?.[0])).toContain("Fix this formula");
    expect(onInitialPromptSent).toHaveBeenCalledTimes(1);

    rerender(
      <Chat
        models={[]}
        modelsApi={null}
        transport={transport}
        initialPrompt={{ id: 1, text: "Fix this formula" }}
        onInitialPromptSent={onInitialPromptSent}
      />,
    );
    expect(sendMessages).toHaveBeenCalledTimes(1);

    rerender(
      <Chat
        models={[]}
        modelsApi={null}
        transport={transport}
        initialPrompt={{ id: 2, text: "Fix this formula" }}
        onInitialPromptSent={onInitialPromptSent}
      />,
    );
    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(2));
    expect(onInitialPromptSent).toHaveBeenCalledTimes(2);
  });

  it("submits the selected model's exact runtime with its display id", async () => {
    const runtimeModel: ChatModel = {
      ...RESOLVED_MODEL,
      id: "claude-sonnet-5",
      runtime: {
        model: "claude-sonnet-5",
        backend: "claude-agent",
      },
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", {
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
      }),
    );

    render(
      <Chat
        api="/api/chat"
        models={[runtimeModel]}
        modelsApi={null}
        defaultModel={runtimeModel.id}
        initialPrompt={{ id: 1, text: "Inspect the ledger" }}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      model: runtimeModel.id,
      runtime: runtimeModel.runtime,
    });
    fetchMock.mockRestore();
  });
});

describe("Chat context meter", () => {
  it("renders before usage when the thread id is resolved", () => {
    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport()}
        threadId="session-01JZQX7TXAXQM0RHD7XCGBF8F0"
      />,
    );

    expect(screen.getByLabelText("Context 0% used")).toBeInTheDocument();
  });

  it("renders before usage when the selected model is resolved", () => {
    render(
      <Chat
        models={[RESOLVED_MODEL]}
        modelsApi={null}
        defaultModel={RESOLVED_MODEL.id}
        transport={recordingTransport()}
      />,
    );

    expect(screen.getByLabelText("Context 0% used")).toBeInTheDocument();
  });
});
