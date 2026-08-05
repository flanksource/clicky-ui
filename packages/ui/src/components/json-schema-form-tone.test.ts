import { describe, expect, it } from "vitest";
import {
  fieldToneNames,
  isFieldTone,
  normalizeTone,
  TONE_DOT_CLASS,
  TONE_EDGE_CLASS,
  TONE_GLYPH_CLASS,
  type FieldTone,
} from "./json-schema-form-tone";

const MAPS: Array<[string, Record<FieldTone, string>]> = [
  ["glyph", TONE_GLYPH_CLASS],
  ["edge", TONE_EDGE_CLASS],
  ["dot", TONE_DOT_CLASS],
];

describe("json-schema-form tones", () => {
  it.each(MAPS)("defines every tone in the %s map", (_name, map) => {
    expect(Object.keys(map).sort()).toEqual([...fieldToneNames()].sort());
  });

  // A tone must survive the theme switcher. There are exactly two ways to do
  // that: a `dark:` variant (the preset binds it to [data-theme="dark"]), or
  // semantic tokens, which are CSS variables the theme already re-points. A
  // literal palette class with neither silently keeps its light colours in dark.
  const SEMANTIC = /^(bg|text|ring|border(-[lrtb])?)-(muted|border|foreground|background|primary|accent|card|popover|input|destructive)(-foreground)?$/;
  it.each(MAPS)("keeps every %s tone theme-aware", (_name, map) => {
    for (const [tone, classes] of Object.entries(map)) {
      const literal = classes
        .split(/\s+/)
        .filter((c) => !c.startsWith("dark:") && !SEMANTIC.test(c));
      expect(
        literal.length === 0 || /\bdark:/.test(classes),
        `tone "${tone}" has palette classes (${literal.join(", ")}) but no dark: variant`,
      ).toBe(true);
    }
  });

  // A composed class (`bg-${tone}-100`) never reaches the scanner, so every
  // colour utility must appear whole.
  it.each(MAPS)("writes every %s class out in full", (_name, map) => {
    for (const [tone, classes] of Object.entries(map)) {
      expect(classes, `tone "${tone}" interpolates a class`).not.toMatch(/\$\{|`/);
    }
  });

  it("accepts the tones it publishes and rejects anything else", () => {
    for (const tone of fieldToneNames()) expect(isFieldTone(tone)).toBe(true);
    for (const other of ["", "puce", "Slate", "slate-400"]) {
      expect(isFieldTone(other)).toBe(false);
    }
  });

  it("falls back to neutral for a value the schema made up", () => {
    expect(normalizeTone("teal")).toBe("teal");
    for (const bad of ["puce", undefined, null, 7, {}, ["sky"]]) {
      expect(normalizeTone(bad)).toBe("neutral");
    }
  });
});
