// Presentation helpers for a tool call's input: the one-line summary, the
// JetBrains-style inline params, the inline shell command, and the line diff
// for file-writing tools. Pure functions — the viewer renders their output.

import { computeLineDiff } from "../code-diff";
import { languageFromPath } from "../code-highlight";
import { splitMcpTool, truncate } from "./SessionViewer.model";

/** Strip the event's working directory from an absolute file path. */
export function relativizePath(path: string, cwd?: string): string {
  if (!cwd) return path;
  const base = cwd.replace(/\/+$/, "");
  return path.startsWith(`${base}/`) ? path.slice(base.length + 1) : path;
}

/** The raw shell command of a shell-execution tool call, if present. Shell rows
 *  render this inline as a bash code block instead of the generic label +
 *  tool-input JSON. */
export function shellCommand(
  tool: string,
  input?: Record<string, unknown>,
): string | undefined {
  if (tool !== "Bash") return undefined;
  const command = input?.["command"];
  return typeof command === "string" && command ? command : undefined;
}

export interface ToolParam {
  name: string;
  value: string;
}

export interface SessionQuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface SessionQuestion {
  id: string;
  text: string;
  context?: string;
  multiSelect?: boolean;
  options: SessionQuestionOption[];
}

// Keys already rendered elsewhere in the row — the file-path heading, the
// inline shell command, or the diff — so they don't repeat as inline params.
const CONSUMED_INPUT_KEYS: Record<string, readonly string[]> = {
  Bash: ["command"],
  Read: ["file_path", "notebook_path", "path"],
  Write: ["file_path", "notebook_path", "path", "content"],
  Edit: ["file_path", "notebook_path", "path", "old_string", "new_string"],
  MultiEdit: ["file_path", "notebook_path", "path", "edits"],
  NotebookEdit: ["file_path", "notebook_path", "path"],
  AskUserQuestion: ["questions", "question", "prompt", "text", "header", "context", "description", "options"],
};

/** Flatten a tool's input into JetBrains-style `name: value` inline params:
 *  single-line values, cwd-relativized and truncated so the row never wraps. */
export function toolInputParams(
  tool: string,
  input?: Record<string, unknown>,
  cwd?: string,
): ToolParam[] {
  const consumed = CONSUMED_INPUT_KEYS[tool] ?? [];
  return Object.entries(input ?? {})
    .filter(
      ([name, value]) =>
        !consumed.includes(name) &&
        value !== undefined &&
        value !== null &&
        value !== "",
    )
    .map(([name, value]) => ({ name, value: paramValue(value, cwd) }));
}

function paramValue(value: unknown, cwd?: string): string {
  const text =
    typeof value === "string"
      ? relativizePath(value, cwd)
      : JSON.stringify(value);
  return truncate(text.replace(/\s+/g, " ").trim(), 60);
}

/** One before/after edit, rendered as a language-aware diff. */
export interface DiffSegment {
  original: string;
  modified: string;
}

export interface ToolDiff {
  added: number;
  removed: number;
  /** Edits as original→modified pairs (Write has one; MultiEdit has several). */
  segments: DiffSegment[];
  /** Highlighter hint from the file extension, when known. */
  language?: string;
}

// Added/removed line counts from a real LCS diff — context lines don't count,
// so a no-op edit reports 0/0 (and yields no diff).
function diffCounts(segments: DiffSegment[]): {
  added: number;
  removed: number;
} {
  let added = 0;
  let removed = 0;
  for (const { original, modified } of segments) {
    for (const hunk of computeLineDiff(original, modified)) {
      for (const line of hunk.lines) {
        if (line.type === "add") added += 1;
        else if (line.type === "remove") removed += 1;
      }
    }
  }
  return { added, removed };
}

/** The content change of a file-writing tool call as before/after segments —
 *  Write is one all-additions segment; Edit/MultiEdit pair old and new text. */
export function toolDiff(
  tool: string,
  input?: Record<string, unknown>,
): ToolDiff | undefined {
  if (!input) return undefined;
  const str = (key: string): string =>
    typeof input[key] === "string" ? (input[key] as string) : "";

  const segments = toolDiffSegments(tool, input, str);
  if (!segments || segments.length === 0) return undefined;
  const counts = diffCounts(segments);
  if (counts.added === 0 && counts.removed === 0) return undefined;

  const language = languageFromPath(
    str("file_path") || str("notebook_path") || str("path"),
  );
  return { ...counts, segments, ...(language ? { language } : {}) };
}

