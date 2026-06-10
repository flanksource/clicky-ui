import type { UIMessage, ToolUIPart, DynamicToolUIPart, ChatStatus } from "ai";

export type { UIMessage, ToolUIPart, DynamicToolUIPart, ChatStatus };

/** A tool part as it appears in an assistant UIMessage — either a typed
 *  `tool-<name>` part or the generic `dynamic-tool` part. clicky operations
 *  surface as dynamic tools, so the chat UI renders both shapes. */
export type AnyToolPart = ToolUIPart | DynamicToolUIPart;

/** AI-tool metadata derived from a clicky RPC operation. The Go backend owns
 *  execution; the client uses this only for display and to scope which tools a
 *  request may call (passed in the transport `body`). */
export interface ChatToolMeta {
  /** Stable tool name sent to the model (the operation id). */
  name: string;
  /** Human-readable description shown in tool pickers / tool-call headers. */
  description?: string | undefined;
  /** JSON-Schema for the tool's input, assembled from the operation's
   *  parameters + request body. */
  inputSchema: ChatToolInputSchema;
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
