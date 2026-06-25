import type { StaticIconComponent } from "../Icon";
import {
  UiCamera,
  UiClose,
  UiCloudDownload,
  UiCode2,
  UiCommand,
  UiEdit,
  UiEye,
  UiFileSearch,
  UiFileText,
  UiGlobe,
  UiHourglass,
  UiImage,
  UiKanban,
  UiLayers,
  UiMagicWand,
  UiNetwork,
  UiPuzzle,
  UiQuestion,
  UiRobotAi,
  UiSave,
  UiSearch,
  UiSelect,
  UiSparkles,
  UiStop,
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

/** Either a parsed list of entries or the raw log text (JSON array or JSONL). */
export type SessionInput = string | SessionEntry[];

// ── Normalized events ───────────────────────────────────────────────────────
// The raw schema interleaves consolidated `tool_use` rows with `message`
// content blocks. normalizeSession flattens both shapes into a single ordered
// list the viewer can render row-by-row.

export type SessionEventKind = "user" | "assistant" | "thinking" | "tool" | "error";

export interface SessionEvent {
  id: string;
  kind: SessionEventKind;
  /** Tool name (kind === "tool"). */
  tool?: string;
  toolInput?: Record<string, unknown>;
  toolResponse?: string;
  /** Prose for user/assistant/thinking, or the error message for errors. */
  text?: string;
  timestamp?: string;
  model?: string;
  reasoningEffort?: string;
  source?: string;
  errorType?: string;
  errorStatus?: number;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

// parseEntries accepts a parsed array as-is, or parses a string as a whole-
// document JSON (array or single object, possibly pretty-printed) first, then
// falls back to JSONL (one object per line). The whole-document parse error is
// caught only to attempt the JSONL fallback — a genuinely malformed JSONL line
// throws loudly rather than being silently dropped.
function parseEntries(input: SessionInput): SessionEntry[] {
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
  return type === "user" || type === "assistant" ? type : "assistant";
}

function toolEvent(
  id: string,
  tool: string,
  input: Record<string, unknown> | undefined,
  response: string | undefined,
  timestamp: string | undefined,
  meta: { model?: string; reasoningEffort?: string; source?: string } = {},
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
  };
}

function blockEvent(
  block: SessionContent,
  role: string,
  id: string,
  timestamp: string | undefined,
): SessionEvent | null {
  if (block.type === "tool_use" || (block.name && block.input)) {
    if (!block.name) return null;
    return toolEvent(id, block.name, block.input, undefined, timestamp);
  }
  if (block.type === "thinking" || block.thinking) {
    const text = block.thinking ?? block.text;
    return text ? { id, kind: "thinking", text, ...(timestamp ? { timestamp } : {}) } : null;
  }
  if (block.text) {
    return {
      id,
      kind: role === "user" ? "user" : "assistant",
      text: block.text,
      ...(timestamp ? { timestamp } : {}),
    };
  }
  return null;
}

/** Flatten a captain session (entries or raw log text) into ordered events. */
export function normalizeSession(input: SessionInput): SessionEvent[] {
  const entries = parseEntries(input);
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
      });
      return;
    }

    const tu = entry.tool_use;
    if (tu?.tool) {
      events.push(
        toolEvent(`${baseId}-tool`, tu.tool, tu.input, tu.response, tu.timestamp ?? entry.timestamp, {
          ...(tu.model ? { model: tu.model } : {}),
          ...(tu.reasoning_effort ? { reasoningEffort: tu.reasoning_effort } : {}),
          ...(tu.source ? { source: tu.source } : {}),
        }),
      );
      return;
    }

    const role = roleFromType(entry.message?.role ?? entry.type);
    for (const [i, block] of (entry.message?.content ?? []).entries()) {
      const ev = blockEvent(block, role, `${baseId}-${i}`, entry.timestamp);
      if (ev) events.push(ev);
    }
  });
  return events;
}

