import type {
  UIMessage,
  ToolUIPart,
  DynamicToolUIPart,
  ChatStatus,
  ReasoningUIPart,
  FileUIPart,
} from "ai";
import type { ReactNode } from "react";
import type {
  JsonSchemaObject,
  JsonSchemaProperty as FormJsonSchemaProperty,
} from "../../components/json-schema-form-types";

export type {
  UIMessage,
  ToolUIPart,
  DynamicToolUIPart,
  ChatStatus,
  ReasoningUIPart,
  FileUIPart,
};

/** A selectable chat model, as served by the backend's GET /api/chat/models.
 *  `configured` is false for catalogued models whose provider has no API key. */
export interface ChatModel {
  id: string;
  provider: string;
  label: string;
  reasoning: boolean;
  /** True when backend metadata is authoritative, including explicit unsupported values. */
  capabilitiesKnown?: boolean;
  /** Ordered reasoning-effort tiers accepted by this exact model. */
  supportedEfforts?: string[];
  /** Backend-recommended effort used when the current selection is invalid. */
  defaultEffort?: string;
  /** Whether the model honours the temperature sampling control. */
  temperature?: boolean;
  configured?: boolean;
  /**
   * The catalog's own declared default — the row a picker seeds with when the
   * caller names no model. At most one row carries it, and a catalog that
   * declares none (or whose default is unconfigured) falls back to the first
   * configured row.
   */
  default?: boolean;
  /** Concrete runtime backends that advertised this model. Empty/omitted means provider-wide. */
  backends?: string[];
  /** Max context tokens — the denominator for a usage gauge. */
  contextWindow?: number;
  /** MIME patterns accepted as model inputs, e.g. image/* or application/pdf. */
  inputMediaTypes?: string[];
}

/** Per-message metadata the backend rides on the SSE `finish` part
 *  (`messageMetadata`), applied by the AI SDK to the assistant `UIMessage`. */
export interface ChatMessageMetadata {
  usage?: ChatUsageBreakdown;
  costBreakdown?: ChatCostBreakdown;
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
  usage?: ChatUsageBreakdown;
  costBreakdown?: ChatCostBreakdown;
  messageCount: number;
  modelLabel?: string;
}

export interface ChatBudgetConfig {
  /** Per-thread/request cost cap in USD. */
  cost?: number;
  /** Max output tokens for one model call. */
  maxTokens?: number;
}

export interface ChatUsageBreakdown {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  totalTokens?: number;
}

export interface ChatCostBreakdown {
  model?: string;
  inputUsd?: number;
  outputUsd?: number;
  reasoningUsd?: number;
  cacheReadUsd?: number;
  cacheWriteUsd?: number;
  totalUsd?: number;
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
export function isReasoningPart(part: {
  type: string;
}): part is ReasoningUIPart {
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

/** Claude Agent SDK permission modes accepted by `permissionMode`. */
export const CLAUDE_PERMISSION_MODES = [
  "default",
  "acceptEdits",
  "bypassPermissions",
  "plan",
  "dontAsk",
  "auto",
] as const;

export type ClaudePermissionMode = (typeof CLAUDE_PERMISSION_MODES)[number];

export type ClaudePermissionModeOption = {
  value: ClaudePermissionMode;
  label: string;
  description: string;
};

export const CLAUDE_PERMISSION_MODE_OPTIONS: ClaudePermissionModeOption[] = [
  {
    value: "default",
    label: "Default",
    description:
      "Prompt for dangerous operations using standard Claude behavior.",
  },
  {
    value: "auto",
    label: "Auto",
    description:
      "Use Claude's classifier to approve or deny permission prompts.",
  },
  {
    value: "acceptEdits",
    label: "Accept edits",
    description: "Automatically accept file edit operations.",
  },
  {
    value: "dontAsk",
    label: "Don't ask",
    description: "Do not prompt; deny actions that are not pre-approved.",
  },
  {
    value: "plan",
    label: "Plan",
    description: "Planning mode with no tool execution.",
  },
  {
    value: "bypassPermissions",
    label: "Bypass",
    description:
      "Bypass permission checks when explicitly allowed by the host.",
  },
];

/** Tool metadata shared by the chat shell. It both configures the
 *  tool-preferences popover (`name`/`label`/`group`) and carries the schema
 *  derived from a clicky RPC operation (`description`/`inputSchema`). The Go
 *  backend owns execution; the client uses this only for display and to scope
 *  which tools a request may call (passed in the transport `body`). */
export type ToolMode = "on" | "ask" | "off" | "auto";

export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
  [key: string]: unknown;
}

export interface ToolMeta {
  /** Stable tool name sent to the model (the operation id). */
  name: string;
  /** Human-readable label shown in the tool-preferences popover. */
  label: string;
  /** Bucket heading in the popover — the clicky surface for RPC operations. */
  group?: string;
  /** Display title of the tool's parent surface/entity (e.g. "Xero Accounts").
   *  Used to nest tools under their entity within a group, and as the
   *  disambiguating prefix in flat lists so sibling verbs ("List", "Get") stay
   *  distinguishable. Resolved from the operation's `x-clicky.surface`. */
  parent?: string;
  /** Raw entity name of the tool's surface (e.g. "accounts"), when known. */
  entity?: string;
  /** Preference key sent to the backend. Defaults to `name`; group-backed
   *  clicky tools set this to the backend tool group. */
  preferenceKey?: string;
  /** Initial backend-owned permission when the chat window first sees this tool. */
  defaultPermission?: ToolMode;
  /** Opaque icon name emitted by the backend, resolved by the host UI. */
  icon?: string;
  /** Description shown in tool pickers / tool-call headers. */
  description?: string;
  /** Short usage hints shown in the tool browser. */
  hints?: string[];
  source?: "clicky" | "custom" | "mcp" | string;
  server?: string;
  method?: string;
  path?: string;
  operationName?: string;
  title?: string;
  /** Whether the runtime should treat the tool input schema as strict/closed. */
  strict?: boolean;
  /** Runtime tool annotations/hints, e.g. MCP/Genkit well-known hints. */
  annotations?: ToolAnnotations;
  /** JSON-Schema for the tool's input, assembled from an operation's
   *  parameters + request body. Omitted for hand-authored tools. */
  inputSchema?: ChatToolInputSchema;
  outputSchema?: ChatToolInputSchema;
}

export type ChatToolInputSchema = JsonSchemaObject;
export type JsonSchemaProperty = FormJsonSchemaProperty;
export type JSONSchemaProperty = FormJsonSchemaProperty;

/** Returns true for a `dynamic-tool` part (clicky operations surface this way). */
export function isDynamicToolPart(part: {
  type: string;
}): part is DynamicToolUIPart {
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
