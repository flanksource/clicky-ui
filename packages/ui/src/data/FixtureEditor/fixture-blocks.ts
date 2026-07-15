import {
  isMap,
  parseDocument,
  stringify,
  type Document,
  type ParsedNode,
} from "yaml";
import type { FixtureFenceSchemas } from "./types";

export type FixtureFenceKind =
  | "ai"
  | "code"
  | "exec"
  | "lint"
  | "prompt"
  | "shell"
  | "test"
  | "yaml";

export type ParsedFixtureYaml =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

export function createFenceMarkdown(
  info: string,
  schemas: FixtureFenceSchemas = {},
): string {
  const fenceInfo = fixtureFenceSnippetInfo(info);
  const { language, meta } = splitFixtureFenceInfo(fenceInfo);
  const body =
    resolveFixtureFenceSchema(language, meta, schemas) &&
    fixtureFenceParsesYaml(language, meta)
      ? "{}\n"
      : "";
  return `\`\`\`${fenceInfo}\n${body}\`\`\`\n`;
}

export function createChecklistMarkdown(): string {
  return "- [ ] \n";
}

export function parseFixtureYaml(body: string): ParsedFixtureYaml {
  const doc = parseDocument(body, { prettyErrors: false });
  const firstError = doc.errors[0];
  if (firstError) return { ok: false, error: firstError.message };

  const value = yamlDocumentToJson(doc);
  if (value == null) return { ok: true, value: {} };
  if (!isRecord(value)) return { ok: false, error: "YAML root must be an object" };
  return { ok: true, value };
}

export function stringifyFixtureYaml(value: unknown): string {
  const normalized = isRecord(value) ? value : {};
  const output = stringify(normalized, {
    lineWidth: 0,
    collectionStyle: "block",
  });
  return output.endsWith("\n") ? output : `${output}\n`;
}

export function schemaKeys(
  schemas: FixtureFenceSchemas | undefined,
): string[] {
  return Object.keys(schemas ?? {});
}

export function fixtureFenceInfo(language: string, meta: string): string {
  return [language, meta].map((part) => part.trim()).filter(Boolean).join(" ");
}

export function splitFixtureFenceInfo(info: string): {
  language: string;
  meta: string;
} {
  const [language = "", ...metaParts] = info.trim().split(/\s+/).filter(Boolean);
  return {
    language,
    meta: metaParts.join(" "),
  };
}

export function firstFenceMetaToken(meta: string | null | undefined): string {
  return (meta ?? "").trim().split(/\s+/).find(Boolean) ?? "";
}

export function fixtureFenceSnippetInfo(info: string): string {
  const normalized = fixtureFenceInfoFromRaw(info);
  const runnerKind = runnerStepKind(normalized);
  return runnerKind ? `yaml ${runnerKind}` : normalized;
}

export function fixtureFenceKind(
  language: string | null | undefined,
  meta: string | null | undefined,
): FixtureFenceKind {
  const normalizedLanguage = normalizeToken(language);
  const info = fixtureFenceInfo(normalizedLanguage, meta ?? "");
  const runnerKind = runnerStepKind(info);
  if (runnerKind) return runnerKind;
  if (normalizedLanguage === "ai") return "ai";
  if (normalizedLanguage === "prompt") return "prompt";
  if (normalizedLanguage === "exec") return "exec";
  if (["bash", "shell", "sh"].includes(normalizedLanguage)) return "shell";
  if (normalizedLanguage === "yaml" || normalizedLanguage === "yml") return "yaml";
  return normalizedLanguage === "" ? "code" : "code";
}

export function fixtureFenceSchemaAliases(
  language: string | null | undefined,
  meta: string | null | undefined,
): string[] {
  const normalizedLanguage = normalizeToken(language);
  const normalizedMeta = (meta ?? "").trim();
  const info = fixtureFenceInfo(normalizedLanguage, normalizedMeta);
  const kind = fixtureFenceKind(normalizedLanguage, normalizedMeta);
  if (!info) return [];

  if (kind === "test" || kind === "lint") {
    return [...new Set([info, kind, `yaml ${kind}`])];
  }
  if (kind === "exec" || kind === "shell") {
    return [...new Set([info, normalizedLanguage, kind, "exec"])];
  }

  if (kind === "yaml") return [info];

  return [];
}

export function resolveFixtureFenceSchema(
  language: string | null | undefined,
  meta: string | null | undefined,
  schemas: FixtureFenceSchemas | undefined,
) {
  for (const key of fixtureFenceSchemaAliases(language, meta)) {
    const schema = schemas?.[key];
    if (schema != null) return schema;
  }
  return undefined;
}

export function fixtureFenceParsesYaml(
  language: string | null | undefined,
  meta: string | null | undefined,
): boolean {
  const normalizedLanguage = normalizeToken(language);
  const kind = fixtureFenceKind(normalizedLanguage, meta ?? "");
  return (
    normalizedLanguage === "yaml" ||
    normalizedLanguage === "yml" ||
    kind === "test" ||
    kind === "lint"
  );
}

function runnerStepKind(info: string): "test" | "lint" | "" {
  const parts = info.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const marker = parts.at(-1);
  if (marker !== "test" && marker !== "lint") return "";
  if (parts.length === 1) return marker;
  if (parts.length === 2 && parts[0] === "yaml") return marker;
  return "";
}

function fixtureFenceInfoFromRaw(info: string): string {
  const { language, meta } = splitFixtureFenceInfo(info);
  return fixtureFenceInfo(language, meta);
}

function normalizeToken(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function yamlDocumentToJson(doc: Document.Parsed<ParsedNode>): unknown {
  if (doc.contents != null && !isMap(doc.contents)) {
    return doc.toJSON();
  }
  return doc.toJSON();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
