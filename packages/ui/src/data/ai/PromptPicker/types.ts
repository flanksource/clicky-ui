import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";

export type PromptPickerValue = string | { inline?: string; file?: string };

// PromptSpecEffective is what actually runs once every config layer is merged —
// distinct from the layer being edited, which can be untouched ("default")
// while a lower layer supplies the override.
export type PromptSpecEffective = {
  source: "default" | "inline" | "file";
  origin?: string | undefined;
  path?: string | undefined;
  raw: string;
  version: string;
};

// PromptSpecDetailBase carries the identity + source of a resolved prompt for a
// config layer, independent of whether its .prompt frontmatter parsed cleanly.
// `raw` is always present so a malformed override can still be repaired;
// `version` hashes it so a save can be refused when the layer moved on.
type PromptSpecDetailBase = {
  id?: string | undefined;
  scope?: string | undefined;
  source: "default" | "inline" | "file";
  path?: string | undefined;
  raw: string;
  version?: string | undefined;
  effective?: PromptSpecEffective | undefined;
};

// ValidPromptSpecDetail is a prompt whose frontmatter parsed: it carries the
// parsed spec + body the structured editor binds to.
export type ValidPromptSpecDetail = PromptSpecDetailBase & {
  parseError?: undefined;
  spec: Record<string, unknown>;
  body: string;
};

// InvalidPromptSpecDetail is a prompt whose frontmatter failed to parse. It has
// no spec/body — only the raw source and the parser message — so the row stays
// actionable for a raw-source repair instead of being disabled.
export type InvalidPromptSpecDetail = PromptSpecDetailBase & {
  parseError: string;
  spec?: undefined;
  body?: undefined;
};

export type PromptSpecDetail = ValidPromptSpecDetail | InvalidPromptSpecDetail;

// isValidPromptSpecDetail narrows a detail to its parsed form so runtime/form
// conversion is only ever run against a real spec + body.
export function isValidPromptSpecDetail(
  detail: PromptSpecDetail,
): detail is ValidPromptSpecDetail {
  return !detail.parseError;
}

export type PromptSpecSavePayload =
  | {
      source: "default";
      baseRaw?: string | undefined;
    }
  | {
      source: "inline" | "file";
      path?: string | undefined;
      spec: AISpecRuntimeSpec;
      body: string;
      baseRaw?: string | undefined;
    }
  | {
      source: "inline" | "file";
      path?: string | undefined;
      raw: string;
      baseRaw?: string | undefined;
    };
