import type { StaticIconComponent } from "../Icon";
import type {
  SessionBudget,
  SessionCapabilities,
  SessionContext,
  SessionCost,
  SessionMetadataEvent,
  SessionTurn,
  SessionUIMessage,
  SessionUIPart,
  SessionUsage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";
import {
  UiAsterisk,
  UiCamera,
  UiClose,
  UiCloudDownload,
  UiCode2,
  UiCommand,
  UiCompass,
  UiCursorClick,
  UiCursorText,
  UiDiff,
  UiEye,
  UiGlobe,
  UiHourglass,
  UiKanban,
  UiKeyboard,
  UiListChecks,
  UiMagicWand,
  UiPalette,
  UiPencilSimpleLine,
  UiProhibit,
  UiPuzzle,
  UiQuestion,
  UiRobotAi,
  UiScan,
  UiScroll,
  UiSearch,
  UiShare,
  UiSparkles,
  UiStack,
  UiStrategy,
  UiTerminal,
  UiWrench,
} from "../../icons";

// ── Captain session schema ──────────────────────────────────────────────────
// Mirrors github.com/flanksource/captain pkg/ai/history types. A session is a
// list of SessionEntry records (the rows of a Claude Code / Codex JSONL log).

export interface SessionToolUse {
  tool?: string;
  input?: Record<string, unknown>;
  timestamp?: string;
  cwd?: string;
  session_id?: string;
  tool_use_id?: string;
  /** "claude" or "codex". */
  source?: string;
  model?: string;
  reasoning_effort?: string;
  response?: string;
}

export interface SessionContent {
  /** Block kind: "text", "thinking", "tool_use", "tool_result", … */
  type?: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: Record<string, unknown>;
  id?: string;
}

export interface SessionMessage {
  role?: string;
  stop_reason?: string;
  content?: SessionContent[];
}

export interface SessionEntry {
  /** Top-level entry kind: assistant, user, system, … */
  type?: string;
  tool_use?: SessionToolUse;
  message?: SessionMessage;
  timestamp?: string;
  cwd?: string;
  sessionId?: string;
  uuid?: string;
  /** Synthetic assistant entry Claude Code writes when an API request fails. */
  isApiErrorMessage?: boolean;
  apiErrorStatus?: number;
  /** Claude Code's error classification (e.g. "rate_limit"). */
  error?: string;
}

/**
 * A session to render: the unified `SessionUIMessage[]` (preferred — what
 * `GET /api/captain/sessions/{id}` serves), a legacy `SessionEntry[]` log, or
 * raw log text (JSON array or JSONL).
 */
export type SessionInput = string | SessionEntry[] | SessionUIMessage[] | UnifiedSessionInput;

export interface SessionMetadataSummary {
  turns?: SessionTurn[];
  capabilities?: SessionCapabilities;
  budget?: SessionBudget;
  context?: SessionContext;
  events?: SessionMetadataEvent[];
  /** Dominant model id, for the context meter's hover popover. */
  model?: string;
  /** Provider id, used to resolve the model's brand glyph. */
  provider?: string;
  /** Aggregate token usage, for the context meter's hover popover. */
  usage?: SessionUsage;
  /** Aggregate cost breakdown, for the context meter's hover popover. */
  cost?: SessionCost;
}

// ── Normalized events ───────────────────────────────────────────────────────
// The raw schema interleaves consolidated `tool_use` rows with `message`
// content blocks. normalizeSession flattens both shapes into a single ordered
// list the viewer can render row-by-row.

export type SessionEventKind = "system" | "user" | "assistant" | "thinking" | "tool" | "error";

export interface SessionEvent {
  id: string;
  kind: SessionEventKind;
  /** Tool name (kind === "tool"). */
  tool?: string;
  toolInput?: Record<string, unknown>;
  toolResponse?: string;
  /** Prose for user/assistant/thinking, or the error message for errors. */
  text?: string;
  /** Working directory the tool ran in — used to relativize file paths. */
  cwd?: string;
  timestamp?: string;
  model?: string;
  reasoningEffort?: string;
  source?: string;
  turnId?: string;
  agentId?: string;
  toolState?: string;
  approval?: SessionUIPart["approval"];
  pending?: boolean;
  toolCallId?: string;
  approvalId?: string;
  sessionId?: string;
  raw?: unknown;
  errorType?: string;
  errorStatus?: number;
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

// parseEntries accepts a parsed array as-is, or parses a string as a whole-
// document JSON (array or single object, possibly pretty-printed) first, then
// falls back to JSONL (one object per line). The whole-document parse error is
// caught only to attempt the JSONL fallback — a genuinely malformed JSONL line
// throws loudly rather than being silently dropped.
function parseEntries(input: string | SessionEntry[]): SessionEntry[] {
  if (Array.isArray(input)) return input;
  const text = input.trim();
  if (!text) return [];
  try {
    const parsed: unknown = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as SessionEntry[]) : [parsed as SessionEntry];
  } catch {
    // not a single JSON document — treat as JSONL below
  }
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as SessionEntry;
      } catch {
        throw new Error(`SessionViewer: invalid session JSON line: ${truncate(line, 80)}`);
      }
    });
}

