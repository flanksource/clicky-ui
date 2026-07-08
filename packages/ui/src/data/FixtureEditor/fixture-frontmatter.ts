import { parseDocument, stringify } from "yaml";
import {
  compactAISpecRuntime,
  type AISpecRuntimeEnvVar,
  type AISpecRuntimeValue,
} from "../ai/SpecRuntimeEditor.model";

export type FixtureAIExtras = {
  maxConcurrent?: number;
  cacheTTL?: string;
};

export type FixtureFrontmatterState = {
  runtime: AISpecRuntimeValue;
  aiExtras: FixtureAIExtras;
};

export type FixtureFrontmatterApplyOptions = {
  /** Omit model/runtime knobs so a verification fixture inherits its parent runtime. */
  inheritModel?: boolean | undefined;
};

export type FixtureFrontmatterParseResult =
  | {
      ok: true;
      hasFrontmatter: boolean;
      frontmatter: Record<string, unknown>;
      raw: string;
      body: string;
    }
  | {
      ok: false;
      hasFrontmatter: true;
      error: string;
      raw: string;
      body: string;
    };

const AI_RUNTIME_KEYS = new Set([
  "backend",
  "budget",
  "effort",
  "id",
  "model",
  "noCache",
  "prompt",
  "temperature",
]);

const AI_MODEL_KEYS = new Set([
  "backend",
  "budget",
  "effort",
  "id",
  "model",
  "noCache",
  "temperature",
]);

const AI_EXTRA_KEYS = new Set(["maxConcurrent", "cacheTTL"]);

export function parseFixtureFrontmatter(
  markdown: string,
): FixtureFrontmatterParseResult {
  const split = splitMarkdownFrontmatter(markdown);
  if (!split.hasFrontmatter) {
    return {
      ok: true,
      hasFrontmatter: false,
      frontmatter: {},
      raw: "",
      body: markdown,
    };
  }
  if (!split.closed) {
    return {
      ok: false,
      hasFrontmatter: true,
      error: "Frontmatter closing delimiter not found",
      raw: split.raw,
      body: split.body,
    };
  }

  const parsed = parseYamlRecord(split.raw);
  if (!parsed.ok) {
    return {
      ok: false,
      hasFrontmatter: true,
      error: parsed.error,
      raw: split.raw,
      body: split.body,
    };
  }

  return {
    ok: true,
    hasFrontmatter: true,
    frontmatter: parsed.value,
    raw: split.raw,
    body: split.body,
  };
}

export function fixtureFrontmatterState(
  frontmatter: Record<string, unknown>,
): FixtureFrontmatterState {
  const ai = recordValue(frontmatter.ai);
  const runtime = aiToRuntime(ai);
  const envVars = envToRuntimeEnvVars(frontmatter.env);
  if (envVars.length > 0) {
    runtime.setup = { ...runtime.setup, envVars };
  }
  const aiExtras = aiToExtras(ai);
  return { runtime, aiExtras };
}

export function applyFixtureFrontmatterState(
  markdown: string,
  state: FixtureFrontmatterState,
  options: FixtureFrontmatterApplyOptions = {},
): string {
  const parsed = parseFixtureFrontmatter(markdown);
  const body = parsed.body;
  const existing = parsed.ok ? parsed.frontmatter : {};
  const frontmatter = frontmatterFromState(existing, state, options);
  return serializeFixtureFrontmatter(frontmatter, body);
}

export function applyFixtureFrontmatterRaw(
  markdown: string,
  raw: string,
): string {
  const split = splitMarkdownFrontmatter(markdown);
  const body = split.hasFrontmatter ? split.body : markdown;
  if (raw.trim() === "") return body;
  const normalizedRaw = raw.endsWith("\n") ? raw : `${raw}\n`;
  return `---\n${normalizedRaw}---\n${body}`;
}

