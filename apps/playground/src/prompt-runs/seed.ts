import type { AISpecRuntimeValue, SpecRuntimeFamily } from "@flanksource/clicky-ui/ai";

import type { CommentElementCaptureContext } from "../../plugins/comments-model";
import { joinFileValue } from "./file-picker-model";

type Schema = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value : undefined);

/** The runtime fields of a captain spec the runtime bar edits; the rest of the spec is left to captain. */
function declaredRuntime(spec: Schema | undefined): AISpecRuntimeValue {
  const budget = spec?.["budget"] as { cost?: unknown; timeout?: unknown } | undefined;
  const cost = typeof budget?.cost === "number" ? budget.cost : undefined;
  const timeout = text(budget?.timeout);
  const entries = { mode: text(spec?.["mode"]), model: text(spec?.["model"]), effort: text(spec?.["effort"]) };
  return {
    ...Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined)),
    ...(cost !== undefined || timeout !== undefined
      ? { budget: { ...(cost !== undefined ? { cost } : {}), ...(timeout !== undefined ? { timeout } : {}) } }
      : {}),
  };
}

/**
 * Seeds the runtime bar from the runtime a prompt's frontmatter configures
 * (captain's `run.spec`). A declared model is kept as written; a declared mode
 * alone takes the first available family's default model for it; a prompt that
 * configures nothing starts on the first available runtime.
 */
export function seedRuntime(spec: Schema | undefined, families: SpecRuntimeFamily[]): AISpecRuntimeValue {
  const declared = declaredRuntime(spec);
  if (declared.model) return declared;
  const mode = families.flatMap((family) => family.modes).find((option) => !declared.mode || option.id === declared.mode);
  if (!mode) return declared;
  return { ...declared, mode: mode.id, ...(mode.defaultModel ? { model: mode.defaultModel } : {}) };
}

/**
 * The file an element's captured source points at: the first frame of a React
 * stack (`in X (at /path.tsx:12:4)`) or a `path:line`, without the position.
 */
export function sourceFile(source: string): string {
  const frame = /\(at ([^)]+)\)/.exec(source)?.[1] ?? source.trim().split("\n")[0] ?? "";
  return frame.trim().replace(/(:\d+){1,2}$/, "");
}

/** The schema's required arguments that have no value yet; `0` and `false` count as values. */
export function missingRequired(schema: Schema, variables: Record<string, unknown>): string[] {
  const required = Array.isArray(schema["required"]) ? (schema["required"] as string[]) : [];
  return required.filter((name) => {
    const value = variables[name];
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null;
  });
}

/**
 * Seeds the arguments a prompt declares from the element: `files` with its
 * source file, `input` with its playground page, first CSS locator, component,
 * source and HTML. The page and selector are what a prompt's tools need to find
 * the element again. A seeded value spanning lines gets a multi-line box.
 */
export function seedPromptForm({
  schema,
  element,
  page,
  files = [sourceFile(element.source)],
}: {
  schema: Schema;
  element: Omit<CommentElementCaptureContext, "pageUrl" | "screenshot">;
  page: string;
  /** The files the prompt targets, when they are not the element's source file (e.g. a markdown page). */
  files?: string[];
}): { schema: Schema; variables: Record<string, unknown> } {
  const properties = (schema["properties"] ?? {}) as Record<string, Schema>;
  const selector = element.locators?.find((locator) => locator.kind === "css")?.selector;
  const seeds: Record<string, string | string[]> = {
    // An array argument takes one path per item; a string one holds space-separated paths.
    files: properties["files"]?.["type"] === "array" ? files : joinFileValue(files),
    input: [
      `Playground page: ${page}`,
      selector ? `Selector: ${selector}` : undefined,
      element.componentName ? `Component: <${element.componentName}>` : undefined,
      `Source: ${element.source.trim()}`,
      "HTML:",
      element.html,
    ]
      .filter((line) => line !== undefined)
      .join("\n"),
  };
  const variables = Object.fromEntries(Object.entries(properties).flatMap(([name,property]) => {
    if (Object.hasOwn(property,"default")) return [[name,property["default"]]];
    return name in seeds ? [[name,seeds[name]]] : [];
  }));
  const multiline = Object.keys(variables).filter((name) => {
    const value = variables[name];
    return typeof value === "string" && value.includes("\n");
  });
  if (multiline.length === 0) return { schema, variables };
  return {
    variables,
    schema: {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(properties).map(([name, property]) => [
          name,
          multiline.includes(name) ? { ...property, format: "textarea" } : property,
        ]),
      ),
    },
  };
}
