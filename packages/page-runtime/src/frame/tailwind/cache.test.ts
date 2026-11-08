import { describe, expect, it } from "vitest";
import { cssCacheKey, libraryKey, tailwindCssUrl } from "./cache.ts";
import type { LibraryStyles } from "./recipe.ts";

const origin = "https://runtime.example";
function library(options: { name?: string; version?: string; integrity?: string | undefined; page?: string; entry?: string; transform?: boolean } = {}): LibraryStyles {
  const name = options.name ?? "first";
  return {
    id: `${origin}/npm/${name}@1/page-styles.js?page=${options.page ?? "a.tsx"}`, name, version: options.version ?? "1.0.0", base: `${origin}/npm/${name}@1/`,
    ...(options.integrity === undefined && "integrity" in options ? {} : { integrity: options.integrity ?? "sha384-one" }),
    recipe: { name, layer: "components", base: [`${name}/styles.css`], entry: options.entry ?? "", theme: "", runtimeDependencies: [], ...(options.transform ? { transform: (css: string) => css } : {}) },
  };
}
const key = (libraries: LibraryStyles[], runtimeVersion = "one") => libraryKey({ libraries, runtimeVersion });

describe("runtime tailwind cache", () => {
  it("canonicalizes candidate order and duplicates", async () => {
    const first = await cssCacheKey({ libraryKey: "libraries", candidates: ["block", "p-4", "block"] });
    const reordered = await cssCacheKey({ libraryKey: "libraries", candidates: ["p-4", "block"] });
    expect(first).toBe(reordered);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(tailwindCssUrl({ key: first, origin })).toBe(`${origin}/__runtime/tailwind/${first}.css`);
  });

  it("invalidates for a different library set, runtime version or candidate set", async () => {
    const keys = await Promise.all([
      { libraryKey: key([]), candidates: ["block"] },
      { libraryKey: key([], "two"), candidates: ["block"] },
      { libraryKey: key([]), candidates: ["flex"] },
      { libraryKey: key([library()]), candidates: ["block"] },
    ].map((options) => cssCacheKey(options)));
    expect(new Set(keys).size).toBe(4);
  });

  it("gives two pages with the same libraries and candidates the same cache key", async () => {
    const a = key([library({ page: "a.tsx" })]);
    const b = key([library({ page: "nested/b.tsx" })]);
    expect(a).toBe(b);
    expect(await cssCacheKey({ libraryKey: a, candidates: ["block"] })).toBe(await cssCacheKey({ libraryKey: b, candidates: ["block"] }));
  });

  it("keys a library by name, version and recipe-module integrity, not by recipe contents", () => {
    const original = key([library()]);
    expect(key([library({ version: "1.0.1" })])).not.toBe(original);
    expect(key([library({ integrity: "sha384-two" })])).not.toBe(original);
    expect(key([library({ name: "second" })])).not.toBe(original);
    expect(key([library({ entry: "@theme { --color-x: red; }", transform: true })])).toBe(original);
  });

  it("fails for a library whose recipe module has no integrity", () => {
    expect(() => key([library({ integrity: undefined })])).toThrow("first: recipe module has no lock integrity");
  });
});
