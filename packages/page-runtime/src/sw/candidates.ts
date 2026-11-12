import { parse } from "sucrase/dist/parser";
import { TokenType } from "sucrase/dist/parser/tokenizer/types";

export function sourceCandidates(options: { path: string; code: string }): string[] {
  const javascript = /\.(?:tsx?|jsx?|mjs)$/.test(options.path);
  let start = 0;
  const parts: string[] = [];
  if (javascript) for (const token of parse(options.code, true, /\.tsx?$/.test(options.path), false).tokens) {
    if (token.type !== TokenType.jsxText) continue;
    parts.push(options.code.slice(start, token.start)); start = token.end;
  }
  const text = [...parts, options.code.slice(start)].join(" ");
  return [...new Set(text.match(/[A-Za-z0-9_!:@/.[\]#%(),=+-]+/g) ?? [])];
}
