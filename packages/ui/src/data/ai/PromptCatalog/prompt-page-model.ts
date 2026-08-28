import { stringify } from "yaml";
import type { TabItem } from "../../../layout/Tabs";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  promptRuntimeValueToPayload,
  specToPromptRuntimeValue,
} from "../PromptPicker/prompt-runtime";
import {
  isValidPromptSpecDetail,
  type PromptSpecDetail,
  type PromptSpecSavePayload,
} from "../PromptPicker/types";
import type {
  PromptCatalogEntry,
  PromptCatalogLayer,
  PromptPageTab,
} from "./types";

export type PromptEditMode = "raw" | "structured";
export type PromptSaveSource = "inline" | "file";

// PromptDraft is the page's unsaved edit in exactly one representation: the
// whole .prompt text, or the parsed spec + body the structured editor binds.
// Switching representation while dirty would need a client-side parser, so
// the page only switches from a clean state.
export type PromptDraft = {
  mode: PromptEditMode;
  raw: string;
  value: AISpecRuntimeValue | undefined;
};

export const PROMPT_PAGE_TAB = {
  prompt: "prompt",
  preview: "preview",
  diff: "diff",
} as const;

export function detailRuntimeValue(
  detail: PromptSpecDetail,
): AISpecRuntimeValue | undefined {
  return isValidPromptSpecDetail(detail)
    ? specToPromptRuntimeValue(detail.spec, detail.body)
    : undefined;
}

// draftFor seeds a draft from a loaded detail: structured when the document
// parsed, raw (the only repair path) when it did not.
export function draftFor(
  detail: PromptSpecDetail,
  mode: PromptEditMode = "structured",
): PromptDraft {
  const value = detailRuntimeValue(detail);
  if (!value || mode === "raw")
    return { mode: "raw", raw: detail.raw, value: undefined };
  return { mode: "structured", raw: detail.raw, value };
}

export function isDraftDirty(
  draft: PromptDraft,
  detail: PromptSpecDetail,
): boolean {
  if (draft.mode === "raw") return draft.raw !== detail.raw;
  return (
    JSON.stringify(draft.value ?? null) !==
    JSON.stringify(detailRuntimeValue(detail) ?? null)
  );
}

export function isPromptPageDirty({
  draft,
  detail,
  source,
  path,
  entry,
  layer,
}: {
  draft: PromptDraft;
  detail: PromptSpecDetail;
  source: PromptSaveSource;
  path: string;
  entry: PromptCatalogEntry;
  layer: PromptCatalogLayer;
}): boolean {
  if (isDraftDirty(draft, detail)) return true;
  const initialSource = initialSaveSource(detail);
  if (source !== initialSource) return true;
  return source === "file" && path !== defaultFilePath(entry, layer, detail);
}

// draftRaw is the .prompt text a draft stands for — the raw text itself, or a
// structured edit composed back into frontmatter + body so it can be previewed
// and diffed before it is saved.
export function draftRaw(draft: PromptDraft): string {
  if (draft.mode === "raw" || !draft.value) return draft.raw;
  const { spec, body } = promptRuntimeValueToPayload(draft.value);
  if (Object.keys(spec).length === 0) return body;
  return `---\n${stringify(spec)}---\n${body}`;
}

export function buildSavePayload(
  draft: PromptDraft,
  detail: PromptSpecDetail,
  source: PromptSaveSource,
  path: string,
): PromptSpecSavePayload {
  const filePath = source === "file" ? path : undefined;
  if (draft.mode === "raw" || !draft.value) {
    return { source, path: filePath, raw: draft.raw, baseRaw: detail.raw };
  }
  const { spec, body } = promptRuntimeValueToPayload(draft.value);
  return { source, path: filePath, spec, body, baseRaw: detail.raw };
}

export function initialSaveSource(detail: PromptSpecDetail): PromptSaveSource {
  return detail.source === "file" ? "file" : "inline";
}

// defaultFilePath is where a file override lands unless the user types a
// path: the file the layer already points at, else a conventional path under
// the layer's directory.
export function defaultFilePath(
  entry: PromptCatalogEntry,
  layer: PromptCatalogLayer,
  detail?: PromptSpecDetail,
): string {
  if (detail?.source === "file" && detail.path) return detail.path;
  if (layer.filePath) return layer.filePath;
  return `.gavel/prompts/${entry.id.replace(/\./g, "-")}.prompt`;
}

// isConflictError recognises the backend's optimistic-concurrency rejection
// (the layer changed after the detail loaded) so the page offers a reload
// instead of a generic failure.
export function isConflictError(message: string): boolean {
  return /changed since it was loaded|reload before saving/i.test(message);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function seedVariables(entry: PromptCatalogEntry): string {
  const seed: Record<string, string> = {};
  for (const name of entry.variables ?? []) seed[name] = "";
  return JSON.stringify(seed, null, 2);
}

export function parseVariables(
  text: string,
): { variables: Record<string, unknown> } | { error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { variables: {} };
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "variables must be a JSON object" };
    }
    return { variables: parsed as Record<string, unknown> };
  } catch (error) {
    return { error: errorMessage(error, "invalid JSON") };
  }
}

export function pageTabs(options: {
  canPreview: boolean;
  canDiff: boolean;
  extraTabs?: PromptPageTab[] | undefined;
}): TabItem[] {
  const tabs: TabItem[] = [{ id: PROMPT_PAGE_TAB.prompt, label: "Prompt" }];
  if (options.canPreview)
    tabs.push({ id: PROMPT_PAGE_TAB.preview, label: "Preview" });
  if (options.canDiff)
    tabs.push({ id: PROMPT_PAGE_TAB.diff, label: "Diff vs default" });
  for (const tab of options.extraTabs ?? []) {
    tabs.push({
      id: tab.id,
      label: tab.label,
      ...(tab.count !== undefined ? { count: tab.count } : {}),
    });
  }
  return tabs;
}
