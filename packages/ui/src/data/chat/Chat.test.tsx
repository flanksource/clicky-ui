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

const RESOLVED_MODEL: ChatModel = {
  id: "anthropic/claude-sonnet-4-5",
  provider: "anthropic",
  label: "Claude Sonnet 4.5",
  reasoning: true,
  contextWindow: 200_000,
};

const RUNTIME_MODEL: ChatModel = {
  ...RESOLVED_MODEL,
  capabilitiesKnown: true,
  supportedEfforts: ["low", "medium", "high"],
  defaultEffort: "medium",
  runtime: {
    model: "claude-sonnet-4-5",
    id: RESOLVED_MODEL.id,
    backend: "anthropic",
    effort: "medium",
  },
};

describe("Chat runtime controls", () => {
  it("renders the RuntimeBar combo instead of separate model and effort selectors", () => {
    render(
      <Chat
        models={[RUNTIME_MODEL]}
        modelsApi={null}
        defaultModel={RUNTIME_MODEL.id}
        transport={recordingTransport()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Model" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Reasoning effort" }),
    ).not.toBeInTheDocument();
  });

  it("updates the complete runtime when the combo changes family", () => {
    const onRuntimeChange = vi.fn();
    render(
      <Chat
        models={[RUNTIME_MODEL]}
        modelsApi={null}
        defaultModel={RUNTIME_MODEL.id}
        transport={recordingTransport()}
        onRuntimeChange={onRuntimeChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Runtime: Anthropic, API, Claude Sonnet 4.5, effort Medium",
      }),
    );
    fireEvent.click(screen.getByRole("radio", { name: "OpenAI" }));

    expect(onRuntimeChange).toHaveBeenCalledWith({
      backend: "openai",
      effort: "medium",
    });
    expect(
      screen.getByRole("button", {
        name: "Runtime: OpenAI, API, Prompt default, effort Medium",
      }),
    ).toBeInTheDocument();
  });
});

describe("Chat initialPrompt", () => {
  it("waits for canonical session hydration before sending an initial prompt", async () => {
    const sendMessages = vi.fn();
    let resolveHydration: ((response: Response) => void) | undefined;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveHydration = resolve;
      }),
    );

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport(sendMessages)}
        threadId="session-1"
        sessionsApi="/api/chat/sessions"
        initialPrompt={{ id: 1, text: "Inspect the ledger" }}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(sendMessages).not.toHaveBeenCalled();
    resolveHydration?.(
      new Response(
        JSON.stringify({ id: "session-1", revision: 1, messages: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledOnce());
    fetchMock.mockRestore();
  });

  it("uses the Captain thread id as the stable AI SDK chat id", async () => {
    const sendMessages = vi.fn();
    const transport = recordingTransport(sendMessages);

    const { rerender } = render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={transport}
        threadId="thread-1"
        initialPrompt={{ id: 1, text: "Inspect account one" }}
      />,
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(1));
    expect(sendMessages.mock.calls[0]?.[0]).toMatchObject({
      chatId: "thread-1",
      messages: [expect.objectContaining({ role: "user" })],
    });

    rerender(
      <Chat
        models={[]}
        modelsApi={null}
        transport={transport}
        threadId="thread-2"
        initialPrompt={{ id: 2, text: "Inspect account two" }}
      />,
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(2));
    expect(sendMessages.mock.calls[1]?.[0]).toMatchObject({
      chatId: "thread-2",
      messages: [expect.objectContaining({ role: "user" })],
    });
    expect(sendMessages.mock.calls[1]?.[0].messages).toHaveLength(1);
  });

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

  it("submits the selected model's exact runtime without conflicting scalar fields", async () => {
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
      runtime: runtimeModel.runtime,
    });
    expect(JSON.parse(String(request?.body))).not.toHaveProperty("model");
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

describe("Chat Captain session projection", () => {
  const pendingMessage = (): UIMessage => ({
    id: "assistant-pending",
    role: "assistant",
    parts: [
      {
        type: "dynamic-tool",
        toolCallId: "call-account-1",
        toolName: "account_edit",
        state: "approval-requested",
        input: { id: "account-1" },
        approval: { id: "approval-1" },
      },
    ],
  });

  it("hydrates messages from the Captain session GET", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "session-1",
          revision: 2,
          messages: [
            {
              id: "user-1",
              role: "user",
              parts: [{ type: "text", text: "Edit the account" }],
            },
            pendingMessage(),
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport()}
        threadId="session-1"
        sessionsApi="/api/chat/sessions"
      />,
    );

    expect(await screen.findByText("Edit the account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/chat/sessions/session-1", {
      headers: { Accept: "application/json" },
    });
    fetchMock.mockRestore();
  });

  it("replaces local messages with the session returned by approval", async () => {
    const sendMessages = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "session-1",
            revision: 2,
            messages: [pendingMessage()],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "session-1",
            revision: 3,
            messages: [
              {
                id: "assistant-pending",
                role: "assistant",
                parts: [
                  {
                    type: "dynamic-tool",
                    toolCallId: "call-account-1",
                    toolName: "account_edit",
                    state: "output-available",
                    input: { id: "account-1" },
                    output: { updated: true },
                    approval: { id: "approval-1", approved: true },
                  },
                  { type: "text", text: "Updated from Captain." },
                ],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport(sendMessages)}
        threadId="session-1"
        sessionsApi="/api/chat/sessions"
        initialMessages={[pendingMessage()]}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Approve" }));

    expect(
      await screen.findByText("Updated from Captain."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions/session-1/approvals/approval-1",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sendMessages).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it("keeps a rejected decision pending and shows the backend reason", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "session-1",
            revision: 2,
            messages: [pendingMessage()],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response("approval already resolved", { status: 409 }),
      );

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport()}
        threadId="session-1"
        sessionsApi="/api/chat/sessions"
        initialMessages={[pendingMessage()]}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Approve" }));

    expect(
      await screen.findByText(
        "Tool approval failed with status 409: approval already resolved",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    fetchMock.mockRestore();
  });
});
