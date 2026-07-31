import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import { contentWidthClassName } from "../layout/content-width";
import preset from "../tailwind-preset";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

/* The wide-viewport tiers `contained` steps up to. Mirrored in tailwind-preset.ts
 * for v3 consumers (in px) and in tokens.css `@theme` for v4 (in rem) — the first
 * test below pins the two representations together. */
const WIDE_CONTAINERS = { "8xl": "96rem", "9xl": "120rem" } as const;

/* Resolves `@import "tailwindcss"` (and the relative imports inside it) plus our
 * own sibling stylesheets off disk, so these tests compile the real theme rather
 * than a hand-written approximation of it. */
async function loadStylesheet(id: string, base: string) {
  const path = id.startsWith(".")
    ? resolve(base, id)
    : require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id);
  return { path, base: dirname(path), content: readFileSync(path, "utf8") };
}

/* A fresh compiler per call: `build()` is incremental, so reusing one compiler
 * would leak earlier candidates into later assertions. */
async function buildUtilities(candidates: string[]) {
  const compiler = await compile('@import "tailwindcss";\n@import "./tokens.css";', {
    base: here,
    loadStylesheet,
  });
  return compiler.build(candidates);
}

describe("contained content width utilities", () => {
  const candidates = contentWidthClassName("contained").split(" ");

  it("mirrors the wide container scale between the v4 @theme and the v3 preset", () => {
    const containers = preset.theme?.extend?.containers as Record<string, string>;
    for (const [tier, rem] of Object.entries(WIDE_CONTAINERS)) {
      expect(containers[tier]).toBe(`${Number.parseFloat(rem) * 16}px`);
    }
  });

  it("compiles every utility in the contained class to at least one rule", async () => {
    /* Compared against the no-candidate build, not against "", because the base
     * stylesheet (tokens.css, preflight) is emitted either way — an unknown theme
     * key compiles to nothing extra rather than to an error. */
    const baseline = await buildUtilities([]);
    for (const candidate of candidates) {
      const css = await buildUtilities([candidate]);
      expect(css, `${candidate} added no CSS of its own`).not.toBe(baseline);
    }
  });

  it("widens to the 8xl and 9xl container scale via app-content container queries", async () => {
    const css = await buildUtilities(candidates);

    for (const [tier, rem] of Object.entries(WIDE_CONTAINERS)) {
      expect(css).toMatch(new RegExp(`--container-${tier}:\\s*${rem}`));
      expect(css).toMatch(new RegExp(`max-width:\\s*var\\(--container-${tier}\\)`));
      /* Tailwind emits the modern `width >= 96rem` form; the `--minify` pass that
       * produces dist/styles.css rewrites it to `min-width:96rem`. Accept either
       * so this guards both the source and the shipped stylesheet. */
      expect(css).toMatch(
        new RegExp(`@container app-content \\((?:width\\s*>=\\s*${rem}|min-width:\\s*${rem})\\)`),
      );
    }
  });
});
