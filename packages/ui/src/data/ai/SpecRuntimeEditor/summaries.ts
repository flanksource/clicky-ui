import type { ChatModel } from "../../chat/types";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { checkoutMode, worktreeMode } from "./update";
import { isDenyMode, type PermissionListEntry } from "./permissions-model";

export function summarizeModel(
  value: AISpecRuntimeValue,
  models: ChatModel[] = [],
): string {
  const parts: string[] = [];
  const model = value.model?.trim();
  if (model) {
    parts.push(models.find((m) => m.id === model)?.label ?? model);
  }
  if (value.effort) parts.push(value.effort);
  if (value.temperature != null && Number.isFinite(value.temperature)) {
    parts.push(`temp ${value.temperature}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Default model";
}

export function summarizePrompt(value: AISpecRuntimeValue): string {
  const overrides = [
    value.prompt?.user,
    value.prompt?.system,
    value.prompt?.appendSystem,
  ].filter((text) => Boolean(text?.trim())).length;
  if (overrides === 0) return "Base prompt only";
  return `${overrides} override${overrides > 1 ? "s" : ""} set`;
}

export function summarizeWorkspace(value: AISpecRuntimeValue): string {
  const mode = checkoutMode(value);
  if (mode === "none") return "No checkout";
  const parts: string[] = [mode];
  const ref = value.setup?.checkout?.ref?.trim();
  if (ref) parts.push(ref);
  const worktree = worktreeMode(value);
  parts.push(worktree === "none" ? "in-place" : `${worktree} worktree`);
  return parts.join(" · ");
}

export function summarizePermissions(
  value: AISpecRuntimeValue,
  entries: PermissionListEntry[],
): string {
  const parts: string[] = [value.permissions?.mode || "default"];
  const denied = entries.filter(
    (entry) => entry.domain === "tools" && entry.mode === "deny",
  ).length;
  const off = entries.filter(
    (entry) => entry.domain !== "tools" && isDenyMode(entry.mode),
  ).length;
  if (denied > 0) parts.push(`${denied} denied`);
  if (off > 0) parts.push(`${off} off`);
  return parts.join(" · ");
}

export function summarizeEnvironment(value: AISpecRuntimeValue): string {
  const vars = (value.setup?.envVars ?? []).filter((item) =>
    Boolean(item.name?.trim()),
  );
  if (vars.length === 0) return "No variables";
  const secrets = vars.filter((item) => {
    if (typeof item.valueFrom === "string") {
      return item.valueFrom.trim().startsWith("secret://");
    }
    return Boolean(item.valueFrom?.secretKeyRef);
  }).length;
  const parts = [`${vars.length} var${vars.length !== 1 ? "s" : ""}`];
  if (secrets > 0) parts.push(`${secrets} secret`);
  return parts.join(" · ");
}

export function summarizeVerify(value: AISpecRuntimeValue): string {
  const verify = value.workflow?.verify;
  if (!verify) return "No fixture";
  const parts: string[] = [];
  if (verify.fixture?.trim()) parts.push("Fixture");
  if (verify.scope === "changed") parts.push("changed files");
  if (verify.maxIterations != null && verify.maxIterations > 0) {
    parts.push(
      `${verify.maxIterations} iteration${verify.maxIterations !== 1 ? "s" : ""}`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "No fixture";
}

export function summarizeCommit(value: AISpecRuntimeValue): string {
  const postRun = value.workflow?.postRun;
  if (postRun?.dryRun) return "Dry run";
  return postRun?.commit ? "Commit changes" : "Leave uncommitted";
}

export function summarizeCLIArgs(value: AISpecRuntimeValue): string {
  const flags = Object.entries(value.cliArgs ?? {}).filter(
    ([, item]) =>
      item !== undefined &&
      item !== "" &&
      item !== false &&
      (!Array.isArray(item) || item.length > 0),
  ).length;
  if (flags === 0) return "Defaults";
  return `${flags} flag${flags !== 1 ? "s" : ""} set`;
}

// The rail target chip: repo (from checkout URL or local path) plus ref.
export function summarizeTarget(value: AISpecRuntimeValue): string | undefined {
  const checkout = value.setup?.checkout;
  const source = checkout?.url?.trim() || checkout?.path?.trim();
  if (!source) return undefined;
  const repo = source
    .replace(/\/+$/, "")
    .split("/")
    .pop()
    ?.replace(/\.git$/, "");
  if (!repo) return undefined;
  const ref = checkout?.ref?.trim();
  return ref ? `${repo} · ${ref}` : repo;
}
