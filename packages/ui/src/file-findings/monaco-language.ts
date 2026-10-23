import { languageFromPath } from "../data/code-highlight";

// File extension -> Monaco language id, for the languages Monaco ships and
// that gavel's linters and test frameworks commonly flag.
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  go: "go",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  jsonc: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  mdx: "markdown",
  py: "python",
  rb: "ruby",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  sql: "sql",
  css: "css",
  scss: "scss",
  less: "less",
  html: "html",
  xml: "xml",
  toml: "ini",
  ini: "ini",
  dockerfile: "dockerfile",
  proto: "protobuf",
  tf: "hcl",
  hcl: "hcl",
};

/** The Monaco language id for `path`'s extension; `plaintext` when Monaco has no mode for it. */
export function monacoLanguageForPath(path: string): string {
  const extension = languageFromPath(path);
  return (extension && LANGUAGE_BY_EXTENSION[extension]) || "plaintext";
}

// Monaco's own typescript/javascript/json/css/html modes register language
// services that start dedicated workers and emit their own diagnostics (an
// unresolved import is an error in a file viewed outside its project). Hosts
// only provide the base editor worker, and the markers shown here are the
// findings alone, so these languages get highlight-only twins: the same
// Monarch tokenizer under an id that has no language service behind it.
export const FINDINGS_LANGUAGE_IDS = [
  "findings-typescript",
  "findings-javascript",
  "findings-json",
  "findings-css",
  "findings-scss",
  "findings-less",
  "findings-html",
] as const;

export type FindingsLanguageId = (typeof FINDINGS_LANGUAGE_IDS)[number];

const HIGHLIGHT_ONLY_LANGUAGE: Record<string, FindingsLanguageId> = {
  typescript: "findings-typescript",
  javascript: "findings-javascript",
  json: "findings-json",
  css: "findings-css",
  scss: "findings-scss",
  less: "findings-less",
  html: "findings-html",
};

/**
 * The language id to open `path` with in the findings viewer: the
 * highlight-only twin (registered by `registerFindingsLanguages`) where Monaco's
 * own mode would start a language service, else `monacoLanguageForPath`.
 */
export function findingsLanguageForPath(path: string): string {
  const language = monacoLanguageForPath(path);
  return HIGHLIGHT_ONLY_LANGUAGE[language] ?? language;
}
