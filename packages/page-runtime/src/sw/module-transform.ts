import { parse, type Import, type StaticImport } from "es-module-lexer";

// Pure transforms the runtime applies to served modules. The service worker bundles this file, so it imports
// nothing from Node. Callers await es-module-lexer's `init` before calling `transformModule`.

/**
 * A library version's barrel index, published with its fragment: for each module that forwards exports, the
 * module that defines each name, as a position in `modules`, plus the name to import there when it differs.
 */
import type { BarrelIndex } from "../schema.ts";
export type { BarrelIndex } from "../schema.ts";

export type SpecifierKind = "relative" | "url" | "builtin" | "bare";

export function specifierKind(specifier: string): SpecifierKind {
  if (/^(\.{1,2}\/|\/)/.test(specifier)) return "relative";
  if (specifier.startsWith("node:")) return "builtin";
  if (/^[a-z][a-z0-9+.-]*:/i.test(specifier)) return "url";
  return "bare";
}

export const NPM_PREFIX = "/npm/";

/** Suffixes tried for a relative import that names no file, in the build tool's resolution order. */
export const CANONICAL_CANDIDATES = ["", ".mjs", ".js", ".cjs", ".json", "/index.mjs", "/index.js", "/index.cjs"];

export function stylesheetModule(css: string, url: string): string {
  return [
    `const link = document.createElement("link");`,
    `link.rel = "stylesheet"; link.href = ${JSON.stringify(url)};`,
    `link.dataset.pageRuntime = "loading";`,
    `const ready = new Promise((resolve, reject) => { link.onload = () => { link.dataset.pageRuntime = "loaded"; resolve(link.sheet); }; link.onerror = () => { link.dataset.pageRuntime = "error"; reject(new Error("stylesheet failed: " + link.href)); }; });`,
    "document.head.append(link);",
    `export const source = ${JSON.stringify(css)};`,
    "export default ready;",
    "",
  ].join("\n");
}

export type ImportBinding = { imported: string; local: string };
export type ImportClause = { bindings: ImportBinding[]; namespace: string | null };

const IDENTIFIER = String.raw`[\p{ID_Start}$_][\p{ID_Continue}$‌‍]*`;
const MODULE_NAME = String.raw`(?:${IDENTIFIER}|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')`;
const DEFAULT_BINDING = new RegExp(String.raw`^(${IDENTIFIER})\s*(?:,\s*|$)`, "u");
const NAMESPACE_BINDING = new RegExp(String.raw`^\*\s*as\s+(${IDENTIFIER})$`, "u");
const NAMED_BINDING = new RegExp(String.raw`^(${MODULE_NAME})(?:\s+as\s+(${MODULE_NAME}))?$`, "u");
const PLAIN_NAME = new RegExp(String.raw`^${IDENTIFIER}$`, "u");

function unquote(name: string): string {
  if (name.startsWith('"')) return JSON.parse(name) as string;
  if (name.startsWith("'")) return JSON.parse(`"${name.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"`) as string;
  return name;
}

function nameText(name: string): string {
  return PLAIN_NAME.test(name) ? name : JSON.stringify(name);
}

function bindingText({ imported, local }: ImportBinding): string {
  return imported === local ? nameText(local) : `${nameText(imported)} as ${nameText(local)}`;
}

/**
 * Parses the bindings between `import` (or `export`) and `from`. Returns null for anything it does not fully
 * understand, comments included, so the caller leaves that statement as written.
 */