function roleFromType(type: string | undefined): string {
  return type === "system" || type === "user" || type === "assistant" ? type : "assistant";
}

function toolEvent(
  id: string,
  tool: string,
  input: Record<string, unknown> | undefined,
  response: string | undefined,
  timestamp: string | undefined,
  meta: {
    model?: string;
    reasoningEffort?: string;
    source?: string;
    cwd?: string;
    turnId?: string;
    agentId?: string;
    toolState?: string;
    approval?: SessionUIPart["approval"];
    pending?: boolean;
    toolCallId?: string;
    approvalId?: string;
    sessionId?: string;
    raw?: unknown;
  } = {},
): SessionEvent {
  return {
    id,
    kind: "tool",
    tool,
    ...(input ? { toolInput: input } : {}),
    ...(response ? { toolResponse: response } : {}),
    ...(timestamp ? { timestamp } : {}),
    ...(meta.model ? { model: meta.model } : {}),
    ...(meta.reasoningEffort ? { reasoningEffort: meta.reasoningEffort } : {}),
    ...(meta.source ? { source: meta.source } : {}),
    ...(meta.cwd ? { cwd: meta.cwd } : {}),
    ...(meta.turnId ? { turnId: meta.turnId } : {}),
    ...(meta.agentId ? { agentId: meta.agentId } : {}),
    ...(meta.toolState ? { toolState: meta.toolState } : {}),
    ...(meta.approval ? { approval: meta.approval } : {}),
    pending: meta.pending ?? false,
    ...(meta.toolCallId ? { toolCallId: meta.toolCallId } : {}),
    ...(meta.approvalId ? { approvalId: meta.approvalId } : {}),
    ...(meta.sessionId ? { sessionId: meta.sessionId } : {}),
    ...(meta.raw !== undefined ? { raw: meta.raw } : {}),
  };
}

function blockEvent(
  block: SessionContent,
  role: string,
  id: string,
  timestamp: string | undefined,
  cwd: string | undefined,
): SessionEvent | null {
  if (block.type === "tool_use" || (block.name && block.input)) {
    if (!block.name) return null;
    return toolEvent(id, block.name, block.input, undefined, timestamp, {
      ...(cwd ? { cwd } : {}),
      ...(block.id ? { toolCallId: block.id } : {}),
    });
  }
  if (block.type === "thinking" || block.thinking) {
    const text = block.thinking ?? block.text;
    return text ? { id, kind: "thinking", text, ...(timestamp ? { timestamp } : {}) } : null;
  }
  if (block.text) {
    return {
      id,
      kind: role === "system" ? "system" : role === "user" ? "user" : "assistant",
      text: block.text,
      ...(timestamp ? { timestamp } : {}),
    };
  }
  return null;
}

/** Flatten a captain session (unified messages, entries, or raw log text) into
 *  ordered events. Unified `SessionUIMessage[]` is detected by its `parts`. */
