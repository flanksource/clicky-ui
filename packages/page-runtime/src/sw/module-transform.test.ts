import { init } from "es-module-lexer";
import { beforeAll, describe, expect, it } from "vitest";
import { defineNodeEnv, parseClause, transformModule, type BarrelIndex, type ModuleTransformOptions } from "./module-transform.ts";

const PACKAGE = "@acme/ui@1.0.0";
const BARREL = `${PACKAGE}/dist/index.js`;
const TABLE = `${PACKAGE}/dist/table.js`;
const BADGE = `${PACKAGE}/dist/badge.js`;
const UTIL = `${PACKAGE}/dist/util.js`;
const LAZY_INDEX = `${PACKAGE}/dist/lazy/index.js`;
const PACKAGE_MODULE = `/npm/${PACKAGE}/dist/feature.js`;
const PAGE_MODULE = "/page/site/report.tsx";

// DataTable keeps its name in table.js, Badge is badge.js's default export and the barrel's default is table.js's Table.
const INDEX: BarrelIndex = { modules: [TABLE, BADGE], barrels: { [BARREL]: { DataTable: 0, Badge: [1, "default"], default: [0, "Table"] } } };

function options(url: string): ModuleTransformOptions {
  const files = new Set([BARREL, TABLE, BADGE, UTIL, LAZY_INDEX]);
  return {
    url,
    known: (packageUrl) => files.has(packageUrl),
    resolveBare: (specifier) => (specifier === "@acme/ui" ? `/npm/${BARREL}` : null),
    barrels: INDEX,
  };
}

beforeAll(async () => {
  await init();
});

describe("parseClause", () => {
  it.each([
    ["{ a, b as c }", { bindings: [{ imported: "a", local: "a" }, { imported: "b", local: "c" }], namespace: null }],
    ["d, { e }", { bindings: [{ imported: "default", local: "d" }, { imported: "e", local: "e" }], namespace: null }],
    ["* as all", { bindings: [], namespace: "all" }],
    ["d, * as all", { bindings: [{ imported: "default", local: "d" }], namespace: "all" }],
    ["{default as x,}", { bindings: [{ imported: "default", local: "x" }], namespace: null }],
    ["{ 'a-b' as c }", { bindings: [{ imported: "a-b", local: "c" }], namespace: null }],
  ])("parses %s", (text, expected) => {
    expect(parseClause(text)).toEqual(expected);
  });

  it.each(["/* note */ { a }", "{ a b }", "{ a } extra"])("refuses %s", (text) => {
    expect(parseClause(text)).toBeNull();
  });
});

describe("transformModule", () => {
  it("moves named and default imports to their defining modules and keeps unindexed names on the barrel", () => {
    const code = 'import Main, { DataTable, Badge as Pill, Unknown } from "@acme/ui";\nrender(Main, DataTable, Pill, Unknown);\n';
    const result = transformModule(code, options(PAGE_MODULE));
    expect(result.code).toBe(
      [
        `import { Unknown } from "@acme/ui"; import { Table as Main, DataTable } from "/npm/${TABLE}"; import { default as Pill } from "/npm/${BADGE}";;`,
        "render(Main, DataTable, Pill, Unknown);",
        "",
      ].join("\n"),
    );
    expect(result.stats).toMatchObject({ statements: 1, rewritten: 3, kept: 1 });
  });

  it("rewrites minified imports and export-from statements", () => {
    const code = 'import{DataTable as d}from"@acme/ui";export{Badge as Pill,DataTable}from"@acme/ui";use(d);';
    expect(transformModule(code, options(PAGE_MODULE)).code).toBe(
      `import { DataTable as d } from "/npm/${TABLE}";;export { default as Pill } from "/npm/${BADGE}"; export { DataTable } from "/npm/${TABLE}";;use(d);`,
    );
  });

  it("leaves namespace imports, star re-exports, side-effect imports, attributes and commented clauses on the barrel", () => {
    const code = [
      'import * as all from "@acme/ui";',
      'export * from "@acme/ui";',
      'import "@acme/ui";',
      'import data from "@acme/ui" with { type: "json" };',
      'import { /* table */ DataTable } from "@acme/ui";',
      "",
    ].join("\n");
    const result = transformModule(code, options(PAGE_MODULE));
    expect(result.code).toBe(code);
    expect(result.stats).toMatchObject({ statements: 0, whole: 2, unparsed: 1 });
  });

  it("rewrites relative imports in package files to canonical URLs, including a relative import of a barrel", () => {
    const code = 'import { helper } from "./util";\nimport { DataTable } from "./index";\nconst lazy = () => import("./lazy");\n';
    const result = transformModule(code, options(PACKAGE_MODULE));
    expect(result.code).toBe(
      [
        `import { helper } from "/npm/${UTIL}";`,
        `import { DataTable } from "/npm/${TABLE}";;`,
        `const lazy = () => import("/npm/${LAZY_INDEX}");`,
        "",
      ].join("\n"),
    );
    expect(result.stats).toMatchObject({ canonical: 2, statements: 1 });
  });

  it("does not canonicalize relative imports in page files", () => {
    const code = 'import { Section } from "./Section";\n';
    expect(transformModule(code, options(PAGE_MODULE)).code).toBe(code);
  });
});

describe("defineNodeEnv", () => {
  it("replaces references in code and inside template substitutions only", () => {
    const code = [
      'const text = "process.env.NODE_ENV"; // process.env.NODE_ENV',
      "/* process.env.NODE_ENV */ const shown = `process.env.NODE_ENV ${process.env.NODE_ENV}`;",
      "const pattern = /process.env.NODE_ENV/; const member = config.process.env.NODE_ENV;",
      'if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") warn();',
      "",
    ].join("\n");
    expect(defineNodeEnv(code)).toEqual({
      code: [
        'const text = "process.env.NODE_ENV"; // process.env.NODE_ENV',
        '/* process.env.NODE_ENV */ const shown = `process.env.NODE_ENV ${"development"}`;',
        "const pattern = /process.env.NODE_ENV/; const member = config.process.env.NODE_ENV;",
        'if (typeof process !== "undefined" && "development" !== "production") warn();',
        "",
      ].join("\n"),
      replaced: 2,
    });
  });

  it("tells a division from a regular expression that contains a quote", () => {
    const code = 'const half = total / 2; const quote = /"/g; const nested = `a${`b${process.env.NODE_ENV}`}`;';
    expect(defineNodeEnv(code)).toEqual({
      code: 'const half = total / 2; const quote = /"/g; const nested = `a${`b${"development"}`}`;',
      replaced: 1,
    });
  });
});
