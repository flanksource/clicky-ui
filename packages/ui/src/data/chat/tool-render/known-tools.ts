import type { ToolRenderAdapter } from "./adapter";
import {
  FileEditInput,
  FileReadOutput,
  PlanInput,
  QuestionInput,
  ShellInput,
  ShellOutput,
  TextToolOutput,
} from "./known-tool-views";

const SHELL_TOOLS = new Set(["Bash", "exec_command", "run_command", "shell"]);
const FILE_READ_TOOLS = new Set(["Read", "read_file"]);
const FILE_EDIT_TOOLS = new Set([
  "Write",
  "Edit",
  "MultiEdit",
  "NotebookEdit",
  "apply_patch",
]);
const PLAN_TOOLS = new Set(["TodoWrite", "Plan", "update_plan"]);
const QUESTION_TOOLS = new Set(["AskUserQuestion", "request_user_input"]);
const TEXT_OUTPUT_TOOLS = new Set([
  "Grep",
  "Glob",
  "ToolSearch",
  "WebFetch",
  "WebSearch",
  "list_dir",
  "web_search",
]);

/** Standard renderers for common Claude/Codex coding-agent tools. */
export const knownToolRenderAdapters: ToolRenderAdapter[] = [
  {
    id: "clicky:shell",
    match: (ctx) => SHELL_TOOLS.has(ctx.toolName),
    renderInput: ShellInput,
    renderOutput: ShellOutput,
  },
  {
    id: "clicky:file-read",
    match: (ctx) => FILE_READ_TOOLS.has(ctx.toolName),
    renderOutput: FileReadOutput,
  },
  {
    id: "clicky:file-edit",
    match: (ctx) => FILE_EDIT_TOOLS.has(ctx.toolName),
    renderInput: FileEditInput,
  },
  {
    id: "clicky:plan",
    match: (ctx) => PLAN_TOOLS.has(ctx.toolName),
    renderInput: PlanInput,
  },
  {
    id: "clicky:question",
    match: (ctx) => QUESTION_TOOLS.has(ctx.toolName),
    renderInput: QuestionInput,
  },
  {
    id: "clicky:text-output",
    match: (ctx) => TEXT_OUTPUT_TOOLS.has(ctx.toolName),
    renderOutput: TextToolOutput,
  },
];