function toolDiffSegments(
  tool: string,
  input: Record<string, unknown>,
  str: (key: string) => string,
): DiffSegment[] | undefined {
  if (tool === "Write") {
    const content = str("content");
    return content ? [{ original: "", modified: content }] : undefined;
  }
  if (tool === "Edit" || tool === "NotebookEdit") {
    const original = str("old_string");
    const modified = str("new_string") || str("new_source");
    return original || modified ? [{ original, modified }] : undefined;
  }
  if (tool === "MultiEdit") {
    const edits = input["edits"];
    if (!Array.isArray(edits)) return undefined;
    return edits
      .filter(
        (edit): edit is Record<string, unknown> =>
          typeof edit === "object" && edit !== null,
      )
      .map((edit) => ({
        original:
          typeof edit["old_string"] === "string"
            ? (edit["old_string"] as string)
            : "",
        modified:
          typeof edit["new_string"] === "string"
            ? (edit["new_string"] as string)
            : "",
      }))
      .filter((segment) => segment.original !== "" || segment.modified !== "");
  }
  return undefined;
}

// summarizeToolInput condenses a tool's input into a one-line preview, ported
// from captain's history.FormatToolUseSummary so the viewer reads like the CLI.
export function summarizeToolInput(
  tool: string,
  input?: Record<string, unknown>,
  cwd?: string,
): string {
  if (!input) return "";
  const str = (key: string): string =>
    typeof input[key] === "string" ? (input[key] as string) : "";
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
      return str("command") || str("text");
    case "Read":
    case "Write":
    case "Edit":
    case "MultiEdit":
    case "NotebookEdit":
      return relativizePath(first("file_path", "notebook_path", "path"), cwd);
    case "Grep":
      return [str("pattern"), str("path")].filter(Boolean).join(" ");
    case "Glob":
      return str("pattern");
    case "Task":
    case "Agent":
      return first("description", "prompt");
    case "Skill":
      return first("skill", "command", "name");
    case "TaskCreate":
      return first("subject", "description");
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
      return str("query");
    case "WebFetch":
    case "browser_navigate":
      return str("url");
    case "AskUserQuestion": {
      const questions = questionsFromToolInput(input);
      const rawQuestions = input["questions"];
      if (questions.length > 1) return `${questions.length} questions`;
      if (questions[0]?.text) return truncate(questions[0].text, 80);
      if (Array.isArray(rawQuestions) && rawQuestions.length > 0) return `${rawQuestions.length} questions`;
      return "";
    }
    case "ExitPlanMode":
      return str("planFilePath");
    default:
      return "";
  }
}

export function questionsFromToolInput(input?: Record<string, unknown>): SessionQuestion[] {
  if (!input) return [];
  const rawQuestions = input.questions;
  if (Array.isArray(rawQuestions)) {
    return rawQuestions
      .map((question, index) => questionFromValue(question, index))
      .filter((question): question is SessionQuestion => question !== null);
  }

  const text = stringField(input, "question") || stringField(input, "prompt") || stringField(input, "text");
  if (!text) return [];
  return [{
    id: stringField(input, "id") || "1",
    text,
    ...optionalContext(input),
    multiSelect: booleanField(input, "multiSelect") || booleanField(input, "multi_select"),
    options: optionList(input.options),
  }];
}

function questionFromValue(value: unknown, index: number): SessionQuestion | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? { id: String(index + 1), text, options: [] } : null;
  }
  if (!isRecord(value)) return null;
  const text =
    stringField(value, "question") ||
    stringField(value, "text") ||
    stringField(value, "prompt") ||
    stringField(value, "label");
  if (!text) return null;
  return {
    id: stringField(value, "id") || String(index + 1),
    text,
    ...optionalContext(value),
    multiSelect: booleanField(value, "multiSelect") || booleanField(value, "multi_select"),
    options: optionList(value.options),
  };
}

function optionList(value: unknown): SessionQuestionOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option, index) => {
    if (typeof option === "string") {
      const label = option.trim();
      return label ? [{ value: label, label }] : [];
    }
    if (!isRecord(option)) return [];
    const label =
      stringField(option, "label") ||
      stringField(option, "value") ||
      stringField(option, "id") ||
      stringField(option, "description");
    if (!label) return [];
    const value = stringField(option, "value") || stringField(option, "id") || label;
    const description = stringField(option, "description");
    return [{
      value: value || String(index + 1),
      label,
      ...(description && description !== label ? { description } : {}),
    }];
  });
}

function optionalContext(input: Record<string, unknown>): Pick<SessionQuestion, "context"> {
  const context = stringField(input, "header") || stringField(input, "context") || stringField(input, "description");
  return context ? { context } : {};
}

function stringField(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

function booleanField(input: Record<string, unknown>, key: string): boolean {
  return input[key] === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
