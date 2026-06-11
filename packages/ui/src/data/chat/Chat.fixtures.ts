import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import type { ChatModel } from "./types";

/** A sample model menu for stories driving the model selector. */
export const MOCK_MODELS: ChatModel[] = [
  { id: "anthropic/claude-sonnet-4-5", provider: "anthropic", label: "Claude Sonnet 4.5", reasoning: true, configured: true },
  { id: "openai/gpt-4o", provider: "openai", label: "GPT-4o", reasoning: false, configured: true },
  { id: "googleai/gemini-2.5-pro", provider: "googleai", label: "Gemini 2.5 Pro", reasoning: true, configured: false },
];

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

const REASONING_TURN: UIMessageChunk[] = [
  { type: "start" },
  { type: "start-step" },
  { type: "reasoning-start", id: "r0" },
  { type: "reasoning-delta", id: "r0", delta: "The user wants pods. I'll call listPods, then summarize." },
  { type: "reasoning-end", id: "r0" },
  { type: "text-start", id: "t2" },
  { type: "text-delta", id: "t2", delta: "Let me check the pods." },
  { type: "text-end", id: "t2" },
  { type: "finish-step" },
  { type: "finish" },
];

const APPROVAL_TURN: UIMessageChunk[] = [
  { type: "start" },
  { type: "start-step" },
  { type: "text-start", id: "t3" },
  { type: "text-delta", id: "t3", delta: "This will restart the service." },
  { type: "text-end", id: "t3" },
  {
    type: "tool-input-available",
    toolCallId: "call_restart",
    toolName: "restartService",
    input: { service: "api", confirm: true },
    dynamic: true,
  },
  { type: "tool-approval-request", approvalId: "call_restart", toolCallId: "call_restart" },
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

/** A mock transport whose first turn requests tool approval, and whose resume
 *  (after the user approves/denies) completes the tool and replies. */
export function mockApprovalTransport(delayMs = 120): ChatTransport<UIMessage> {
  let calls = 0;
  return {
    sendMessages() {
      const chunks = calls++ === 0 ? APPROVAL_TURN : TOOL_TURN;
      return Promise.resolve(streamChunks(chunks, delayMs));
    },
    reconnectToStream() {
      return Promise.resolve(null);
    },
  };
}

/** A mock transport that streams a reasoning ("thinking") block before its
 *  answer. */
export function mockReasoningTransport(delayMs = 120): ChatTransport<UIMessage> {
  return {
    sendMessages() {
      return Promise.resolve(streamChunks(REASONING_TURN, delayMs));
    },
    reconnectToStream() {
      return Promise.resolve(null);
    },
  };
}
