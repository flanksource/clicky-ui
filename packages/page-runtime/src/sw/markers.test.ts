import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { formatEditableSource, parseEditableSource } from "../markers.ts";
import { checkMarkers, insertSourceMarkers } from "./markers.ts";

describe("editable source markers", () => {
  const marker = { file: "diagram.tsx", line: 2, column: 3, ordinal: 0, hash: "012345abcdef" };
  it("round trips the write API grammar", () => {
    expect(formatEditableSource(marker)).toBe("diagram.tsx:2:3#0@012345abcdef");
    expect(parseEditableSource("diagram.tsx:2:3#0@012345abcdef")).toEqual(marker);
  });
  it.each(["diagram.tsx:0:3#0@012345abcdef", "diagram.tsx:2:3#-1@012345abcdef", "diagram.tsx:2:3#0@bad", "diagram.tsx:2:3"])("rejects invalid marker %s", (value) => {
    expect(() => parseEditableSource(value)).toThrow();
  });
  it("shares source-order ordinals across aliased and namespace facet calls and SVG, ignoring types and unrelated components", async () => {
    const code = ['import { BoxNode as Box, type Tile } from "@flanksource/facet";', 'import * as F from "@flanksource/facet/diagram";', 'const UI = { Box };', 'export default () => <main><Box<number> {...props} /><svg><rect /><F.Tile /><g><path /></g></svg><UI.Box /><Tile /></main>;'].join("\n");
    const result = await insertSourceMarkers(code, "diagram.tsx", true);
    const markers = [...result.code.matchAll(/data-source="([^"]+#\d+@[0-9a-f]+)"/g)].map((match) => parseEditableSource(match[1]!));
    expect(markers.map(({ ordinal, line, column }) => ({ ordinal, line, column }))).toEqual([
      { ordinal: 0, line: 4, column: 28 }, { ordinal: 1, line: 4, column: 59 },
      { ordinal: 2, line: 4, column: 67 }, { ordinal: 3, line: 4, column: 77 }, { ordinal: 4, line: 4, column: 80 },
    ]);
    expect(new Set(markers.map(({ hash }) => hash))).toEqual(new Set([createHash("sha256").update(code).digest("hex").slice(0, 12)]));
    expect(checkMarkers(markers.map(formatEditableSource), new Map([["diagram.tsx", code]]))).toEqual({ valid: 5, invalid: [] });
    expect(result.code).toMatch(/\{\.\.\.props\}\s+data-source=/);
  });
  it("marks the enclosing opening after JSX-valued attributes and spreads", () => {
    const source = 'import { BoxNode } from "@flanksource/facet"; export default () => <BoxNode title={<g><rect /></g>} {...props} />;';
    const result = insertSourceMarkers(source, "diagram.tsx", true);
    expect(result.code).toMatch(/\{\.\.\.props\}\s+data-source="diagram.tsx:1:68#0@[0-9a-f]{12}"/);
    expect([...result.code.matchAll(/#(\d+)@[0-9a-f]{12}/g)].map((match) => Number(match[1]))).toEqual([1, 2, 0]);
  });
});