export function normalizeSession(input: SessionInput): SessionEvent[] {
  if (looksLikeUnifiedSession(input)) {
    return normalizeMessages(input.messages ?? []);
  }
  if (Array.isArray(input) && looksLikeUnifiedMessages(input)) {
    return normalizeMessages(input);
  }
  const entries = parseEntries(input as string | SessionEntry[]);
  const events: SessionEvent[] = [];
  entries.forEach((entry, seq) => {
    const baseId = entry.uuid ?? `e${seq}`;

    if (entry.isApiErrorMessage) {
      events.push({
        id: `${baseId}-err`,
        kind: "error",
        text: errorMessage(entry),
        ...(entry.error ? { errorType: entry.error } : {}),
        ...(entry.apiErrorStatus ? { errorStatus: entry.apiErrorStatus } : {}),
        ...(entry.timestamp ? { timestamp: entry.timestamp } : {}),
        raw: entry,
      });
      return;
    }

    const tu = entry.tool_use;
    if (tu?.tool) {
      const cwd = tu.cwd ?? entry.cwd;
      events.push(
        toolEvent(`${baseId}-tool`, tu.tool, tu.input, tu.response, tu.timestamp ?? entry.timestamp, {
          ...(tu.model ? { model: tu.model } : {}),
          ...(tu.reasoning_effort ? { reasoningEffort: tu.reasoning_effort } : {}),
          ...(tu.source ? { source: tu.source } : {}),
          ...(cwd ? { cwd } : {}),
          ...(tu.tool_use_id ? { toolCallId: tu.tool_use_id } : {}),
          ...(tu.session_id ? { sessionId: tu.session_id } : {}),
          raw: entry,
        }),
      );
      return;
    }

    const role = roleFromType(entry.message?.role ?? entry.type);
    for (const [i, block] of (entry.message?.content ?? []).entries()) {
      const ev = blockEvent(block, role, `${baseId}-${i}`, entry.timestamp, entry.cwd);
      if (ev) events.push(ev);
    }
  });
  return events;
}

export function getSessionMetadata(input: SessionInput): SessionMetadataSummary | undefined {
  if (!looksLikeUnifiedSession(input)) return undefined;
  const metadata: SessionMetadataSummary = {
    ...(input.turns ? { turns: input.turns } : {}),
    ...(input.capabilities ? { capabilities: input.capabilities } : {}),
    ...(input.budget ? { budget: input.budget } : {}),
    ...(input.context ? { context: input.context } : {}),
    ...(input.events ? { events: input.events } : {}),
    ...(input.model ? { model: input.model } : {}),
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.usage ? { usage: input.usage } : {}),
    ...(input.cost ? { cost: input.cost } : {}),
  };
  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function errorMessage(entry: SessionEntry): string {
  const status = entry.apiErrorStatus ? ` (HTTP ${entry.apiErrorStatus})` : "";
  return `${entry.error ?? "API error"}${status}`;
}

// ── Unified message normalization ───────────────────────────────────────────
// Projects the canonical SessionUIMessage[] (captain pkg/session) into the same
// SessionEvent rows, so the viewer renders the unified model and the legacy
// SessionEntry log identically.

/** A unified message array is told apart from a SessionEntry log by its
 *  per-message `parts` array (a SessionEntry carries `message`/`tool_use`). */
function looksLikeUnifiedMessages(arr: SessionEntry[] | SessionUIMessage[]): arr is SessionUIMessage[] {
  const first: unknown = arr[0];
  return typeof first === "object" && first !== null && Array.isArray((first as SessionUIMessage).parts);
}

function looksLikeUnifiedSession(input: SessionInput): input is UnifiedSessionInput {
  return (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    ("messages" in input ||
      "turns" in input ||
      "capabilities" in input ||
      "budget" in input ||
      "context" in input)
  );
}

function isUnifiedToolPart(part: SessionUIPart): boolean {
  return Boolean(part.toolName) && (part.type === "dynamic-tool" || part.type.startsWith("tool-"));
}

/** Render a tool part's already-parsed JSON output as text. */
function outputToText(output: unknown): string | undefined {
  if (output == null) return undefined;
  return typeof output === "string" ? output : JSON.stringify(output);
}

