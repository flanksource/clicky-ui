import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { compileLibraries, orderLibraries, transformCss, validateRecipe, type LibraryStyles, type PageStylesRecipe } from "./recipe.ts";
import { cascadeOrder } from '../../styles.ts';
import { loadTailwind } from "./runtime.ts";
import clicky from "../../../../ui/src/page-styles.ts";
import preset from "../../../../ui/src/tailwind-preset.ts";

const require = createRequire(import.meta.url);
const loaders = {
  loadStylesheet: async (id: string, base: string) => ({ path: id, base, content: await readFile(require.resolve(id), "utf8") }),
  loadModule: async (id: string, base: string) => ({ path: id, base, module: require(id) }),
};
function library(name: string, css: string, recipe: Partial<PageStylesRecipe> = {}): LibraryStyles {
  return { id: `https://runtime.example/npm/${name}@1.0.0/page-styles.js?page=a.tsx`, name, version: "1.0.0", integrity: `sha384-${name}`, base: `https://runtime.example/npm/${name}@1.0.0/`, recipe: { name, layer: "components", base: [`${name}/styles.css`], runtimeDependencies: [], entry: `${css}\n@import "tailwindcss/utilities.css" layer(utilities);`, theme: "", ...recipe } };
}
const clickyLoaders = {
  loadStylesheet: loaders.loadStylesheet,
  loadModule: async (id: string, base: string) => {
    if (id !== "@flanksource/clicky-ui/tailwind-preset") throw new Error(`unexpected config ${id}`);
    return { path: id, base, module: preset };
  },
};
const clickyLibrary = (): LibraryStyles => ({ id: "clicky", name: clicky.name, version: "1.0.0", integrity: "sha384-clicky", base: "https://runtime.example/npm/clicky/", recipe: clicky });

describe("runtime tailwind recipes", () => {
  it("compiles Clicky's preset into density, color and breakpoint utilities without any base, safelist or preflight rules", async () => {
    const compiler = await compileLibraries({ libraries: [clickyLibrary()], loaders: clickyLoaders });
    const css = compiler.build(["bg-primary", "p-density-4", "3xl:block", "density-compact:block"]);
    expect(css).toContain("var(--primary)");
    expect(css).toContain("calc(var(--spacing-unit) * 4)");
    expect(css).toContain("1920px");
    expect(css).toContain('[data-density="compact"]');
    expect(css).not.toMatch(/\.bg-red-500|box-sizing|@layer base/);
    expect(Buffer.byteLength(css)).toBeLessThan(20_000);
  });

  it("compiles once for a library set and recompiles for a new runtime version", async () => {
    const loadStylesheet = vi.fn(loaders.loadStylesheet);
    const options = { libraries: [library("memoized", "")], loaders: { ...loaders, loadStylesheet }, runtimeVersion: "one" };
    const first = await loadTailwind(options);
    expect(await loadTailwind(options)).toBe(first);
    expect(loadStylesheet).toHaveBeenCalledTimes(1);
    expect(await loadTailwind({ ...options, runtimeVersion: "two" })).not.toBe(first);
    expect(loadStylesheet).toHaveBeenCalledTimes(2);
  });

  it("shares one compiler between pages that load the same library versions", async () => {
    const loadStylesheet = vi.fn(loaders.loadStylesheet);
    const options = { loaders: { ...loaders, loadStylesheet }, runtimeVersion: "shared" };
    const first = await loadTailwind({ ...options, libraries: [library("shared", "")] });
    const second = await loadTailwind({ ...options, libraries: [{ ...library("shared", ""), id: "https://runtime.example/npm/shared@1.0.0/page-styles.js?page=b.tsx" }] });
    expect(second).toBe(first);
  });

  it("places layers first and isolates inline entries in library order", async () => {
    const libraries = [library("first", "@layer components { .first { color: red; } }"), library("second", "@layer components { .second { color: blue; } }")];
    const compiler = await compileLibraries({ libraries, loaders });
    const css = compiler.build(["block", "p-[13px]"]);
    expect(css).toContain(cascadeOrder(libraries.map(library => library.recipe.layer)));
    expect(css.indexOf(".first")).toBeLessThan(css.indexOf(".second"));
    expect(css).toContain("display: block");
    expect(css).toContain("padding: 13px");
  });

  it("merges parent compiler entries before derived entries in their own resolution contexts", async () => {
    const libraries = [library("base-lib", "@layer components { .base-lib { color: red; } }"), library("derived", "@layer components { .derived { color: blue; } }", { extends: ["base-lib"] })];
    const css = (await compileLibraries({ libraries, loaders })).build(["block"]);
    expect(css).toContain(".derived");
    expect(css.indexOf('.base-lib')).toBeLessThan(css.indexOf('.derived'));
  });

  it("applies transforms synchronously in library order", () => {
    const libraries = [library("first", ""), library("second", "")];
    libraries[0]!.recipe.transform = (css) => `${css}/* first */`;
    libraries[1]!.recipe.transform = (css) => `${css}/* second */`;
    expect(transformCss({ css: ".input{}", libraries })).toBe(".input{}/* first *//* second */");
  });

  it("fails when an imported stylesheet cannot be loaded", async () => {
    const loadStylesheet = vi.fn().mockRejectedValue(new Error("missing stylesheet"));
    const item = library("broken", ""); item.recipe.entry = '@import "missing.css";';
    await expect(compileLibraries({ libraries: [item], loaders: { ...loaders, loadStylesheet } })).rejects.toThrow("missing stylesheet");
  });
});

