import type {
  UIMessage,
  ToolUIPart,
  DynamicToolUIPart,
  ChatStatus,
  ReasoningUIPart,
  FileUIPart,
} from "ai";
import type { ReactNode } from "react";

export type { UIMessage, ToolUIPart, DynamicToolUIPart, ChatStatus, ReasoningUIPart, FileUIPart };

/** A selectable chat model, as served by the backend's GET /api/chat/models.
 *  `configured` is false for catalogued models whose provider has no API key. */
export interface ChatModel {
  id: string;
  provider: string;
  label: string;
  reasoning: boolean;
  configured?: boolean;
  /** Max context tokens — the denominator for a usage gauge. */
  contextWindow?: number;
}

/** Per-message metadata the backend rides on the SSE `finish` part
 *  (`messageMetadata`), applied by the AI SDK to the assistant `UIMessage`. */
export interface ChatMessageMetadata {
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  /** This turn's cost in USD. */
  cost?: number;
  /** Cumulative thread cost in USD (when the turn is persisted to a thread). */
  threadCostUsd?: number;
  /** This turn's input-token count, ≈ current context-window occupancy. */
  contextTokens?: number;
}

/** A flattened usage snapshot a chat surfaces for a gauge: tokens used out of the
 *  model's context window, plus cumulative cost. */
export interface ChatUsageSummary {
  usedTokens: number;
  maxTokens: number;
  cost?: number;
  messageCount: number;
  modelLabel?: string;
}

/** A suggested prompt shown on the empty state. A bare string is both the label
 *  and the submitted text; the object form separates them. */
export type Suggestion = string | { label: string; prompt: string };

/** The label shown for a suggestion. */
export function suggestionLabel(s: Suggestion): string {
  return typeof s === "string" ? s : s.label;
}

/** The text submitted when a suggestion is clicked. */
export function suggestionPrompt(s: Suggestion): string {
  return typeof s === "string" ? s : s.prompt;
}

/** Returns true for an assistant reasoning ("thinking") part. */
export function isReasoningPart(part: { type: string }): part is ReasoningUIPart {
  return part.type === "reasoning";
}

/** Returns true for a file/attachment part. */
export function isFilePart(part: { type: string }): part is FileUIPart {
  return part.type === "file";
}

/** A tool part as it appears in an assistant UIMessage — either a typed
 *  `tool-<name>` part or the generic `dynamic-tool` part. clicky operations
 *  surface as dynamic tools, so the chat UI renders both shapes. */
export type AnyToolPart = ToolUIPart | DynamicToolUIPart;

/** Tool metadata shared by the chat shell. It both configures the
 *  tool-preferences popover (`name`/`label`/`group`) and carries the schema
 *  derived from a clicky RPC operation (`description`/`inputSchema`). The Go
 *  backend owns execution; the client uses this only for display and to scope
 *  which tools a request may call (passed in the transport `body`). */
export interface ToolMeta {
  /** Stable tool name sent to the model (the operation id). */
  name: string;
  /** Human-readable label shown in the tool-preferences popover. */
  label: string;
  /** Bucket heading in the popover — the clicky surface for RPC operations. */
  group?: string;
  /** Description shown in tool pickers / tool-call headers. */
  description?: string;
  /** JSON-Schema for the tool's input, assembled from an operation's
   *  parameters + request body. Omitted for hand-authored tools. */
  inputSchema?: ChatToolInputSchema;
}

export interface ChatToolInputSchema {
  type: "object";
  properties: Record<string, JSONSchemaProperty>;
  required: string[];
}

export interface JSONSchemaProperty {
  type?: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
}

/** Returns true for a `dynamic-tool` part (clicky operations surface this way). */
export function isDynamicToolPart(part: { type: string }): part is DynamicToolUIPart {
  return part.type === "dynamic-tool";
}

/** Returns true for a typed `tool-<name>` part. */
export function isTypedToolPart(part: { type: string }): part is ToolUIPart {
  return part.type.startsWith("tool-");
}

/** The display name of a tool part: the explicit `toolName` for dynamic tools,
 *  otherwise the suffix after `tool-`. */
export function toolPartName(part: AnyToolPart): string {
  if (isDynamicToolPart(part)) {
    return part.toolName;
  }
  return part.type.slice("tool-".length);
}

export interface ToolResultRenderArgs {
  part: AnyToolPart;
  toolName: string;
  output: unknown;
}

export type ToolResultRenderer = (args: ToolResultRenderArgs) => ReactNode;