function asRecord(input: unknown): Record<string, unknown> | undefined {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : undefined;
}

function partEvent(
  part: SessionUIPart,
  role: "system" | "user" | "assistant",
  id: string,
  meta: {
    timestamp?: string;
    cwd?: string;
    model?: string;
    reasoningEffort?: string;
    source?: string;
    turnId?: string;
    agentId?: string;
    sessionId?: string;
    raw?: unknown;
  },
): SessionEvent | null {
  if (isUnifiedToolPart(part)) {
    const pending = pendingFromPart(part);
    return toolEvent(id, part.toolName as string, asRecord(part.input), outputToText(part.output), meta.timestamp, {
      ...(meta.model ? { model: meta.model } : {}),
      ...(meta.reasoningEffort ? { reasoningEffort: meta.reasoningEffort } : {}),
      ...(meta.source ? { source: meta.source } : {}),
      ...(meta.cwd ? { cwd: meta.cwd } : {}),
      ...(meta.turnId ? { turnId: meta.turnId } : {}),
      ...(meta.agentId ? { agentId: meta.agentId } : {}),
      ...(meta.sessionId ? { sessionId: meta.sessionId } : {}),
      ...(part.state ? { toolState: part.state } : {}),
      ...(part.approval ? { approval: part.approval } : {}),
      pending,
      ...(part.toolCallId ? { toolCallId: part.toolCallId } : {}),
      ...(part.approval?.id ? { approvalId: part.approval.id } : {}),
      ...(meta.raw !== undefined ? { raw: meta.raw } : {}),
    });
  }
  if (part.type === "reasoning") {
    return part.text
      ? {
          id,
          kind: "thinking",
          text: part.text,
          ...(meta.timestamp ? { timestamp: meta.timestamp } : {}),
          ...(meta.turnId ? { turnId: meta.turnId } : {}),
          ...(meta.agentId ? { agentId: meta.agentId } : {}),
          ...(meta.raw !== undefined ? { raw: meta.raw } : {}),
        }
      : null;
  }
  if (part.type === "text") {
    return part.text
      ? {
          id,
          kind: role,
          text: part.text,
          ...(meta.timestamp ? { timestamp: meta.timestamp } : {}),
          ...(meta.turnId ? { turnId: meta.turnId } : {}),
          ...(meta.agentId ? { agentId: meta.agentId } : {}),
          ...(meta.raw !== undefined ? { raw: meta.raw } : {}),
        }
      : null;
  }
  return null; // file / unknown parts have no row representation
}

function pendingFromPart(part: SessionUIPart): boolean {
  if (part.approval?.approved !== undefined) return false;
  if (["approval-responded", "output-available", "output-denied"].includes(part.state ?? "")) return false;
  return part.pending === true || part.approval?.pending === true || part.state === "approval-requested";
}

/** Flatten unified session messages into ordered SessionEvent rows. */
export function normalizeMessages(messages: SessionUIMessage[]): SessionEvent[] {
  const events: SessionEvent[] = [];
  messages.forEach((msg, seq) => {
    const prov = msg.provenance;
    const baseId = msg.id ?? prov?.uuid ?? `m${seq}`;
    if (prov?.apiErrorStatus) {
      events.push({
        id: `${baseId}-err`,
        kind: "error",
        text: `API error (HTTP ${prov.apiErrorStatus})`,
        errorStatus: prov.apiErrorStatus,
        ...(prov.timestamp ? { timestamp: prov.timestamp } : {}),
        ...(msg.turnId ? { turnId: msg.turnId } : {}),
        ...(prov.agentId ? { agentId: prov.agentId } : {}),
        ...(msg.raw !== undefined ? { raw: msg.raw } : {}),
      });
      return;
    }
    const role: "system" | "user" | "assistant" =
      msg.role === "system" ? "system" : msg.role === "user" ? "user" : "assistant";
    const meta = {
      ...(prov?.timestamp ? { timestamp: prov.timestamp } : {}),
      ...(prov?.cwd ? { cwd: prov.cwd } : {}),
      ...(prov?.model ? { model: prov.model } : {}),
      ...(prov?.reasoningEffort ? { reasoningEffort: prov.reasoningEffort } : {}),
      ...(prov?.source ? { source: prov.source } : {}),
      ...(msg.turnId ? { turnId: msg.turnId } : {}),
      ...(prov?.agentId ? { agentId: prov.agentId } : {}),
      ...(prov?.sessionId ? { sessionId: prov.sessionId } : {}),
      ...(msg.raw !== undefined ? { raw: msg.raw } : {}),
    };
    msg.parts.forEach((part, i) => {
      const ev = partEvent(part, role, `${baseId}-${i}`, meta);
      if (ev) events.push(ev);
    });
  });
  return events;
}

