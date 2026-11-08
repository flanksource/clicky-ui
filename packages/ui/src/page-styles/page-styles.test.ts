import { describe, expect, it } from "vitest";
import manifest from "../../package.json";
import pageStyles, { pageStyles as named } from "../page-styles";

describe("page-styles recipe", () => {
  it("lists the published stylesheet as base and keeps only compiler inputs in the entry", () => {
    expect(pageStyles).toBe(named);
    expect(pageStyles).toMatchObject({ name: "@flanksource/clicky-ui", layer: "components", base: ["@flanksource/clicky-ui/styles.css"] });
    expect(pageStyles).not.toHaveProperty("stylesheets");
    expect(pageStyles.entry.split("\n")).toEqual([
      '@import "tailwindcss/theme.css" layer(theme);',
      '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
      pageStyles.theme,
    ]);
    expect(pageStyles.theme).toBe('@config "@flanksource/clicky-ui/tailwind-preset";');
    expect(pageStyles.runtimeDependencies).toEqual([
      "@flanksource/clicky-ui/styles.css",
      "@flanksource/clicky-ui/tailwind-preset",
      "tailwindcss/theme.css",
      "tailwindcss/preflight.css",
      "tailwindcss/utilities.css",
    ]);
  });

  it("never imports a base stylesheet into the compiler entry", () => {
    for (const specifier of pageStyles.base) expect(pageStyles.entry).not.toContain(specifier);
  });

  it("publishes the same ESM, CommonJS and declaration paths as other subpaths", () => {
    expect(manifest.exports["./page-styles"]).toEqual({
      types: "./dist/page-styles.d.ts", import: "./dist/page-styles.js", require: "./dist/page-styles.cjs",
    });
  });
});
