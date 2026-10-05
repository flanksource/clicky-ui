import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chat } from "./Chat";

const pendingMessage: UIMessage = {
  id: "pending",
  role: "assistant",
  parts: [
    {
      type: "dynamic-tool",
      toolCallId: "edit",
      toolName: "editRecord",
      state: "approval-requested",
      input: {},
      approval: { id: "decision" },
    },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("Chat approval waiting", () => {
  it("keeps waiting suppressed until every approval in the active thread settles", async () => {
    const responses: Array<(response: Response) => void> = [];
    let resolveTurn!: (stream: ReadableStream<UIMessageChunk>) => void;
    const transport: ChatTransport<UIMessage> = {
      sendMessages: () =>
        new Promise((resolve) => {
          resolveTurn = resolve;
        }),
      reconnectToStream: async () => null,
    };
    const second: UIMessage = {
      id: "pending-second",
      role: "assistant",
      parts: [
        {
          type: "dynamic-tool",
          toolCallId: "edit-second",
          toolName: "editRecord",
          state: "approval-requested",
          input: {},
          approval: { id: "decision-second" },
        },
      ],
    };
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).includes("/approvals/")
        ? new Promise((resolve) => {
            responses.push(resolve);
          })
        : Promise.resolve(
            Response.json({
              id: "thread-a",
              messages: [pendingMessage, second],
            }),
          ),
    );
    render(
      <Chat
        models={[]}
        modelsApi={null}
        sessionsApi="/api/chat/sessions"
        transport={transport}
        threadId="thread-a"
      />,
    );
    const buttons = await screen.findAllByRole("button", { name: "Approve" });
    fireEvent.click(buttons[0]!);
    fireEvent.click(buttons[1]!);
    await waitFor(() => expect(responses).toHaveLength(2));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Continue" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(resolveTurn).toBeTypeOf("function"));
    expect(
      screen.queryByText("Waiting for response..."),
    ).not.toBeInTheDocument();
    await act(async () =>
      responses[0]!(
        Response.json({ error: "First decision failed" }, { status: 500 }),
      ),
    );
    expect(
      screen.queryByText("Waiting for response..."),
    ).not.toBeInTheDocument();
    await act(async () =>
      responses[1]!(
        Response.json({ error: "Second decision failed" }, { status: 500 }),
      ),
    );
    expect(
      await screen.findByText("Waiting for response..."),
    ).toBeInTheDocument();
    await act(async () =>
      resolveTurn(
        new ReadableStream({
          start(controller) {
            controller.enqueue({ type: "start" });
            controller.enqueue({ type: "finish" });
            controller.close();
          },
        }),
      ),
    );
  });

  it.each(["success", "failure"])(
    "keeps a new thread waiting while an old approval settles with %s",
    async (outcome) => {
      let resolveApproval!: (response: Response) => void;
      let resolveTurn!: (stream: ReadableStream<UIMessageChunk>) => void;
      const transport: ChatTransport<UIMessage> = {
        sendMessages: () =>
          new Promise((resolve) => {
            resolveTurn = resolve;
          }),
        reconnectToStream: async () => null,
      };
      vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
        const url = String(input);
        if (url.includes("/approvals/"))
          return new Promise((resolve) => {
            resolveApproval = resolve;
          });
        const id = url.endsWith("thread-a") ? "thread-a" : "thread-b";
        return Promise.resolve(
          Response.json({
            id,
            messages: id === "thread-a" ? [pendingMessage] : [],
          }),
        );
      });
      const props = {
        models: [],
        modelsApi: null,
        sessionsApi: "/api/chat/sessions",
        transport,
      } as const;
      const { rerender } = render(<Chat {...props} threadId="thread-a" />);
      fireEvent.click(await screen.findByRole("button", { name: "Approve" }));
      await waitFor(() => expect(resolveApproval).toBeTypeOf("function"));
      rerender(<Chat {...props} threadId="thread-b" />);
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Approve" }),
        ).not.toBeInTheDocument(),
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Inspect this thread" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(
        await screen.findByText("Waiting for response..."),
      ).toBeInTheDocument();
      await act(async () => {
        resolveApproval(
          outcome === "success"
            ? Response.json({ id: "thread-a", messages: [] })
            : Response.json({ error: "Decision failed" }, { status: 500 }),
        );
      });
      expect(screen.getByText("Waiting for response...")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      await act(async () => {
        resolveTurn(
          new ReadableStream({
            start(controller) {
              controller.enqueue({ type: "start" });
              controller.enqueue({ type: "finish" });
              controller.close();
            },
          }),
        );
      });
      await waitFor(() =>
        expect(
          screen.queryByText("Waiting for response..."),
        ).not.toBeInTheDocument(),
      );
    },
  );
});
