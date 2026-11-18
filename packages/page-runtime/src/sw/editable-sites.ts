import type { parse } from "sucrase/dist/parser";
import { TokenType } from "sucrase/dist/parser/tokenizer/types";

type Tokens = ReturnType<typeof parse>["tokens"];
const COMPONENTS = new Set(["BoxNode", "ContainerNode", "BrandBox", "BrandContainer", "Tile", "Zone"]);
const SVG = new Set(["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan", "g"]);

// The write server counts facet imports (including aliases/namespaces) and intrinsic SVG in one source-order sequence.
export function editableTags(code: string, tokens: Tokens): Set<string> {
  const tags = new Set(SVG);
  tokens.forEach((token, index) => {
    if (token.type !== TokenType._import || token.isType) return;
    let end = index + 1;
    while (tokens[end] && tokens[end]!.type !== TokenType.string && tokens[end]!.type !== TokenType.semi) end++;
    const module = tokens[end];
    if (!module || !/^@flanksource\/facet(?:\/.*)?$/.test(code.slice(module.start + 1, module.end - 1))) return;
    for (let at = index + 1; at < end; at++) {
      const item = tokens[at]!;
      if (item.isType) continue;
      if (item.type === TokenType.star && tokens[at + 2]) {
        const namespace = code.slice(tokens[at + 2]!.start, tokens[at + 2]!.end);
        for (const component of COMPONENTS) tags.add(`${namespace}.${component}`);
      }
      if (tokens[at - 1]?.type !== TokenType.braceL && tokens[at - 1]?.type !== TokenType.comma) continue;
      const name = code.slice(item.start, item.end).replace(/^["']|["']$/g, "");
      if (!COMPONENTS.has(name)) continue;
      const next = tokens[at + 1];
      const alias = next && code.slice(next.start, next.end) === "as" ? tokens[at + 2] : item;
      if (alias) tags.add(code.slice(alias.start, alias.end));
    }
  });
  return tags;
}

export function openingEnd(tokens: Tokens, index: number): number {
  let depth = 1;
  for (let at = index + 1; at < tokens.length; at++) {
    if (tokens[at]!.type === TokenType.jsxTagStart) depth++;
    if (tokens[at]!.type === TokenType.jsxTagEnd && --depth === 0) return tokens[at - 1]!.type === TokenType.slash ? tokens[at - 1]!.start : tokens[at]!.start;
  }
  throw new Error("JSX opening tag has no end");
}
