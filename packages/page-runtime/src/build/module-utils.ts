import { isBuiltin } from "node:module";

export function specifierKind(specifier: string): "relative" | "url" | "builtin" | "bare" {
  if (/^(\.{1,2}\/|\/)/.test(specifier)) return "relative";
  if (isBuiltin(specifier) || specifier.startsWith("node:")) return "builtin";
  if (/^[a-z][a-z0-9+.-]*:/i.test(specifier)) return "url";
  return "bare";
}

export const NPM_PREFIX = "/npm/";
export const CANONICAL_CANDIDATES = ["", ".mjs", ".js", ".cjs", ".json", "/index.mjs", "/index.js", "/index.cjs"];