function errorMessage(entry: SessionEntry): string {
  const status = entry.apiErrorStatus ? ` (HTTP ${entry.apiErrorStatus})` : "";
  return `${entry.error ?? "API error"}${status}`;
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
  | "rose"
  | "indigo"
  | "fuchsia"
  | "pink"
  | "slate";

export interface SessionActionMeta {
  icon: StaticIconComponent;
  tone: SessionTone;
  /** Human-readable verb shown as the row heading. */
  label: string;
}

const ACTIONS: Record<string, SessionActionMeta> = {
  // File operations
  Read: { icon: UiFileText, tone: "sky", label: "Read file" },
  Write: { icon: UiSave, tone: "amber", label: "Write file" },
  Edit: { icon: UiEdit, tone: "violet", label: "Edit file" },
  MultiEdit: { icon: UiLayers, tone: "violet", label: "Multi-edit" },
  NotebookEdit: { icon: UiEdit, tone: "violet", label: "Edit notebook" },
  // Search & navigation
  Grep: { icon: UiSearch, tone: "amber", label: "Grep" },
  Glob: { icon: UiFileSearch, tone: "sky", label: "Glob" },
  // Execution & shell
  Bash: { icon: UiTerminal, tone: "emerald", label: "Run command" },
  BashOutput: { icon: UiCode2, tone: "emerald", label: "Shell output" },
  KillShell: { icon: UiStop, tone: "rose", label: "Kill shell" },
  KillBash: { icon: UiStop, tone: "rose", label: "Kill shell" },
  // Agents & planning
  Task: { icon: UiRobotAi, tone: "indigo", label: "Sub-agent task" },
  Agent: { icon: UiRobotAi, tone: "indigo", label: "Sub-agent task" },
  Skill: { icon: UiMagicWand, tone: "fuchsia", label: "Invoke skill" },
  TodoWrite: { icon: UiKanban, tone: "sky", label: "Update todos" },
  TaskCreate: { icon: UiKanban, tone: "sky", label: "Create task" },
  TaskUpdate: { icon: UiKanban, tone: "sky", label: "Update task" },
  TaskList: { icon: UiKanban, tone: "sky", label: "List tasks" },
  TaskGet: { icon: UiKanban, tone: "sky", label: "Get task" },
  TaskOutput: { icon: UiKanban, tone: "sky", label: "Task output" },
  TaskStop: { icon: UiStop, tone: "rose", label: "Stop task" },
  ToolSearch: { icon: UiSearch, tone: "amber", label: "Search tools" },
  AskUserQuestion: { icon: UiQuestion, tone: "sky", label: "Ask user" },
  EnterPlanMode: { icon: UiKanban, tone: "sky", label: "Enter plan mode" },
  ExitPlanMode: { icon: UiKanban, tone: "sky", label: "Exit plan mode" },
  // Web & browser automation
  WebFetch: { icon: UiCloudDownload, tone: "sky", label: "Fetch URL" },
  WebSearch: { icon: UiGlobe, tone: "sky", label: "Web search" },
  browser_navigate: { icon: UiGlobe, tone: "sky", label: "Navigate" },
  browser_navigate_back: { icon: UiGlobe, tone: "sky", label: "Navigate back" },
  browser_click: { icon: UiSelect, tone: "sky", label: "Click" },
  browser_triple_click: { icon: UiSelect, tone: "sky", label: "Triple click" },
  browser_type: { icon: UiTerminal, tone: "emerald", label: "Type text" },
  browser_press_key: { icon: UiCommand, tone: "amber", label: "Press key" },
  browser_snapshot: { icon: UiEye, tone: "violet", label: "Snapshot" },
  browser_take_screenshot: { icon: UiCamera, tone: "violet", label: "Screenshot" },
  browser_evaluate: { icon: UiCode2, tone: "violet", label: "Evaluate JS" },
  browser_network_requests: { icon: UiNetwork, tone: "emerald", label: "Network" },
  browser_wait_for: { icon: UiHourglass, tone: "amber", label: "Wait" },
  browser_close: { icon: UiClose, tone: "rose", label: "Close browser" },
};

// MCP tools surface as `mcp__<server>__<name>` or `<server>__<name>`. Icon
// servers get a distinct accent; generative servers reuse the sparkle; the rest
// fall back to the puzzle piece.
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
    if (MCP_ICON_SERVERS.has(mcp.server)) return { icon: UiImage, tone: "pink", label };
    if (MCP_GEN_SERVERS.has(mcp.server)) return { icon: UiSparkles, tone: "violet", label };
    return { icon: UiPuzzle, tone: "violet", label };
  }

  return { icon: UiWrench, tone: "slate", label: tool };
}

// summarizeToolInput condenses a tool's input into a one-line preview, ported
// from captain's history.FormatToolUseSummary so the viewer reads like the CLI.
export function summarizeToolInput(tool: string, input?: Record<string, unknown>): string {
  if (!input) return "";
  const str = (key: string): string => (typeof input[key] === "string" ? (input[key] as string) : "");
  const first = (...keys: string[]): string => {
    for (const key of keys) {
      const value = str(key);
      if (value) return value;
    }
    return "";
  };

  const mcp = splitMcpTool(tool);
  if (mcp) {
    const arg = first("url", "sql", "query", "element", "method");
    return arg ? truncate(arg, 80) : "";
  }

  switch (tool) {
    case "Bash":
    case "browser_type":
      return truncate(str("command") || str("text"), 80);
    case "Read":
    case "Write":
    case "Edit":
    case "MultiEdit":
    case "NotebookEdit":
      return first("file_path", "notebook_path", "path");
    case "Grep":
      return [str("pattern"), str("path")].filter(Boolean).join(" ");
    case "Glob":
      return str("pattern");
    case "Task":
    case "Agent":
      return truncate(first("description", "prompt"), 80);
    case "Skill":
      return first("skill", "command", "name");
    case "TaskCreate":
      return truncate(first("subject", "description"), 80);
    case "TaskUpdate": {
      const id = first("taskId", "task_id", "id");
      const status = str("status");
      return status ? `${id} ${status}`.trim() : id;
    }
    case "TaskGet":
    case "TaskOutput":
    case "TaskStop":
      return first("task_id", "taskId", "id");
    case "ToolSearch":
    case "WebSearch":
      return truncate(str("query"), 80);
    case "WebFetch":
    case "browser_navigate":
      return str("url");
    case "AskUserQuestion": {
      const questions = input["questions"];
      return Array.isArray(questions) ? `${questions.length} questions` : "";
    }
    case "ExitPlanMode":
      return str("planFilePath");
    default:
      return "";
  }
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
    if (event.kind === "user" || event.kind === "assistant") messageCount += 1;
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
