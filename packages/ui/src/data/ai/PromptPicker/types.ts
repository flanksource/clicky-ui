import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";

export type PromptPickerValue = string | { inline?: string; file?: string };

export type PromptSpecDetail = {
  id?: string | undefined;
  scope?: string | undefined;
  source: "default" | "inline" | "file";
  path?: string | undefined;
  spec: Record<string, unknown>;
  body: string;
  raw: string;
};

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
    };
