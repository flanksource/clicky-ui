import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  it("does not report a model change when a shared row keeps its identity", () => {
    const apiModel: ChatModel = {
      id: "openai/gpt-5.6-luna",
      provider: "openai",
      label: "GPT-5.6 Luna",
      reasoning: false,
      configured: true,
      capabilitiesKnown: true,
      runtime: {
        id: "openai/gpt-5.6-luna",
        model: "gpt-5.6-luna",
        backend: "openai",
        mode: "api",
      },
    };
    const agentModel: ChatModel = {
      id: "gpt-5.6-luna",
      provider: "codex-agent",
      label: "GPT-5.6 Luna",
      reasoning: false,
      configured: true,
      capabilitiesKnown: true,
      runtime: {
        model: "gpt-5.6-luna",
        backend: "codex-agent",
        mode: "agent",
      },
    };
    const onRuntimeChange = vi.fn();
    const onModelChange = vi.fn();

    render(
      <Chat
        models={[apiModel, agentModel]}
        modelsApi={null}
        defaultModel={agentModel.id}
        runtimeFamilies={[
          {
            id: "codex",
            label: "Codex",
            provider: "codex-agent",
            modes: [
              {
                id: "agent",
                label: "Agent",
                backend: "codex-agent",
                provider: "codex-agent",
              },
              {
                id: "cli",
                label: "CLI",
                backend: "codex-cli",
                provider: "codex-agent",
              },
            ],
          },
        ]}
        transport={recordingTransport()}
        onRuntimeChange={onRuntimeChange}
        onModelChange={onModelChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Runtime: Codex, Agent, GPT-5.6 Luna, effort None",
      }),
    );
    fireEvent.click(screen.getByRole("radio", { name: "CLI" }));

    expect(onRuntimeChange).toHaveBeenCalledWith({
      model: "gpt-5.6-luna",
      backend: "codex-cli",
      mode: "cli",
    });
    expect(onModelChange).not.toHaveBeenCalled();
  });

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
      mode: "api",
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

  it("shows terminal metadata instead of selected runtime identity", async () => {
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
        threadId="request-thread"
        initialMessages={[
          {
            id: "assistant-terminal",
            role: "assistant",
            parts: [],
            metadata: {
              backend: "claude-cmux",
              executionMode: "cmux",
              model: "claude-opus-terminal",
              captainSessionId: "captain-session",
              providerSessionId: "provider-session",
              threadId: "terminal-thread",
              turnId: "terminal-turn",
            },
          },
        ]}
      />,
    );

    fireEvent.mouseEnter(screen.getByLabelText("Context 0% used"));

    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("claude-opus-terminal")).toBeInTheDocument();
    expect(screen.getByText("claude-cmux")).toBeInTheDocument();
    expect(screen.getByText("cmux")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy captain session ID" }),
    ).toHaveAttribute("title", "captain-session");
    expect(
      screen.getByRole("button", { name: "Copy provider session ID" }),
    ).toHaveAttribute("title", "provider-session");
    expect(
      screen.getByRole("button", { name: "Copy thread ID" }),
    ).toHaveAttribute("title", "terminal-thread");
    expect(
      screen.getByRole("button", { name: "Copy turn ID" }),
    ).toHaveAttribute("title", "terminal-turn");
    expect(screen.queryByText("agent")).not.toBeInTheDocument();
    expect(screen.queryByText("request-thread")).not.toBeInTheDocument();
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

  it("reports authoritative runtime hydration and excludes fork seeds from the message count", async () => {
    const onSessionHydrated = vi.fn();
    const onMessageCountChange = vi.fn();
    const session = {
      id: "session-1",
      revision: 2,
      runtime: { model: "gpt-5", backend: "openai" },
      messages: [
        {
          id: "fork-seed",
          role: "user",
          parts: [
            {
              type: "data-fork-seed",
              data: { forkedFrom: "source-1", title: "Source" },
            },
            { type: "text", text: "Prior transcript" },
          ],
        },
        {
          id: "user-1",
          role: "user",
          parts: [{ type: "text", text: "Continue here" }],
        },
      ],
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json(session));

    render(
      <Chat
        models={[]}
        modelsApi={null}
        transport={recordingTransport()}
        threadId="session-1"
        sessionsApi="/api/chat/sessions"
        onSessionHydrated={onSessionHydrated}
        onMessageCountChange={onMessageCountChange}
      />,
    );

    expect(await screen.findByText("Continue here")).toBeInTheDocument();
    expect(screen.getByText("Forked from Source")).toBeInTheDocument();
    expect(onSessionHydrated).toHaveBeenCalledWith(session);
    expect(onMessageCountChange).toHaveBeenLastCalledWith(1);
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

    await waitFor(() =>
      expect(screen.getByText("Updated from Captain.")).toBeInTheDocument(),
    );
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

  it("does not let an approval response overwrite a newly selected thread", async () => {
    let resolveApproval: ((response: Response) => void) | undefined;
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/session-1")) {
          return Promise.resolve(
            Response.json({
              id: "session-1",
              messages: [pendingMessage()],
            }),
          );
        }
        if (url.includes("/session-1/approvals/")) {
          return new Promise<Response>((resolve) => {
            resolveApproval = resolve;
          });
        }
        if (url.endsWith("/session-2")) {
          return Promise.resolve(
            Response.json({
              id: "session-2",
              messages: [
                {
                  id: "thread-2-user",
                  role: "user",
                  parts: [{ type: "text", text: "Thread two history" }],
                },
              ],
            }),
          );
        }
        throw new Error(`unexpected request ${url}`);
      });
    const props = {
      models: [],
      modelsApi: null,
      transport: recordingTransport(),
      sessionsApi: "/api/chat/sessions",
    } as const;
    const { rerender } = render(<Chat {...props} threadId="session-1" />);

    fireEvent.click(await screen.findByRole("button", { name: "Approve" }));
    await waitFor(() => expect(resolveApproval).toBeTypeOf("function"));
    rerender(<Chat {...props} threadId="session-2" />);
    expect(await screen.findByText("Thread two history")).toBeInTheDocument();

    await act(async () => {
      resolveApproval?.(
        Response.json({
          id: "session-1",
          messages: [
            {
              id: "old-thread-assistant",
              role: "assistant",
              parts: [{ type: "text", text: "Old approval response" }],
            },
          ],
        }),
      );
      await Promise.resolve();
    });
    expect(screen.getByText("Thread two history")).toBeInTheDocument();
    expect(screen.queryByText("Old approval response")).not.toBeInTheDocument();
    fetchMock.mockRestore();
  });
});
