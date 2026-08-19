import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import preset from "../tailwind-preset";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

/* Placeholders mean ABSENCE; helper text means content. They shared
 * --muted-foreground until #666666 placeholders started reading as filled
 * values in forms. These are the two brand values that must stay apart. */
const PLACEHOLDER = "#9ca3af"; /* --fs-fg-subtle, light */
const MUTED = "#666666"; /* --fs-fg-muted, light */

async function loadStylesheet(id: string, base: string) {
  const path = id.startsWith(".")
    ? resolve(base, id)
    : require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id);
  return { path, base: dirname(path), content: readFileSync(path, "utf8") };
}

/* fs-tokens.css is imported too, unlike the content-width harness: the brand
 * values these assertions pin live there, and tokens.css only aliases them. */
async function buildUtilities(candidates: string[]) {
  const compiler = await compile(
    '@import "tailwindcss";\n@import "./fs-tokens.css";\n@import "./tokens.css";',
    { base: here, loadStylesheet },
  );
  return compiler.build(candidates);
}

describe("placeholder token", () => {
  it("compiles text-placeholder to a real utility", async () => {
    const baseline = await buildUtilities([]);
    const css = await buildUtilities(["text-placeholder"]);
    expect(css, "text-placeholder added no CSS of its own").not.toBe(baseline);
    /* Tailwind dereferences the @theme key, emitting the alias it points at
     * rather than --color-placeholder itself. */
    expect(css).toMatch(/\.text-placeholder\s*\{\s*color:\s*var\(--placeholder\)/);
  });

  it("resolves the placeholder chain to the brand's subtle colour", async () => {
    const css = await buildUtilities(["text-placeholder"]);
    expect(css).toMatch(/--placeholder:\s*var\(--fs-fg-subtle\)/);
    expect(css).toMatch(new RegExp(`--fs-fg-subtle:\\s*${PLACEHOLDER}`));
  });

  /* The regression guard for the other half of the change: helper text, captions
   * and icons all ride --muted-foreground, and repointing it would wash out every
   * secondary string in every app rather than just the placeholders. */
  it("leaves muted-foreground on its own darker value", async () => {
    const css = await buildUtilities(["text-muted-foreground"]);
    expect(css).toMatch(/--muted-foreground:\s*var\(--fs-fg-muted\)/);
    expect(css).toMatch(new RegExp(`--fs-fg-muted:\\s*${MUTED}`));
    expect(PLACEHOLDER).not.toBe(MUTED);
  });

  it("mirrors the token into the v3 preset for tailwind-3 consumers", () => {
    const colors = preset.theme?.extend?.colors as Record<string, unknown>;
    expect(colors.placeholder).toBe("var(--placeholder)");
  });
});

/* The default-border shim lived in clicky-tokens, a layer declared AFTER
 * Tailwind's utilities. Cascade layers beat specificity, so a bare `*` rule
 * there silently won over every border-colour utility — border-destructive on
 * an invalid field rendered as an ordinary border in every consuming app. */
describe("default border shim", () => {
  /* Textual position is irrelevant here — cascade layers rank by DECLARATION
   * order, so the only thing that matters is which layer the rule lands in.
   * `base` is declared before `utilities`; `clicky-tokens`, where this used to
   * live, is declared after it. */
  it("sits in a layer that border-colour utilities can override", () => {
    const source = readFileSync(resolve(here, "tokens.css"), "utf8");

    const shim = source.indexOf("border-color: var(--border)");
    expect(shim, "the default-border shim disappeared").toBeGreaterThan(-1);

    // Layer blocks are written at column 0 and never nested, so the enclosing
    // layer is simply the last one opened before the rule.
    const opened = [...source.slice(0, shim).matchAll(/^@layer ([a-z-]+)\s*\{/gm)];
    expect(opened.at(-1)?.[1], "the shim must not outrank the utilities layer").toBe(
      "base",
    );
  });

  it("still defaults an uncoloured border", async () => {
    const css = await buildUtilities([]);
    expect(css).toMatch(/\*\s*\{\s*border-color:\s*var\(--border\)/);
  });
});