// ── Action icon registry ────────────────────────────────────────────────────
// Implements the Flanksource "Coding agent action icons" design: every agent
// tool maps to a Phosphor-derived generated icon (Ui*) and a semantic tone so a
// scan of the log reads at a glance. Tones group by surface — file reads (sky),
// writes (amber), edits (violet), execution (emerald), agents (indigo),
// destructive (rose), assets (pink/fuchsia).

export type SessionTone =
  | "sky"
  | "amber"
  | "violet"
  | "emerald"
  | "teal"
  | "orange"
  | "rose"
  | "indigo"
  | "fuchsia"
  | "pink"
  | "slate";

export interface SessionActionMeta {
  icon: StaticIconComponent;
  tone: SessionTone;
  /** Human-readable verb shown as the row heading (and in the filter menu). */
  label: string;
  /** The row heading is the input summary alone (file path, command) — the
   *  icon and tone carry the verb, so the label only appears in the menu. */
  summaryOnly?: boolean;
}

const ACTIONS: Record<string, SessionActionMeta> = {
  // File operations. Read (eye) and Write (diff) are deliberately kept off the
  // design's file-text / file-plus glyphs — they read better in a scrolling log
  // and write-type rows also carry a +/- diff stat.
  Read: { icon: UiEye, tone: "sky", label: "Read file", summaryOnly: true },
  Write: { icon: UiDiff, tone: "amber", label: "Write file", summaryOnly: true },
  Edit: { icon: UiPencilSimpleLine, tone: "violet", label: "Edit file", summaryOnly: true },
  MultiEdit: { icon: UiStack, tone: "violet", label: "Multi-edit", summaryOnly: true },
  NotebookEdit: { icon: UiPencilSimpleLine, tone: "violet", label: "Edit notebook", summaryOnly: true },
  // Search & navigation
  Grep: { icon: UiSearch, tone: "amber", label: "Grep" },
  Glob: { icon: UiAsterisk, tone: "sky", label: "Glob" },
  // Execution & shell
  Bash: { icon: UiTerminal, tone: "emerald", label: "Run command" },
  BashOutput: { icon: UiCode2, tone: "emerald", label: "Shell output" },
  KillShell: { icon: UiProhibit, tone: "rose", label: "Kill shell" },
  KillBash: { icon: UiProhibit, tone: "rose", label: "Kill shell" },
  // Agents & planning
  Task: { icon: UiRobotAi, tone: "indigo", label: "Sub-agent task" },
  Agent: { icon: UiRobotAi, tone: "indigo", label: "Sub-agent task" },
  Skill: { icon: UiMagicWand, tone: "fuchsia", label: "Invoke skill" },
  TodoWrite: { icon: UiListChecks, tone: "sky", label: "Update todos" },
  Plan: { icon: UiStrategy, tone: "sky", label: "Plan" },
  TaskCreate: { icon: UiKanban, tone: "sky", label: "Create task" },
  TaskUpdate: { icon: UiKanban, tone: "sky", label: "Update task" },
  TaskList: { icon: UiKanban, tone: "sky", label: "List tasks" },
  TaskGet: { icon: UiKanban, tone: "sky", label: "Get task" },
  TaskOutput: { icon: UiKanban, tone: "sky", label: "Task output" },
  TaskStop: { icon: UiProhibit, tone: "rose", label: "Stop task" },
  ToolSearch: { icon: UiSearch, tone: "amber", label: "Search tools" },
  AskUserQuestion: { icon: UiQuestion, tone: "sky", label: "Ask user" },
  EnterPlanMode: { icon: UiStrategy, tone: "sky", label: "Enter plan mode" },
  ExitPlanMode: { icon: UiStrategy, tone: "sky", label: "Exit plan mode" },
  // Web & browser automation
  WebFetch: { icon: UiCloudDownload, tone: "sky", label: "Fetch URL" },
  WebSearch: { icon: UiGlobe, tone: "sky", label: "Web search" },
  browser_navigate: { icon: UiCompass, tone: "sky", label: "Navigate" },
  browser_navigate_back: { icon: UiCompass, tone: "sky", label: "Navigate back" },
  browser_click: { icon: UiCursorClick, tone: "sky", label: "Click" },
  browser_triple_click: { icon: UiCursorText, tone: "sky", label: "Triple click" },
  browser_type: { icon: UiKeyboard, tone: "emerald", label: "Type text" },
  browser_press_key: { icon: UiCommand, tone: "amber", label: "Press key" },
  browser_snapshot: { icon: UiScan, tone: "violet", label: "Snapshot" },
  browser_take_screenshot: { icon: UiCamera, tone: "indigo", label: "Screenshot" },
  browser_evaluate: { icon: UiCode2, tone: "violet", label: "Evaluate JS" },
  browser_console_messages: { icon: UiScroll, tone: "slate", label: "Console" },
  browser_network_requests: { icon: UiShare, tone: "emerald", label: "Network" },
  browser_wait_for: { icon: UiHourglass, tone: "amber", label: "Wait" },
  Wait: { icon: UiHourglass, tone: "amber", label: "Wait" },
  browser_close: { icon: UiClose, tone: "rose", label: "Close browser" },
};

