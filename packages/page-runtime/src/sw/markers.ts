import { parse } from "sucrase/dist/parser";
import { TokenType } from "sucrase/dist/parser/tokenizer/types";
import { formatEditableSource, parseEditableSource } from "../markers.ts";
import { editableTags, openingEnd } from "./editable-sites.ts";
import { sourceHash } from "./source-hash.ts";

// Design-mode source markers: `data-source="<path>:<line>:<column>"` on host elements, line and column 1-based at the
// element's `<`. Sucrase's development output gives jsxDEV a `lineNumber` but no `columnNumber`, so for TS, TSX and
// JSX the compiler writes the attribute into each host tag before Sucrase runs, using Sucrase's own tokenizer.

export type MarkerSite = { line: number; column: number; tag: string };

function afterTypeArguments(tokens: ReturnType<typeof parse>["tokens"], nameIndex: number): number {
  let end = nameIndex;
  while (tokens[end + 1]?.isType) end += 1;
  return tokens[end]!.end;
}

/** Offsets where each line starts, for turning an offset into a 1-based line and column. */
function lineStarts(code: string): number[] {
  const starts = [0];
  for (let index = 0; index < code.length; index += 1) if (code[index] === "\n") starts.push(index + 1);
  return starts;
}

function position(starts: number[], offset: number): { line: number; column: number } {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((starts[middle] ?? 0) <= offset) low = middle;
    else high = middle - 1;
  }
  return { line: low + 1, column: offset - (starts[low] ?? 0) + 1 };
}

/** Every host JSX opening tag (lowercase name, not a member expression) with its position. */
export function hostSites(code: string, typescript: boolean): Array<MarkerSite & { nameEnd: number }> {
  const { tokens } = parse(code, true, typescript, false);
  const starts = lineStarts(code);
  const sites: Array<MarkerSite & { nameEnd: number }> = [];
  tokens.forEach((token, index) => {
    const name = tokens[index + 1];
    const after = tokens[index + 2];
    if (token.type !== TokenType.jsxTagStart || name?.type !== TokenType.jsxName) return;
    if (after?.type === TokenType.dot || after?.type === TokenType.colon) return;
    const tag = code.slice(name.start, name.end);
    if (!/^[a-z]/.test(tag)) return;
    sites.push({ ...position(starts, token.start), tag, nameEnd: afterTypeArguments(tokens, index + 1) });
  });
  return sites;
}

/** Writes `data-source` into every host JSX opening tag of a module. */
export function insertSourceMarkers(code: string, path: string, typescript: boolean): { code: string; sites: MarkerSite[]; sourceProperty: string } {
  const sites = hostSites(code, typescript);
  let sourceProperty = "__pageRuntimeSource";
  while (code.includes(sourceProperty)) sourceProperty += "_";
  const { tokens } = parse(code, true, typescript, false);
  const starts = lineStarts(code);
  const editable = editableTags(code, tokens);
  const hash = sourceHash(code);
  let ordinal = 0;
  const insertions = sites.map((site) => ({ at: site.nameEnd, text: ` data-source=${JSON.stringify(`${path}:${site.line}:${site.column}`)}` }));
  tokens.forEach((token, index) => {
    const name = tokens[index + 1];
    if (token.type !== TokenType.jsxTagStart || name?.type !== TokenType.jsxName) return;
    let end = index + 2;
    while (tokens[end]?.type === TokenType.dot && tokens[end + 1]?.type === TokenType.jsxName) end += 2;
    const { line, column } = position(starts, token.start);
    const tag = code.slice(name.start, tokens[end - 1]!.end);
    if (editable.has(tag)) {
      const at = openingEnd(tokens, index);
      if (tokens.slice(end, tokens.findIndex((item) => item.start === at)).some((item) => code.slice(item.start, item.end) === "data-source" || code.slice(item.start, item.end) === "data-editable-source")) throw new Error(`${path}:${line}:${column}: source markers are compiler-owned`);
      const previous = insertions.findIndex((item) => item.at === afterTypeArguments(tokens, end - 1));
      if (previous >= 0) insertions.splice(previous, 1);
      insertions.push({ at, text: ` data-source=${JSON.stringify(formatEditableSource({ file: path, line, column, ordinal: ordinal++, hash }))} ` });
    }
    if (/^[a-z]/.test(tag) && tokens[index + 2]?.type !== TokenType.dot) return;
    insertions.push({ at: afterTypeArguments(tokens, end - 1), text: ` ${sourceProperty}={{fileName:${JSON.stringify(path)},lineNumber:${line},columnNumber:${column}}}` });
  });
  let marked = code;
  for (const insertion of insertions.sort((a, b) => b.at - a.at)) {
    marked = `${marked.slice(0, insertion.at)}${insertion.text}${marked.slice(insertion.at)}`;
  }
  return { code: marked, sites: sites.map(({ line, column, tag }) => ({ line, column, tag })), sourceProperty };
}

export type MarkerCheck = { valid: number; invalid: string[] };

/**
 * Checks rendered markers against the sources: a TS/TSX/JSX marker must name a host tag's `<`, and an MDX marker
 * (from MDX's jsxDEV positions, which point at markdown constructs too) a position inside its file.
 */
export function checkMarkers(markers: string[], sources: Map<string, string>): MarkerCheck {
  const sites = new Map<string, Set<string>>();
  const result: MarkerCheck = { valid: 0, invalid: [] };
  for (const marker of markers) {
    const match = /^(.+):(\d+):(\d+)(?:#\d+@[0-9a-f]{12})?$/.exec(marker);
    const code = match ? sources.get(match[1] ?? "") : undefined;
    if (!match || code === undefined) {
      result.invalid.push(`${marker}: not a known <path>:<line>:<column>`);
      continue;
    }
    const [, path = "", line, column] = match;
    if (marker.includes("#")) {
      const editable = parseEditableSource(marker);
      if (editable.hash !== sourceHash(code) || !insertSourceMarkers(code, path, /\.tsx?$/.test(path)).code.includes(`data-source=${JSON.stringify(marker)}`)) result.invalid.push(`${marker}: no matching editable call site`);
      else result.valid += 1;
      continue;
    }
    const at = `${line}:${column}`;
    if (/\.mdx?$/.test(path)) {
      const text = code.split("\n")[Number(line) - 1];
      if (text === undefined || Number(column) < 1 || Number(column) > text.length + 1) result.invalid.push(`${marker}: outside ${path}`);
      else result.valid += 1;
      continue;
    }
    let known = sites.get(path);
    if (!known) {
      known = new Set(hostSites(code, /\.tsx?$/.test(path)).map((site) => `${site.line}:${site.column}`));
      sites.set(path, known);
    }
    if (known.has(at)) result.valid += 1;
    else result.invalid.push(`${marker}: no host tag starts there`);
  }
  return result;
}
