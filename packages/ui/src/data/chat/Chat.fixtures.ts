import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import type { ChatModel } from "./types";

/** A sample model menu for stories driving the model selector. */
export const MOCK_MODELS: ChatModel[] = [
  { id: "anthropic/claude-sonnet-4-5", provider: "anthropic", label: "Claude Sonnet 4.5", reasoning: true, configured: true, contextWindow: 200_000 },
  { id: "openai/gpt-4o", provider: "openai", label: "GPT-4o", reasoning: false, configured: true, contextWindow: 128_000 },
  { id: "googleai/gemini-2.5-pro", provider: "googleai", label: "Gemini 2.5 Pro", reasoning: true, configured: false, contextWindow: 1_048_576 },
];

/** A seeded conversation that already contains a completed tool call, so a
 *  story shows the collapsible tool-call panel (args → result) on load, without
 *  the user sending a message. clicky operations surface as dynamic tools. */
export const SAMPLE_TOOL_MESSAGES: UIMessage[] = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "List the pods in default" }] },
  {
    id: "a1",
    role: "assistant",
    parts: [
      {
        type: "dynamic-tool",
        toolCallId: "call_listPods",
        toolName: "listPods",
        state: "output-available",
        input: { namespace: "default", limit: 5 },
        output: { count: 2, pods: ["api-7c9", "worker-1f2"] },
      },
      { type: "text", text: "Found **2 pods** in `default`: `api-7c9` and `worker-1f2`." },
    ],
  },
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
  {
    type: "finish",
    messageMetadata: {
      usage: { inputTokens: 920, outputTokens: 280, totalTokens: 1200 },
      contextTokens: 1200,
      cost: 0.004,
    },
  },
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
  {
    type: "finish",
    messageMetadata: {
      usage: { inputTokens: 2600, outputTokens: 800, totalTokens: 3400 },
      contextTokens: 3400,
      cost: 0.011,
    },
  },
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
