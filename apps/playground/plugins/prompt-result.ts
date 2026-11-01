import type { Violation } from "../../../packages/ui/src/data/lint/types";
import type { CaptainPromptDetail, CaptainRunSummary } from "./captain-client";
import type { StoredChecklistItem, StoredRefGroup } from "./comments-store";

type JsonSchema = Record<string, unknown>;

// Handlebars helpers and keywords that look like variables inside `{{…}}`.
const TEMPLATE_KEYWORDS = new Set(["else", "this", "role", "if", "unless", "each", "with"]);
const PLACEHOLDER = /\{\{\{?\s*(?:[#^/]?(?:if|unless|each|with)\s+)?([A-Za-z_][\w]*)/g;

function templateVariables(content: string): string[] {
  const names = new Set<string>();
  for (const match of content.matchAll(PLACEHOLDER)) {
    const name = match[1];
    if (name && !TEMPLATE_KEYWORDS.has(name)) names.add(name);
  }
  return [...names];
}

/**
 * The schema a prompt's arguments are entered with: its declared input schema,
 * else one built from its listed variables, else from the template's
 * placeholders (prompts like diagram-smells declare none).
 */
export function promptVariablesSchema(prompt: CaptainPromptDetail): JsonSchema {
  if (prompt.inputSchema) return prompt.inputSchema;
  if (prompt.variables?.length) {
    const required = prompt.variables.filter((v) => v.required).map((v) => v.name);
    return {
      type: "object",
      ...(required.length ? { required } : {}),
      properties: Object.fromEntries(
        prompt.variables.map((v) => [
          v.name,
          { type: v.type || "string", ...(v.description ? { description: v.description } : {}) },
        ]),
      ),
    };
  }
  return {
    type: "object",
    properties: Object.fromEntries(
      templateVariables(prompt.content ?? "").map((name) => [name, { type: "string" }]),
    ),
  };
}

export type PromptResult =
  | {
      kind: "comment";
      body: string;
      checklist?: StoredChecklistItem[];
      refs?: StoredRefGroup[];
      lint?: { violations: Violation[] };
    }
  | { kind: "empty" }
  | { kind: "failed"; error: string };

function location(violation: Violation): string | undefined {
  if (!violation.file) return undefined;
  return violation.line ? `${violation.file}:${violation.line}` : violation.file;
}

function lintComment(name: string, violations: Violation[]): PromptResult {
  if (violations.length === 0) return { kind: "empty" };
  const lines = violations.map((violation) => {
    const parts = [
      `**${violation.severity ?? "error"}**`,
      violation.rule?.method ? `\`${violation.rule.method}\`` : undefined,
      location(violation) ? `\`${location(violation)}\`` : undefined,
    ].filter(Boolean);
    return `- ${parts.join(" ")} — ${violation.message ?? "(no message)"}`;
  });
  const files = [...new Set(violations.map(location).filter((file) => file !== undefined))];
  return {
    kind: "comment",
    body: [
      `**${name}** found ${violations.length} issue${violations.length === 1 ? "" : "s"}:`,
      "",
      ...lines,
    ].join("\n"),
    checklist: violations.map((violation) => ({
      label: [violation.severity ?? "error", violation.rule?.method]
        .filter(Boolean)
        .join(" · ")
        .concat(` — ${violation.message ?? "(no message)"}`),
      status: "open",
    })),
    ...(files.length ? { refs: [{ label: "Files", items: files, mono: true }] } : {}),
    lint: { violations },
  };
}

/** What a finished prompt run becomes: a structured comment, nothing, or a failure. */
export function promptResultComment(
  name: string,
  summary: CaptainRunSummary,
): PromptResult {
  if (!summary.success) {
    return { kind: "failed", error: summary.error || `${name} failed without an error message` };
  }
  const output = summary.structuredOutput;
  if (output !== undefined && output !== null) {
    const violations = (output as { violations?: unknown }).violations;
    if (Array.isArray(violations)) return lintComment(name, violations as Violation[]);
    return {
      kind: "comment",
      body: `**${name}**:\n\n\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\``,
    };
  }
  if (summary.text?.trim()) {
    return { kind: "comment", body: `**${name}**:\n\n${summary.text.trim()}` };
  }
  return { kind: "failed", error: `${name} returned no output` };
}