export function frontmatterFromState(
  existing: Record<string, unknown>,
  state: FixtureFrontmatterState,
  options: FixtureFrontmatterApplyOptions = {},
): Record<string, unknown> {
  const next = omitKeys(existing, ["ai", "env"]);
  const currentAI = recordValue(existing.ai);
  const ai = {
    ...omitControlledAIKeys(currentAI),
    ...runtimeToAI(state.runtime, options),
    ...compactAIExtras(state.aiExtras),
  };
  const env = runtimeEnvVarsToEnv(state.runtime.setup?.envVars);

  if (hasKeys(ai)) next.ai = ai;
  if (hasKeys(env)) next.env = env;
  return next;
}

function aiToRuntime(ai: Record<string, unknown>): AISpecRuntimeValue {
  const runtime: AISpecRuntimeValue = {};
  const model = stringValue(ai.model);
  if (model) runtime.model = model;
  const backend = stringValue(ai.backend);
  if (backend) runtime.backend = backend;
  const id = stringValue(ai.id);
  if (id) runtime.id = id;
  const effort = stringValue(ai.effort);
  if (effort) runtime.effort = effort;
  const temperature = numberValue(ai.temperature);
  if (temperature != null) runtime.temperature = temperature;
  if (ai.noCache === true) runtime.noCache = true;

  const budget = recordValue(ai.budget);
  const maxTokens = numberValue(ai.maxTokens) ?? numberValue(budget.maxTokens);
  const cost = numberValue(budget.cost);
  const maxTurns = numberValue(budget.maxTurns);
  const timeout = stringValue(budget.timeout);
  if (maxTokens != null || cost != null || maxTurns != null || timeout) {
    runtime.budget = {
      ...(cost != null ? { cost } : {}),
      ...(maxTokens != null ? { maxTokens } : {}),
      ...(maxTurns != null ? { maxTurns } : {}),
      ...(timeout ? { timeout } : {}),
    };
  }

  const prompt = promptToRuntimePrompt(ai.prompt);
  if (prompt) runtime.prompt = prompt;

  return runtime;
}

function runtimeToAI(
  runtime: AISpecRuntimeValue,
  options: FixtureFrontmatterApplyOptions = {},
): Record<string, unknown> {
  const compact = compactAISpecRuntime(runtime);
  const ai: Record<string, unknown> = {};
  for (const key of AI_RUNTIME_KEYS) {
    if (options.inheritModel && AI_MODEL_KEYS.has(key)) continue;
    const value = (compact as Record<string, unknown>)[key];
    if (value != null && (key !== "budget" || hasKeys(recordValue(value)))) {
      ai[key] = value;
    }
  }
  const maxTokens = compact.budget?.maxTokens;
  if (maxTokens != null && !options.inheritModel) {
    delete ai.budget;
    ai.maxTokens = maxTokens;
  }
  return ai;
}

function promptToRuntimePrompt(
  value: unknown,
): AISpecRuntimeValue["prompt"] | undefined {
  if (typeof value === "string") {
    const user = stringValue(value);
    return user ? { user } : undefined;
  }
  const prompt = recordValue(value);
  const user = stringValue(prompt.user);
  const system = stringValue(prompt.system);
  const appendSystem = stringValue(prompt.appendSystem);
  const source = stringValue(prompt.source);
  const metadata = recordStringMap(prompt.metadata);
  const out = {
    ...(user ? { user } : {}),
    ...(system ? { system } : {}),
    ...(appendSystem ? { appendSystem } : {}),
    ...(source ? { source } : {}),
    ...(metadata ? { metadata } : {}),
  };
  return hasKeys(out) ? out : undefined;
}

function aiToExtras(ai: Record<string, unknown>): FixtureAIExtras {
  const maxConcurrent = numberValue(ai.maxConcurrent);
  const cacheTTL = stringValue(ai.cacheTTL);
  return {
    ...(maxConcurrent != null ? { maxConcurrent } : {}),
    ...(cacheTTL ? { cacheTTL } : {}),
  };
}