export function parseClause(text: string): ImportClause | null {
  if (/\/[/*]/.test(text)) return null;
  let rest = text.trim();
  const clause: ImportClause = { bindings: [], namespace: null };
  const defaultBinding = DEFAULT_BINDING.exec(rest);
  if (defaultBinding?.[1]) {
    clause.bindings.push({ imported: "default", local: defaultBinding[1] });
    rest = rest.slice(defaultBinding[0].length);
    if (rest === "") return clause;
  }
  const namespace = NAMESPACE_BINDING.exec(rest);
  if (namespace?.[1]) return { ...clause, namespace: namespace[1] };
  const named = /^\{([^}]*)\}$/.exec(rest);
  if (!named) return null;
  for (const part of (named[1] ?? "").split(",")) {
    const item = part.trim();
    if (item === "") continue;
    const match = NAMED_BINDING.exec(item);
    if (!match?.[1]) return null;
    clause.bindings.push({ imported: unquote(match[1]), local: unquote(match[2] ?? match[1]) });
  }
  return clause;
}

export type TransformStats = {
  /** Relative imports rewritten to the canonical URL of the file they mean. */
  canonical: number;
  /** Import and export-from statements rewritten from a barrel to defining modules. */
  statements: number;
  /** Bindings moved from a barrel to the module that defines them. */
  rewritten: number;
  /** Bindings left on the barrel: names it defines itself, or names outside its index. */
  kept: number;
  /** Barrel statements that cannot be split: namespace imports and `export *`. */
  whole: number;
  /** Barrel statements whose bindings the clause parser did not understand. */
  unparsed: number;
};

export function emptyTransformStats(): TransformStats {
  return { canonical: 0, statements: 0, rewritten: 0, kept: 0, whole: 0, unparsed: 0 };
}

export function addTransformStats(total: TransformStats, more: TransformStats): void {
  for (const key of Object.keys(total) as Array<keyof TransformStats>) total[key] += more[key];
}

export type ModuleTransformOptions = {
  /** The module's URL path: `/npm/<package-relative URL>` for package files, anything else for page files. */
  url: string;
  /** Whether a package-relative URL names a file the runtime serves. */
  known: (packageUrl: string) => boolean;
  /** Resolves a bare specifier through the page's import map, as the browser would from `referrer`. */
  resolveBare: (specifier: string, referrer: string) => string | null;
  barrels: BarrelIndex | null;
};

type Edit = { start: number; end: number; text: string };
type Target = { url: string | null; canonical: string | null };

function targetOf(specifier: string, options: ModuleTransformOptions): Target {
  const kind = specifierKind(specifier);
  if (kind === "bare") return { url: options.resolveBare(specifier, options.url), canonical: null };
  if (kind !== "relative") return { url: null, canonical: null };
  const path = new URL(specifier, `https://runtime.invalid${options.url}`).pathname;
  if (!path.startsWith(NPM_PREFIX) || !options.url.startsWith(NPM_PREFIX)) return { url: path, canonical: null };
  const resolved = path.slice(NPM_PREFIX.length);
  const found = CANONICAL_CANDIDATES.map((suffix) => `${resolved}${suffix}`).find(options.known);
  if (!found) return { url: path, canonical: null };
  return { url: `${NPM_PREFIX}${found}`, canonical: found === resolved ? null : `${NPM_PREFIX}${found}` };
}

function specifierEdit(code: string, item: Import, specifier: string): Edit {
  const quoted = /^['"`]/.test(code.slice(item.start, item.end));
  return { start: item.start, end: item.end, text: quoted ? JSON.stringify(specifier) : specifier };
}

function rewriteStatement(
  code: string,
  item: StaticImport,
  entries: Record<string, number | [number, string]>,
  modules: string[],
  specifier: string,
  stats: TransformStats,
): string | null {
  if (item.attributes !== null || item.phase !== null || item.typeOnly) return null;
  const head = code.slice(item.importStart, item.start - 1);
  if (/^import\s*$/.test(head)) return null;
  const statement = /^(import|export)\s*([\s\S]*?)\s*from\s*$/.exec(head);
  const clause = statement ? parseClause(statement[2] ?? "") : null;
  if (!statement || !clause) {
    stats.unparsed += 1;
    return null;
  }
  const keyword = statement[1] ?? "import";
  if (keyword === "export" && clause.namespace) {
    stats.whole += 1;
    return null;
  }
  const groups = new Map<string, string[]>();
  const kept: string[] = [];
  for (const binding of clause.bindings) {
    const entry = entries[binding.imported];
    if (entry === undefined) {
      kept.push(bindingText(binding));
      continue;
    }
    const [position, name] = typeof entry === "number" ? [entry, binding.imported] : entry;
    const module = modules[position];
    if (module === undefined) throw new Error(`barrel index entry for ${binding.imported} points at missing module ${position}`);
    groups.set(module, [...(groups.get(module) ?? []), bindingText({ imported: name, local: binding.local })]);
  }
  stats.kept += kept.length;
  if (clause.namespace) stats.whole += 1;
  if (groups.size === 0) return null;
  const from = JSON.stringify(specifier);
  const statements = [
    ...(clause.namespace ? [`import * as ${clause.namespace} from ${from}`] : []),
    ...(kept.length > 0 ? [`${keyword} { ${kept.join(", ")} } from ${from}`] : []),
    ...[...groups].map(([module, names]) => `${keyword} { ${names.join(", ")} } from ${JSON.stringify(`${NPM_PREFIX}${module}`)}`),
  ];
  stats.statements += 1;
  stats.rewritten += clause.bindings.length - kept.length;
  return `${statements.join("; ")};`;
}

/**
 * Rewrites a served module's imports: relative imports in package files that name no file become canonical URLs,
 * and named imports from an indexed barrel move to the modules that define them. Everything else stays as written.
 */
export function transformModule(code: string, options: ModuleTransformOptions): { code: string; stats: TransformStats } {
  const stats = emptyTransformStats();
  const [imports] = parse(code);
  const edits: Edit[] = [];
  for (const item of imports) {
    if (item.type === "import-meta" || item.specifier === undefined || (item.type === "dynamic" && item.glob)) continue;
    const target = targetOf(item.specifier, options);
    const barrel = target.url?.startsWith(NPM_PREFIX) ? options.barrels?.barrels[target.url.slice(NPM_PREFIX.length)] : undefined;
    if (barrel && options.barrels && item.type === "static") {
      const statement = rewriteStatement(code, item, barrel, options.barrels.modules, target.canonical ?? item.specifier, stats);
      if (statement !== null) {
        edits.push({ start: item.importStart, end: item.importEnd, text: statement });
        continue;
      }
    } else if (barrel && item.type === "reexport-star") stats.whole += 1;
    if (target.canonical) {
      edits.push(specifierEdit(code, item, target.canonical));
      stats.canonical += 1;
    }
  }
  edits.sort((a, b) => b.start - a.start);
  let rewritten = code;
  let limit = code.length;
  for (const edit of edits) {
    if (edit.end > limit) throw new Error(`${options.url}: overlapping import edits at ${edit.start}`);
    rewritten = `${rewritten.slice(0, edit.start)}${edit.text}${rewritten.slice(edit.end)}`;
    limit = edit.start;
  }
  return { code: rewritten, stats };
}

const NODE_ENV = "process.env.NODE_ENV";
const NODE_ENV_TAIL = ".env.NODE_ENV";
// After these words an expression starts, so a `/` begins a regular expression rather than a division.
const EXPRESSION_KEYWORDS = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"]);
const IDENTIFIER_START = /[\p{ID_Start}$_\\]/u;
const IDENTIFIER_PART = /[\p{ID_Continue}$\\]|‌|‍/u;

function skipQuoted(code: string, start: number): number {
  const quote = code[start];
  for (let i = start + 1; i < code.length; i += 1) {
    const char = code[i];
    if (char === "\\") i += 1;
    else if (char === quote) return i + 1;
    else if (char === "\n") break;
  }
  throw new Error(`unterminated string at offset ${start}`);
}

function skipRegExp(code: string, start: number): number {
  let inClass = false;
  for (let i = start + 1; i < code.length; i += 1) {
    const char = code[i];
    if (char === "\\") i += 1;
    else if (char === "[") inClass = true;
    else if (char === "]") inClass = false;
    else if (char === "/" && !inClass) {
      let end = i + 1;
      while (end < code.length && /[a-z]/i.test(code[end] ?? "")) end += 1;
      return end;
    } else if (char === "\n") break;
  }
  throw new Error(`unterminated regular expression at offset ${start}`);
}

/** Scans template text from `start` to its closing backtick or its next `${`. */
function scanTemplate(code: string, start: number): { end: number; opened: boolean } {
  for (let i = start; i < code.length; i += 1) {
    const char = code[i];
    if (char === "\\") i += 1;
    else if (char === "`") return { end: i + 1, opened: false };
    else if (char === "$" && code[i + 1] === "{") return { end: i + 2, opened: true };
  }
  throw new Error(`unterminated template literal at offset ${start}`);
}

function precededByDot(code: string, start: number): boolean {
  let i = start - 1;
  while (i >= 0 && /\s/.test(code[i] ?? "")) i -= 1;
  return code[i] === "." && code[i - 1] !== ".";
}

/**
 * Offsets of `process.env.NODE_ENV` references, skipping comments, strings, template text and regular expressions.
 * A lexer, not a parser: the harness checks it against oxc's AST on every file of the library set.
 */
export function nodeEnvReferences(code: string): number[] {
  const found: number[] = [];
  const templates: number[] = [];
  let depth = 0;
  let regExpAllowed = true;
  let i = 0;
  while (i < code.length) {
    const char = code[i] ?? "";
    if (/\s/.test(char)) {
      i += 1;
    } else if (char === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      i = end === -1 ? code.length : end;
    } else if (char === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      if (end === -1) throw new Error(`unterminated comment at offset ${i}`);
      i = end + 2;
    } else if (char === "/") {
      i = regExpAllowed ? skipRegExp(code, i) : i + 1;
      regExpAllowed = !regExpAllowed;
    } else if (char === "'" || char === '"') {
      i = skipQuoted(code, i);
      regExpAllowed = false;
    } else if (char === "`" || (char === "}" && templates.at(-1) === depth - 1 && templates.length > 0)) {
      if (char === "}") {
        templates.pop();
        depth -= 1;
      }
      const scanned = scanTemplate(code, i + 1);
      i = scanned.end;
      regExpAllowed = scanned.opened;
      if (scanned.opened) {
        templates.push(depth);
        depth += 1;
      }
    } else if (char === "{" || char === "}") {
      depth += char === "{" ? 1 : -1;
      i += 1;
      regExpAllowed = true;
    } else if (IDENTIFIER_START.test(char)) {
      const start = i;
      i += 1;
      while (i < code.length && IDENTIFIER_PART.test(code[i] ?? "")) i += 1;
      const word = code.slice(start, i);
      const reference = word === "process" && code.startsWith(NODE_ENV_TAIL, i) && !IDENTIFIER_PART.test(code[i + NODE_ENV_TAIL.length] ?? "");
      if (reference && !precededByDot(code, start)) {
        found.push(start);
        i += NODE_ENV_TAIL.length;
        regExpAllowed = false;
      } else regExpAllowed = EXPRESSION_KEYWORDS.has(word);
    } else if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(code[i + 1] ?? ""))) {
      while (i < code.length && /[\w.]/.test(code[i] ?? "")) i += 1;
      regExpAllowed = false;
    } else {
      i += 1;
      regExpAllowed = char !== ")" && char !== "]";
    }
  }
  return found;
}

/** Defines `process.env.NODE_ENV` as development in every served package. */
export function defineNodeEnv(code: string): { code: string; replaced: number } {
  if (!code.includes(NODE_ENV)) return { code, replaced: 0 };
  const references = nodeEnvReferences(code);
  let defined = code;
  for (const start of [...references].reverse()) defined = `${defined.slice(0, start)}${JSON.stringify("development")}${defined.slice(start + NODE_ENV.length)}`;
  return { code: defined, replaced: references.length };
}
