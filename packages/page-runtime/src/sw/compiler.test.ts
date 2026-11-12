import { describe, expect, it } from "vitest";
import type { PageLock } from "../schema.ts";
import { BASE_PLUGINS, compilePage, rewriteImports } from "./compiler.ts";
import { verifyIntegrity } from "./router.ts";

const LOCK: PageLock = { lock: 2, packageOrigin: "https://packages.example", page: "report.tsx", versions: { "@acme/ui": "1.0.0" }, map: { imports: { "@acme/ui": "/npm/@acme/ui@1.0.0/index.js" }, scopes: {} }, integrity: { "@acme/ui@1.0.0/index.js": "sha384-test", "@acme/ui@1.0.0/util.js": "sha384-test" }, remaps: {}, barrels: { modules: [], barrels: {} } };
const plugins = BASE_PLUGINS;

describe("compiled source modules", () => {
  it("propagates source revisions through local imports while retaining shared library module identities", async () => {
    const result = await compilePage({ path: "/src/report.tsx?revision=next", code: 'import Component from "./component"; import text from "./note.txt?raw"; import UI from "@acme/ui"; export { Component, text, UI };', lock: LOCK, sources: ["component.tsx", "note.txt"], plugins });
    expect(result.code).toContain('"/src/component.tsx?revision=next"');
    expect(result.code).toContain('"/src/note.txt?raw=&revision=next"');
    expect(result.code).toContain('"/npm/@acme/ui@1.0.0/index.js"');
  });
  it("compiles Markdown pages and resolves extensionless Markdown source imports", async () => {
    const lock = { ...LOCK, page: "report.md" };
    const result = await compilePage({ path: "/src/report.md", code: "# Revenue", lock, sources: ["report.md"], plugins });
    expect(result.code).toContain('fileName: "report.md"');
    expect(await rewriteImports({ code: 'export { default } from "./report";', path: "/src/index.ts", lock, sources: ["report.md"] })).toBe('export { default } from "/src/report.md";');
  });
  it.each([
    ["/src/data.json", '{"total":3}', 'export default {"total":3};'],
    ["/src/text.txt?raw", "raw text", 'export default "raw text";'],
    ["/src/image.svg?url", "svg", 'export default "/src/image.svg";'],
  ])("compiles %s into a module", async (path, code, expected) => {
    expect((await compilePage({ path, code, lock: LOCK, sources: [], plugins })).code).toBe(expected);
  });
  it("canonicalizes page and package imports including raw suffixes", async () => {
    expect(await rewriteImports({ code: 'import {x} from "./component"; import text from "./note.txt?raw";', path: "/src/report.tsx", lock: LOCK, sources: ["component.tsx", "note.txt"] })).toBe('import {x} from "/src/component.tsx"; import text from "/src/note.txt?raw";');
    expect(await rewriteImports({ code: 'export {x} from "./util";', path: "/npm/@acme/ui@1.0.0/index.js", lock: LOCK, sources: [] })).toBe('export {x} from "/npm/@acme/ui@1.0.0/util.js";');
  });
  it("finishes extensionless deep imports of a package without exports through its prefix mapping", async () => {
    const icons = { ...LOCK, map: { imports: { ...LOCK.map.imports, "@acme/icons/": "/npm/@acme/icons@1.0.0/" }, scopes: {} }, integrity: { ...LOCK.integrity, "@acme/icons@1.0.0/toggle-left.js": "sha384-icon" } };
    expect(await rewriteImports({ code: 'import icon from "@acme/icons/toggle-left";', path: "/src/report.tsx", lock: icons, sources: [] })).toBe('import icon from "/npm/@acme/icons@1.0.0/toggle-left.js";');
  });
  it("reports forbidden imports with source line and allowed package names", async () => {
    await expect(rewriteImports({ code: '\nimport x from "forbidden";', path: "/src/report.tsx", lock: LOCK, sources: [] })).rejects.toMatchObject({ detail: { phase: "link", file: "/src/report.tsx", line: 2, message: "/src/report.tsx:2: import forbidden is outside the library set; allowed packages: @acme/ui" } });
  });
  it("keeps CSS imports as loading links so imported stylesheets participate in readiness", async () => {
    const result = await compilePage({ path: "/src/page.css?module", code: '@import url("./font.css");', lock: LOCK, sources: [], plugins });
    expect(result.code).toContain('link.rel = "stylesheet"');
    expect(result.code).toContain('link.dataset.pageRuntime = "loading"');
  });
  it("extracts source candidates from helper modules", async () => {
    const result = await compilePage({ path: "/src/helper.ts", code: 'export const classes = "grid grid-cols-3 hover:bg-red-500";', lock: LOCK, sources: [], plugins });
    expect(result.candidates).toEqual(expect.arrayContaining(["grid", "grid-cols-3", "hover:bg-red-500"]));
  });
  it("defines development in served package files even when they branch on production", async () => {
    const result = await compilePage({ path: "/npm/@acme/ui@1.0.0/index.js", code: 'export const environment = process.env.NODE_ENV; export const optimized = process.env.NODE_ENV === "production";', lock: LOCK, sources: [], plugins });
    expect(result.code).toBe('export const environment = "development"; export const optimized = "development" === "production";');
    expect(result.code).not.toMatch(/NODE_ENV\s*===?\s*["']production["']/);
  });
  it("rejects bad integrity before transforming the response", async () => {
    await expect(verifyIntegrity(new TextEncoder().encode("export const x=1;"), "sha384-corrupt", "@acme/ui@1/index.js")).rejects.toMatchObject({ detail: { phase: "fetch", file: "@acme/ui@1/index.js" } });
  });
});
