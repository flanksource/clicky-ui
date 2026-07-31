import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

function approvalCompletionTransport(): ChatTransport<UIMessage> {
  return {
    sendMessages() {
      return Promise.resolve(
        new ReadableStream<UIMessageChunk>({
          start(controller) {
            controller.enqueue({ type: "start" });
            controller.enqueue({ type: "start-step" });
            controller.enqueue({
              type: "tool-output-available",
              toolCallId: "call-account-1",
              output: { updated: true },
              dynamic: true,
            });
            controller.enqueue({ type: "finish-step" });
            controller.enqueue({ type: "finish" });
            controller.close();
          },
        }),
      );
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
    expect(JSON.stringify(sendMessages.mock.calls[0]?.[0])).toContain(
      "Fix this formula",
    );
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

  it("shows the selected runtime execution mode", async () => {
    const runtimeModel: ChatModel = {
      ...RESOLVED_MODEL,
      runtime: {
        backend: "claude-agent",
        mode: "agent",
      },
    };
    render(
      <Chat
        models={[runtimeModel]}
        modelsApi={null}
        defaultModel={runtimeModel.id}
        transport={recordingTransport()}
      />,
    );

    fireEvent.mouseEnter(screen.getByLabelText("Context 0% used"));

    expect(await screen.findByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("agent")).toBeInTheDocument();
  });
});

describe("Chat live tool approval", () => {
  it("posts the decision before updating the local approval state", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    const initialMessages: UIMessage[] = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolCallId: "call-account-1",
            toolName: "account_edit",
            state: "approval-requested",
            input: { id: "account-1" },
            approval: { id: "call-account-1" },
          },
        ],
      },
    ];

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={approvalCompletionTransport()}
        threadId="thread-1"
        approvalApi="/api/chat/threads"
        initialMessages={initialMessages}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/threads/thread-1/approvals/call-account-1",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ approved: true }),
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Approve" }),
      ).not.toBeInTheDocument(),
    );
    fetchMock.mockRestore();
  });
});
