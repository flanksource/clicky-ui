import { describe, expect, it } from "vitest";
import { convertedFile, converterUrl, crawlConvertedPackage, rewriteConvertedImports } from "./converted.ts";

describe("converter module paths", () => {
  it("maps scoped package entry and internal files to exact converter URLs", () => {
    const entry = convertedFile("esm/@acme/clipboard@1.2.3/__entry.mjs");
    expect(converterUrl({ origin: "https://converter.example", ...entry })).toBe("https://converter.example/*@acme/clipboard@1.2.3?dev&target=es2022");
    expect(converterUrl({ origin: "https://converter.example", ...convertedFile("esm/@acme/clipboard@1.2.3/es2022/clipboard.development.mjs") })).toBe("https://converter.example/*@acme/clipboard@1.2.3/es2022/clipboard.development.mjs");
  });
  it.each(["esm/acme@1/../escape.mjs", "esm/acme@1//module.mjs", "esm/acme@1/file.mjs?x=1", "esm/acme@1/file.mjs#x", "esm/acme@1/file\\other.mjs"])("rejects malformed file %s", (path) => expect(() => convertedFile(path)).toThrow());
  it.each([0x00, 0x1f, 0x20])("rejects converter paths containing ASCII code %i", (code) => {
    expect(() => convertedFile(`esm/acme@1/file${String.fromCharCode(code)}.mjs`)).toThrow(/invalid converted package file/);
  });
  it("accepts the first printable character after the forbidden whitespace range", () => {
    expect(convertedFile("esm/acme@1/file!.mjs")).toEqual({ root: "acme@1", path: "file!.mjs" });
  });
  it("rewrites static and dynamic internal imports while preserving bare imports and matching string content", async () => {
    const root = "@acme/clipboard@1.2.3";
    const code = `import React from 'react'; export * from '/*${root}/es2022/clipboard.mjs'; export const lazy = () => import('./lazy.mjs'); export const text = '/*${root}/es2022/clipboard.mjs';`;
    expect(await rewriteConvertedImports({ code, root, path: "es2022/index.mjs" })).toBe(`import React from 'react'; export * from '/esm/${root}/es2022/clipboard.mjs'; export const lazy = () => import("/esm/${root}/es2022/lazy.mjs"); export const text = '/*${root}/es2022/clipboard.mjs';`);
  });
  it.each(["/node/fs.mjs", "node:fs", "/*acme@2/es2022/a.mjs", "../../other.mjs", "//foreign.example/a.mjs"])("rejects unsafe internal import %s", async (specifier) => {
    await expect(rewriteConvertedImports({ code: `import ${JSON.stringify(specifier)};`, root: "acme@1", path: "es2022/a.mjs" })).rejects.toThrow(/acme@1/);
  });
  it("fails on a converter HTTP error with the package and requested file", async () => {
    await expect(crawlConvertedPackage({ origin: "https://converter.example", root: "acme@1", fetcher: async () => new Response("failure", { status: 503 }) })).rejects.toThrow(/acme@1.*HTTP 503.*dev&target=es2022/);
  });
  it("rejects nonliteral dynamic imports instead of leaving an unpinned dependency", async () => {
    await expect(crawlConvertedPackage({ origin: "https://converter.example", root: "acme@1", fetcher: async () => new Response("export const load = path => import(path);") })).rejects.toThrow(/acme@1.*non-literal dynamic import/);
  });
});
