import { isMap, isNode, isScalar, LineCounter, parseDocument } from "yaml";
import { validateVersionRange } from "@flanksource/page-runtime/sw";

type Source = { source: string; file: string };
type Header = { start: number; end: number; yamlStart: number; yaml: string };
const packagePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;

function header({ source, file }: Source): Header | null {
  if (/\.mdx?$/.test(file)) {
    const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
    if (match) return { start: 0, end: match[0].length, yamlStart: match[0].indexOf("\n") + 1, yaml: match[1]! };
    if (/^\uFEFF?---\r?\n/.test(source)) throw new Error(`${file}:1: Unclosed YAML frontmatter`);
    return null;
  }
  const leading = /^(?:\uFEFF|\s|\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*(?=\S|$)/.exec(source)?.[0] ?? "";
  const match = /\/\*\r?\n---\r?\n([\s\S]*?)\r?\n---\r?\n\*\//.exec(leading);
  if (match) return { start: match.index, end: match.index + match[0].length, yamlStart: match.index + match[0].indexOf("---") + 4 + Number(match[0].includes("\r\n")), yaml: match[1]! };
  if (/\/\*\r?\n---\r?\n/.test(source.slice(0, leading.length + 8))) throw new Error(`${file}:1: Unclosed YAML dependency header`);
  return null;
}

function parseHeader(options: Source) {
  const found = header(options);
  const counter = new LineCounter();
  const doc = parseDocument(found?.yaml ?? "", { lineCounter: counter });
  const offset = found ? options.source.slice(0, found.yamlStart).split("\n").length - 1 : 0;
  const fail = (message: string, position = 0): never => { throw new Error(`${options.file}:${offset + counter.linePos(position).line}: ${message}`); };
  if (doc.errors.length) fail(`Invalid YAML${doc.errors.some(error => error.code === "DUPLICATE_KEY") ? " (duplicate key)" : ""}: ${doc.errors.map(error => error.message).join("; ")}`, doc.errors[0]!.pos[0]);
  if (doc.contents && !isMap(doc.contents)) fail("YAML header must be a mapping");
  const node = doc.get("dependencies", true);
  if (node !== undefined && !isMap(node)) fail("dependencies must be a mapping", isNode(node) ? node.range?.[0] : 0);
  const dependencies: Record<string, string> = {};
  if (isMap(node)) for (const pair of node.items) {
    const name = String(pair.key);
    const value = pair.value;
    if (!packagePattern.test(name) || !isScalar(value) || typeof value.value !== "string") return fail(`Invalid package or version declaration for ${name}`);
    try { validateVersionRange(value.value); } catch (error) { fail(`Invalid version for ${name}: ${String(error)}`, value.range?.[0]); }
    dependencies[name] = value.value;
  }
  return { found, doc, dependencies };
}

export function readPageDependencies(options: Source): Record<string, string> {
  return parseHeader(options).dependencies;
}

/** Sets (`version`) or removes (`null`) one dependency in the page's YAML header. */
export function updatePageDependency(options: Source & { name: string; version: string | null }): string {
  if (!packagePattern.test(options.name)) throw new Error(`${options.file}:1: Invalid package name ${options.name}`);
  if (options.version !== null) validateVersionRange(options.version);
  const { found, doc, dependencies } = parseHeader(options);
  if (options.version === null && !Object.hasOwn(dependencies, options.name)) throw new Error(`${options.file}:1: the page header does not declare ${options.name}`);
  if (dependencies[options.name] === options.version) return options.source;
  if (options.version === null) doc.deleteIn(["dependencies", options.name]); else doc.setIn(["dependencies", options.name], options.version);
  const newline = options.source.includes("\r\n") ? "\r\n" : "\n";
  const yaml = doc.toString().trimEnd().replace(/\n/g, newline);
  const markdown = /\.mdx?$/.test(options.file);
  const block = markdown ? `---${newline}${yaml}${newline}---${newline}` : `/*${newline}---${newline}${yaml}${newline}---${newline}*/`;
  if (found) return options.source.slice(0, found.start) + block + options.source.slice(found.end);
  const leadingLicense = markdown ? "" : /^(?:\uFEFF)?(?:\/\*(?!\r?\n---)[\s\S]*?\*\/\s*)?/.exec(options.source)?.[0] ?? "";
  return leadingLicense + block + (markdown ? "" : newline) + options.source.slice(leadingLicense.length);
}
