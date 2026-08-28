import type { ReactNode } from "react";
import type {
  PromptSpecDetail,
  PromptSpecSavePayload,
} from "../PromptPicker/types";

// PromptPageTab is a host-supplied tab appended after the page's own
// (Prompt, Preview, Diff vs default) — run history, usage, and the like.
export interface PromptPageTab {
  id: string;
  label: ReactNode;
  content: ReactNode;
  count?: number | undefined;
}

// PromptCatalogSource is where a prompt's effective document comes from:
// the host's built-in default, an inline override stored in config, a file the
// config points at, or nothing (a named prompt the host has no default for).
export type PromptCatalogSource = "builtin" | "inline" | "file" | "none";

export interface PromptCatalogFilterState {
  query: string;
  commands: string[];
  sources: PromptCatalogSource[];
  models: string[];
  owners: string[];
  overriddenOnly: boolean;
}

// PromptCatalogLayer is one configuration layer in the chain that produces a
// prompt (for gavel: ~/.gavel.yaml, the git root, the target directory) and
// what that layer says about this prompt. `scope` is the host's opaque key for
// loading/saving the layer; a layer without it is shown read-only.
export interface PromptCatalogLayer {
  origin: string;
  path: string;
  scope?: string | undefined;
  editable: boolean;
  source: "none" | "inline" | "file";
  filePath?: string | undefined;
  fields?: string[] | undefined;
}

// PromptCatalogRuntime is the model a prompt resolves to once compact
// selectors are expanded — what the runtime will actually see — and which
// layer supplied its name.
export interface PromptCatalogRuntime {
  model?: string | undefined;
  backend?: string | undefined;
  effort?: string | undefined;
  fallbacks?: string[] | undefined;
  modelSource: string;
  error?: string | undefined;
}

// PromptCatalogEntry is one row of the prompts table and the subject of the
// prompt page: the document that would actually run, its runtime, the commands
// that use it, and per-layer provenance for every part of it.
export interface PromptCatalogEntry {
  id: string;
  title: string;
  description?: string | undefined;
  configPath?: string | undefined;
  owner: string;
  usedBy?: string[] | undefined;
  source: PromptCatalogSource;
  path?: string | undefined;
  raw?: string | undefined;
  version?: string | undefined;
  body?: string | undefined;
  variables?: string[] | undefined;
  parseError?: string | undefined;
  effective: PromptCatalogRuntime;
  provenance?: Record<string, string> | undefined;
  layers: PromptCatalogLayer[];
  // defaultRaw is the host's built-in document, when it has one, for the
  // "diff vs default" view.
  defaultRaw?: string | undefined;
  updatedAt?: string | undefined;
}

export interface PromptRenderInput {
  raw?: string | undefined;
  variables: Record<string, unknown>;
}

export interface PromptRenderResult {
  user: string;
  system?: string | undefined;
  model?: string | undefined;
  backend?: string | undefined;
}

// PromptPageAdapter is what a host supplies to make the page operate on its
// own storage: load and save one layer's document, and (optionally) render the
// effective or draft template with caller-supplied variables.
export interface PromptPageAdapter {
  loadDetail(
    entry: PromptCatalogEntry,
    layer: PromptCatalogLayer,
  ): Promise<PromptSpecDetail>;
  saveDetail(
    entry: PromptCatalogEntry,
    layer: PromptCatalogLayer,
    payload: PromptSpecSavePayload,
  ): Promise<PromptSpecDetail>;
  render?:
    | ((
        entry: PromptCatalogEntry,
        input: PromptRenderInput,
      ) => Promise<PromptRenderResult>)
    | undefined;
}
