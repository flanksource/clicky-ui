import { afterEach, describe, expect, it, vi } from "vitest";
import type { FrameConfig } from "../../schema.ts";
import { baseStylesheets, loadLibraries, resolveStyleImport } from "./load.ts";
import { libraryKey } from "./cache.ts";

const origin = "https://runtime.example";
function configFor(options: { managed: string[]; page?: string }): FrameConfig {
  return {
    page: options.page ?? "report.tsx", profile: { managed: Object.fromEntries(options.managed.map((name) => [name, "*"])) },
    lock: {
      versions: { first: "1.0.0", second: "2.0.0", third: "3.0.0" },
      integrity: { "first@1.0.0/styles.js": "sha384-first", "second@2.0.0/styles.js": "sha384-second", "third@3.0.0/styles.js": "sha384-third" },
      map: { imports: { "first/page-styles": "/npm/first@1.0.0/styles.js", "second/page-styles": "/npm/second@2.0.0/styles.js", "third/page-styles": "/npm/third@3.0.0/styles.js", dependency: "/npm/dependency@1.0.0/index.js", "second/styles.css": "/npm/second@2.0.0/dist/styles.css", "first/styles.css": "/npm/first@1.0.0/dist/styles.css" }, scopes: { "/npm/first@1.0.0/": { dependency: "/npm/dependency@2.0.0/index.js" } } },
    },
  } as unknown as FrameConfig;
}
const config = configFor({ managed: ["first", "second"] });
const recipes: Record<string, object> = {
  first: { name: "first", layer: "components", base: ["first/styles.css"], entry: "", theme: "", runtimeDependencies: [] },
  second: { name: "second", layer: "components", base: ["second/styles.css"], entry: "", theme: "", runtimeDependencies: [], extends: ["first"] },
  third: { name: "third", layer: "components", base: ["first/styles.css"], entry: "", theme: "", runtimeDependencies: [] },
};
const importer = vi.fn(async (url: string) => ({ default: recipes[/\/npm\/(\w+)@/.exec(url)![1]!] }));
afterEach(() => { vi.unstubAllGlobals(); importer.mockClear(); });
function setLocation() { vi.stubGlobal("location", { origin, href: `${origin}/frame/report.tsx` }); }

describe("runtime tailwind recipe loading", () => {
  it("loads managed recipes and uses the owning closure", async () => {
    setLocation();
    const { libraries } = await loadLibraries({ config, importModule: importer });
    expect(libraries.map((item) => [item.recipe.name, item.name, item.version, item.integrity])).toEqual([["first", "first", "1.0.0", "sha384-first"], ["second", "second", "2.0.0", "sha384-second"]]);
    expect(resolveStyleImport({ id: "dependency", base: libraries[0]!.base, config })).toBe(`${origin}/npm/dependency@2.0.0/index.js?page=report.tsx`);
    expect(resolveStyleImport({ id: "./nested.css", base: libraries[1]!.base, config })).toBe(`${origin}/npm/second@2.0.0/nested.css?page=report.tsx`);
  });

  it("orders libraries by dependency then name whatever order the profile lists them in", async () => {
    setLocation();
    const orders = await Promise.all([["second", "third", "first"], ["third", "first", "second"], ["first", "second", "third"]].map(async (managed) => (await loadLibraries({ config: configFor({ managed }), importModule: importer })).libraries.map((item) => item.name)));
    expect(orders).toEqual(Array(3).fill(["first", "second", "third"]));
  });

  it("derives the same library key for two pages, though the recipe URLs name different pages", async () => {
    setLocation();
    const a = await loadLibraries({ config: configFor({ managed: ["first", "second"], page: "a.tsx" }), importModule: importer });
    const b = await loadLibraries({ config: configFor({ managed: ["second", "first"], page: "nested/b.tsx" }), importModule: importer });
    expect(a.libraries[0]!.id).not.toBe(b.libraries[0]!.id);
    expect(libraryKey({ libraries: a.libraries, runtimeVersion: "one" })).toBe(libraryKey({ libraries: b.libraries, runtimeVersion: "one" }));
  });

  it("lists every library's base stylesheet in library order through the package route, once each", async () => {
    setLocation();
    const { libraries } = await loadLibraries({ config: configFor({ managed: ["third", "second", "first"] }), importModule: importer });
    expect(baseStylesheets({ libraries, config })).toEqual([
      { url: `${origin}/npm/first@1.0.0/dist/styles.css?page=report.tsx`, layer: "components" },
      { url: `${origin}/npm/second@2.0.0/dist/styles.css?page=report.tsx`, layer: "components" },
    ]);
  });

  it("fails for a managed library with no locked version, an invalid recipe, or a base stylesheet outside the package route", async () => {
    setLocation();
    const unlocked = configFor({ managed: ["first"] }); delete unlocked.lock.versions["first"];
    await expect(loadLibraries({ config: unlocked, importModule: importer })).rejects.toThrow("first: managed library has no version in the page lock");
    await expect(loadLibraries({ config, importModule: async () => ({ default: { name: "first", layer: "components", stylesheets: {} } }) })).rejects.toThrow("first/page-styles: invalid recipe");
    const { libraries } = await loadLibraries({ config, importModule: importer });
    libraries[0]!.recipe = { ...libraries[0]!.recipe, base: ["https://other.example/styles.css"] };
    expect(() => baseStylesheets({ libraries, config })).toThrow("runtime package route");
  });

  it("fails for unmapped dependencies and external package routes", () => {
    setLocation();
    expect(() => resolveStyleImport({ id: "absent", base: location.href, config })).toThrow("unmapped page-style import absent");
    expect(() => resolveStyleImport({ id: "https://other.example/style.css", base: location.href, config })).toThrow("runtime package route");
  });
});