// MCP tools surface as `mcp__<server>__<name>` or `<server>__<name>`. Icon
// servers get a distinct accent (palette); generative servers reuse the sparkle;
// the rest fall back to the puzzle piece.
const MCP_ICON_SERVERS = new Set(["iconify", "icons8", "lucide", "react-icons"]);
const MCP_GEN_SERVERS = new Set(["gemini", "openai", "anthropic"]);

interface McpTool {
  server: string;
  name: string;
}

export function splitMcpTool(tool: string): McpTool | null {
  const rest = tool.startsWith("mcp__") ? tool.slice("mcp__".length) : tool;
  const idx = rest.indexOf("__");
  if (idx < 0) return null;
  return { server: rest.slice(0, idx), name: rest.slice(idx + 2) };
}

/** Resolve the icon, tone, and label for a tool name. */
export function getSessionAction(tool: string): SessionActionMeta {
  const exact = ACTIONS[tool];
  if (exact) return exact;

  const mcp = splitMcpTool(tool);
  if (mcp) {
    const label = `${mcp.server}: ${mcp.name.replace(/_/g, " ")}`;
    if (MCP_ICON_SERVERS.has(mcp.server)) return { icon: UiPalette, tone: "pink", label };
    if (MCP_GEN_SERVERS.has(mcp.server)) return { icon: UiSparkles, tone: "violet", label };
    return { icon: UiPuzzle, tone: "violet", label };
  }

  return { icon: UiWrench, tone: "slate", label: tool };
}

/** Count tool-call events, the dominant model, and totals for the header. */
export function summarizeSession(events: SessionEvent[]): {
  toolCount: number;
  messageCount: number;
  model?: string;
} {
  let toolCount = 0;
  let messageCount = 0;
  const modelCounts = new Map<string, number>();
  for (const event of events) {
    if (event.kind === "tool") toolCount += 1;
    if (event.kind === "system" || event.kind === "user" || event.kind === "assistant") {
      messageCount += 1;
    }
    if (event.model) modelCounts.set(event.model, (modelCounts.get(event.model) ?? 0) + 1);
  }
  let model: string | undefined;
  let best = 0;
  for (const [name, count] of modelCounts) {
    if (count > best) {
      best = count;
      model = name;
    }
  }
  return { toolCount, messageCount, ...(model ? { model } : {}) };
}
