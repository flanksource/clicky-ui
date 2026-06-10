import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

/** Emits the given chunks as a ReadableStream, with a small delay between each
 *  so the UI visibly streams in Storybook. */
function streamChunks(chunks: UIMessageChunk[], delayMs: number): ReadableStream<UIMessageChunk> {
  let i = 0;
  return new ReadableStream<UIMessageChunk>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      const chunk = chunks[i++];
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          controller.enqueue(chunk);
          resolve();
        }, delayMs);
      });
    },
  });
}

const TEXT_TURN: UIMessageChunk[] = [
  { type: "start" },
  { type: "start-step" },
  { type: "text-start", id: "t0" },
  { type: "text-delta", id: "t0", delta: "Here is **markdown** with a list:\n\n" },
  { type: "text-delta", id: "t0", delta: "- one\n- two\n- three" },
  { type: "text-end", id: "t0" },
  { type: "finish-step" },
  { type: "finish" },
];

const TOOL_TURN: UIMessageChunk[] = [
  { type: "start" },
  { type: "start-step" },
  {
    type: "tool-input-available",
    toolCallId: "call_1",
    toolName: "listPods",
    input: { namespace: "default", limit: 5 },
    dynamic: true,
  },
  {
    type: "tool-output-available",
    toolCallId: "call_1",
    output: { count: 2, pods: ["api-7c9", "worker-1f2"] },
    dynamic: true,
  },
  { type: "text-start", id: "t1" },
  { type: "text-delta", id: "t1", delta: "Found **2 pods** in `default`." },
  { type: "text-end", id: "t1" },
  { type: "finish-step" },
  { type: "finish" },
];

/** A mock ChatTransport that replies with a markdown text turn, then a tool
 *  round-trip turn on the next submission. Use in stories/tests to drive the
 *  Chat UI without a backend. */
export function mockChatTransport(delayMs = 120): ChatTransport<UIMessage> {
  let calls = 0;
  return {
    sendMessages() {
      const chunks = calls++ === 0 ? TEXT_TURN : TOOL_TURN;
      return Promise.resolve(streamChunks(chunks, delayMs));
    },
    reconnectToStream() {
      return Promise.resolve(null);
    },
  };
}
