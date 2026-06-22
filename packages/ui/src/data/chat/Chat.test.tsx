import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { Chat } from "./Chat";

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
});
