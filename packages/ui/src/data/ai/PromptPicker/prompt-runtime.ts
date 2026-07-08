import {
  compactAISpecRuntime,
  type AISpecRuntimeSpec,
  type AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import type { PromptSpecDetail } from "./types";

export function specToPromptRuntimeValue(
  spec: Record<string, unknown>,
  body: string,
): AISpecRuntimeValue {
  const value = { ...(spec as AISpecRuntimeSpec) } as AISpecRuntimeValue;
  value.prompt = { ...value.prompt, user: body };
  return value;
}

export function promptRuntimeValueToPayload(value: AISpecRuntimeValue): {
  spec: AISpecRuntimeSpec;
  body: string;
} {
  const compact = compactAISpecRuntime(value);
  const body = compact.prompt?.user ?? "";
  const spec: AISpecRuntimeSpec = { ...compact };
  if (compact.prompt) {
    const prompt = { ...compact.prompt };
    delete prompt.user;
    if (Object.keys(prompt).length > 0) {
      spec.prompt = prompt;
    } else {
      delete spec.prompt;
    }
  }
  return { spec, body };
}

export function promptPreviewText(detail: PromptSpecDetail | null | undefined): string {
  const prompt = detail?.spec?.prompt;
  const frontmatterUser =
    prompt && typeof prompt === "object" && "user" in prompt
      ? (prompt as { user?: unknown }).user
      : undefined;

  for (const candidate of [detail?.body, frontmatterUser]) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.replace(/\s+/g, " ").trim();
    if (normalized) return normalized;
  }
  return "No prompt text";
}