function compactAIExtras(extras: FixtureAIExtras): Record<string, unknown> {
  return {
    ...(numberValue(extras.maxConcurrent) != null
      ? { maxConcurrent: numberValue(extras.maxConcurrent) }
      : {}),
    ...(stringValue(extras.cacheTTL) ? { cacheTTL: stringValue(extras.cacheTTL) } : {}),
  };
}

function envToRuntimeEnvVars(value: unknown): AISpecRuntimeEnvVar[] {
  if (!isRecord(value)) return [];
  const envVars: AISpecRuntimeEnvVar[] = [];
  for (const [name, envValue] of Object.entries(value)) {
    const key = name.trim();
    if (!key || typeof envValue !== "string") continue;
    envVars.push({ name: key, value: envValue });
  }
  return envVars;
}

function runtimeEnvVarsToEnv(
  value: AISpecRuntimeEnvVar[] | undefined,
): Record<string, unknown> {
  const env: Record<string, unknown> = {};
  for (const item of value ?? []) {
    const name = stringValue(item.name);
    if (!name) continue;
    const literal = typeof item.value === "string" ? item.value : undefined;
    const valueFrom =
      typeof item.valueFrom === "string" ? item.valueFrom : undefined;
    if (literal != null) env[name] = literal;
    else if (valueFrom) env[name] = valueFrom;
  }
  return env;
}

function serializeFixtureFrontmatter(
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  if (!hasKeys(frontmatter)) return body;
  const yaml = stringify(frontmatter, {
    lineWidth: 0,
    collectionStyle: "block",
  });
  const normalizedYaml = yaml.endsWith("\n") ? yaml : `${yaml}\n`;
  return `---\n${normalizedYaml}---\n${body}`;
}

function splitMarkdownFrontmatter(markdown: string):
  | { hasFrontmatter: false }
  | { hasFrontmatter: true; closed: boolean; raw: string; body: string } {
  const lines = splitLinesWithEndings(markdown);
  if (stripLineEnding(lines[0] ?? "") !== "---") return { hasFrontmatter: false };

  for (let index = 1; index < lines.length; index += 1) {
    const line = stripLineEnding(lines[index] ?? "");
    if (line === "---" || line === "...") {
      return {
        hasFrontmatter: true,
        closed: true,
        raw: lines.slice(1, index).join(""),
        body: lines.slice(index + 1).join(""),
      };
    }
  }

  return {
    hasFrontmatter: true,
    closed: false,
    raw: lines.slice(1).join(""),
    body: "",
  };
}

function splitLinesWithEndings(text: string): string[] {
  if (text === "") return [];
  const lines = text.match(/[^\n]*(?:\n|$)/g) ?? [];
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function stripLineEnding(line: string): string {
  return line.replace(/\r?\n$/, "").trim();
}

function parseYamlRecord(
  yaml: string,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (yaml.trim() === "") return { ok: true, value: {} };
  const doc = parseDocument(yaml, { prettyErrors: false });
  const firstError = doc.errors[0];
  if (firstError) return { ok: false, error: firstError.message };
  const value = doc.toJSON();
  if (value == null) return { ok: true, value: {} };
  if (!isRecord(value)) return { ok: false, error: "Frontmatter root must be an object" };
  return { ok: true, value };
}

function omitControlledAIKeys(ai: Record<string, unknown>): Record<string, unknown> {
  const omitted = new Set([...AI_RUNTIME_KEYS, ...AI_EXTRA_KEYS, "maxTokens"]);
  return omitKeys(ai, [...omitted]);
}

function omitKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const omitted = new Set(keys);
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !omitted.has(key)),
  );
}

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function recordStringMap(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key || typeof rawValue !== "string") continue;
    out[key] = rawValue;
  }
  return hasKeys(out) ? out : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function hasKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
