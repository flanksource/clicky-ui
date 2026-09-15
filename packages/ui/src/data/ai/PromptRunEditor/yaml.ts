import { parse, stringify } from "yaml";
import type { AIPromptRunValue } from "./model";

const FIELD_CHECKS: Record<
  keyof AIPromptRunValue,
  { valid: (value: unknown) => boolean; expected: string }
> = {
  variables: { valid: isRecord, expected: "a mapping" },
  spec: { valid: isRecord, expected: "a mapping" },
  runtimes: {
    valid: (value) => Array.isArray(value) && value.every(isRecord),
    expected: "a list of mappings",
  },
  chat: { valid: (value) => typeof value === "boolean", expected: "a boolean" },
  presets: {
    valid: (value) =>
      Array.isArray(value) && value.every((item) => typeof item === "string"),
    expected: "a list of strings",
  },
  runtimeProfile: {
    valid: (value) => typeof value === "string",
    expected: "a string",
  },
};

/** The prompt run request as YAML, for hosts that offer a raw request editor. */
export function promptRunYaml(value: AIPromptRunValue): string {
  return stringify(value);
}

/**
 * Parses a raw request edit. Top-level fields are checked so a typo or a
 * scalar where the editor expects a mapping fails here, not while rendering.
 */
export function parsePromptRunYaml(text: string): AIPromptRunValue {
  const parsed: unknown = parse(text);
  if (!isRecord(parsed)) throw new Error("Prompt run YAML must be a mapping");
  for (const [field, value] of Object.entries(parsed)) {
    if (!Object.hasOwn(FIELD_CHECKS, field)) {
      throw new Error(
        `Prompt run YAML has unknown field ${JSON.stringify(field)}`,
      );
    }
    const check = FIELD_CHECKS[field as keyof AIPromptRunValue];
    if (!check.valid(value)) {
      throw new Error(
        `Prompt run YAML field ${field} must be ${check.expected}`,
      );
    }
  }
  return parsed as AIPromptRunValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