describe("library order", () => {
  const set = () => [library("facet", "", { extends: ["clicky"] }), library("zeta", ""), library("clicky", ""), library("alpha", "")];
  it("puts an extended library before its extender and sorts ties by name, whatever the input order", () => {
    const expected = ["alpha", "clicky", "facet", "zeta"];
    const forward = set();
    for (const input of [forward, [...forward].reverse(), [forward[2]!, forward[0]!, forward[3]!, forward[1]!]]) expect(orderLibraries(input).map((item) => item.name)).toEqual(expected);
  });
  it("orders a chain by dependency before name", () => {
    const chain = [library("a-top", "", { extends: ["b-mid"] }), library("b-mid", "", { extends: ["c-root"] }), library("c-root", "")];
    expect(orderLibraries(chain).map((item) => item.name)).toEqual(["c-root", "b-mid", "a-top"]);
  });
  it("fails for a cycle and for an extended library that is not managed", () => {
    expect(() => orderLibraries([library("one", "", { extends: ["two"] }), library("two", "", { extends: ["one"] })])).toThrow("cycle: one, two");
    expect(() => orderLibraries([library("one", "", { extends: ["absent"] })])).toThrow("one/page-styles: extends absent");
  });
});

describe("recipe validation", () => {
  const valid = { name: "first", layer: "components", base: ["first/styles.css"], entry: '@config "first/preset";', theme: "", runtimeDependencies: [] };
  it("accepts a recipe with a base list and a compiler-only entry", () => {
    expect(validateRecipe(valid, "first")).toBe(valid);
  });
  it.each([
    null, {}, { name: "other" },
    { ...valid, base: undefined }, { ...valid, base: [] }, { ...valid, base: "first/styles.css" }, { ...valid, base: [1] },
    { ...valid, stylesheets: {}, base: undefined }, { ...valid, runtimeDependencies: undefined }, { ...valid, extends: "other" },
  ])("rejects malformed recipes: %j", (value) => {
    expect(() => validateRecipe(value, "first")).toThrow("first/page-styles");
  });
  it("rejects an entry that imports its own base stylesheet", () => {
    expect(() => validateRecipe({ ...valid, entry: '@import "first/styles.css";' }, "first")).toThrow("entry must not import the base stylesheet first/styles.css");
  });
});
