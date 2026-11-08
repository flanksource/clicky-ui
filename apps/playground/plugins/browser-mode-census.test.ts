// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalogDiff, census, inspectPage, loadConfiguration, writeCatalog } from "../scripts/browser-mode-census";

let root: string;
function file(path: string, source: string): string {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, source);
  return target;
}
const classes = async () => (await census({ root })).pages[0]!.issues.map((issue) => issue.class);

beforeEach(() => {
  mkdirSync(resolve(".tmp/census"), { recursive: true });
  root = mkdtempSync(resolve(".tmp/census/project-"));
  mkdirSync(resolve(root, "src/pages"), { recursive: true });
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("browser mode compatibility census", () => {
  it("traces cycles and reexports, excluding unreachable support and erased type imports", async () => {
    file("src/pages/ready.tsx", `
      import type { PageMeta } from "../registry";
      import { type Other } from "missing-type-package";
      import "./_shared/one";
      // import "node:fs";
      const text = 'import "vitest"';
      export default function Ready() { return <div>{text}</div>; }
    `);
    file("src/pages/_shared/one.ts", 'export * from "./two";');
    file("src/pages/_shared/two.ts", 'export * from "./one";');
    file("src/pages/_unused/test-support.ts", 'import "node:fs"; import "vitest";');
    file("src/pages/ready.test.tsx", 'import "vitest";');
    file("src/pages/ready.stories.tsx", 'import "storybook";');
    const result = await census({ root });
    expect(result.pages).toMatchObject([{ slug: "ready", compatible: true, issues: [] }]);
    expect(result.pages[0]!.files).toHaveLength(3);
  });

  it("propagates Node and test imports only to their reachable page trees", async () => {
    file("src/pages/broken.tsx", 'export { default } from "./_shared/support";');
    file("src/pages/_shared/support.tsx", 'import "fs/promises"; import "@testing-library/react"; export default () => null;');
    file("src/pages/ready.tsx", "export default () => null;");
    const result = await census({ root });
    expect(result.pages.map(({ slug, compatible, issues }) => ({ slug, compatible, classes: issues.map((issue) => issue.class) }))).toEqual([
      { slug: "broken", compatible: false, classes: ["node-builtin", "test-only"] },
      { slug: "ready", compatible: true, classes: [] },
    ]);
    expect(result.summary.classes["node-builtin"]).toEqual({ pages: 1, incompatible: 1 });
  });

  it("uses literal dynamic imports and reports unresolvable dynamic expressions", async () => {
    file("src/pages/dynamic.tsx", 'const helper = import("./_shared/helper"); const other = import(name); export default () => helper;');
    file("src/pages/_shared/helper.ts", 'import "node:zlib";');
    expect(await classes()).toEqual(["dynamic-import", "node-builtin"]);
  });

  it("treats the local vocabulary root as page source while its pages still may not import the shell", async () => {
    const page = file("src/vocabularies/shapes/index.tsx", 'import { Page } from "../_VocabularyPage"; import "../../agent-runs/AgentRunsProvider"; export default Page;');
    file("src/vocabularies/_VocabularyPage.tsx", "export const Page = () => null;");
    file("src/agent-runs/AgentRunsProvider.tsx", "export const useAgentRuns = () => null;");
    const result = await inspectPage({ root, file: realpathSync(page), externalRoots: [realpathSync(resolve(root, "src"))] });
    expect(result.issues.map(issue => [issue.class, issue.specifier])).toEqual([["app-internal", "../../agent-runs/AgentRunsProvider"]]);
  });

  it("rejects shell imports and identifies aliased context hook calls without mistaking local hooks", async () => {
    file("src/pages/context.tsx", `
      import { useAgentRuns as useRuns } from "../agent-runs/AgentRunsProvider";
      import * as prompts from "../prompt-runs/PromptRunsProvider";
      function useReview() { return null; }
      export default function Page() { useRuns(); prompts.usePromptRuns(); return useReview(); }
    `);
    file("src/agent-runs/AgentRunsProvider.tsx", "export const useAgentRuns = () => null;");
    file("src/prompt-runs/PromptRunsProvider.tsx", "export const usePromptRuns = () => null;");
    expect(await classes()).toEqual(["app-internal", "app-internal", "shell-context", "shell-context"]);
  });

  it("accepts the allowed runtime module and reports packages absent from the library set", async () => {
    file("src/pages/imports.tsx", 'import "playground-runtime/review"; import "react"; import "@iconify-icons/ph/check";');
    expect(await classes()).toEqual(["external-package"]);
  });

  it("follows declared external roots and aliases, including their JSON and raw assets", async () => {
    file("src/pages/external.tsx", 'import "../../external/card"; import "@example/page";');
    const external = file("external/card.tsx", 'import "./data.json"; import "./art.svg?raw"; export default () => null;');
    file("external/data.json", '{"value":1}');
    file("external/art.svg", "<svg />");
    const aliased = file("aliased/page.tsx", 'import "node:path";');
    const result = await census({ root, externalRoots: [dirname(external)], aliases: { "@example/page": aliased } });
    expect(result.pages[0]!.issues.map((issue) => [issue.class, issue.blocking])).toEqual([
      ["sibling-checkout", false], ["unpublished-alias", false], ["json", false], ["raw-url", false], ["node-builtin", true],
    ]);
    expect(result.pages[0]!.files).toHaveLength(5);
  });

  it("reports undeclared roots, missing aliases and missing imports with reasons and fixes", async () => {
    file("src/pages/missing.tsx", 'import "../../outside/card"; import "@mc-oipa/unpublished"; import "./absent";');
    file("outside/card.tsx", "export default () => null;");
    expect(await classes()).toEqual(["sibling-checkout", "unpublished-alias", "unresolved-import"]);
    expect((await census({ root })).pages[0]!.issues.every((issue) => issue.blocking && issue.reason && issue.fix)).toBe(true);
  });

  it("parses import.meta features and same-origin requests without matching comments and ordinary text", async () => {
    file("src/pages/features.tsx", `
      // import.meta.glob("./ignored/*"); fetch("/__playground/ignored");
      const text = "import.meta.env.VITE_IGNORED";
      const files = import.meta.glob("./_assets/*.tsx");
      const env = import.meta.env.VITE_ENDPOINT;
      const here = import.meta.url;
      fetch("/__playground/comments");
      fetch(\`/oipa-api/items/\${id}\`);
      export default () => <div>{text}{env}{here}{files}</div>;
    `);
    expect(await classes()).toEqual(["import-meta-glob", "import-meta-env", "same-origin-api", "same-origin-api"]);
  });

  it("parses CSS imports and rejects @source outside declared roots with the CSS filename", async () => {
    file("src/pages/style.tsx", 'import "./_style/page.css";');
    file("src/pages/_style/page.css", '@import "./nested.css"; /* @source "../../ignored"; */ @source "../**/*.tsx";');
    file("src/pages/_style/nested.css", '@source "../../../shell/**/*.tsx";');
    expect(await classes()).toEqual(["css-source"]);
    expect((await census({ root })).pages[0]!.issues[0]).toMatchObject({ file: "src/pages/_style/nested.css", blocking: true });
  });

  it.each(['url("https://fonts.example/css2?family=Sans")', '"http://fonts.example/sans.css"', 'url("data:text/css,a{}")'])("leaves the browser-loaded CSS import %s out of the page graph", async (specifier) => {
    file("src/pages/style.tsx", 'import "./_style/page.css";');
    file("src/pages/_style/page.css", `@import ${specifier};`);
    expect((await census({ root })).pages[0]).toMatchObject({ compatible: true, issues: [] });
  });

  it("does not compile raw scripts or URL assets, and validates JSON as JSON", async () => {
    file("src/pages/assets.tsx", 'import "./_asset/source.ts?raw"; import "./_asset/icon.svg?url"; import "./_asset/bad.json";');
    file("src/pages/_asset/source.ts", 'import "node:fs";');
    file("src/pages/_asset/icon.svg", "<svg />");
    file("src/pages/_asset/bad.json", "broken json");
    expect(await classes()).toEqual(["raw-url", "raw-url", "json", "invalid-source"]);
  });

  it("fails on invalid configured roots instead of silently omitting them", async () => {
    await expect(census({ root, externalRoots: [resolve(root, "missing-root")] })).rejects.toThrow("external root");
  });

  it("never authorizes shell source through a broad external root", async () => {
    file("src/pages/shell.tsx", 'import "../design-system/card";');
    file("src/design-system/card.tsx", "export default () => null;");
    expect((await census({ root, externalRoots: [root] })).pages[0]!.issues.map((issue) => issue.class)).toEqual(["app-internal"]);
  });

  it("never authorizes shell source through a declared alias", async () => {
    file("src/pages/shell.tsx", 'import "@example/shell";');
    const shell = file("src/design-system/card.tsx", "export default () => null;");
    expect((await census({ root, aliases: { "@example/shell": shell } })).pages[0]!.issues.map((issue) => issue.class)).toEqual(["unpublished-alias", "app-internal"]);
  });

  it("distinguishes a page-owned review context from a shell context", async () => {
    file("src/pages/local.tsx", 'import { useReview } from "./_local/context"; export default () => useReview();');
    file("src/pages/_local/context.ts", "export const useReview = () => null;");
    expect(await classes()).toEqual([]);
  });

  it("finds same-origin endpoints constructed from constants and used by stream constructors", async () => {
    file("src/pages/api.tsx", 'const API = "/oipa-api"; const path = "/items"; fetch(`${API}${path}`); new EventSource("/__playground/changes");');
    expect(await classes()).toEqual(["same-origin-api", "same-origin-api"]);
  });

  it("traces MDX imports while ordinary Markdown code fences remain documentation", async () => {
    file("src/pages/guide.md", '# Guide\n```tsx\nimport "node:fs";\n```');
    file("src/pages/widget.mdx", 'import "./_shared/helper";\n\n# Widget\n');
    file("src/pages/_shared/helper.ts", 'import "node:fs";');
    expect((await census({ root })).pages.map(({ slug, compatible }) => ({ slug, compatible }))).toEqual([{ slug: "guide", compatible: true }, { slug: "widget", compatible: false }]);
  });

  it("checks both generated files in memory, prints a diff and leaves stale content untouched", async () => {
    file("src/pages/ready.tsx", "export default () => null;");
    const result = await census({ root });
    expect(writeCatalog({ root, result, check: false })).toBe(true);
    const markdown = readFileSync(resolve(root, "docs/browser-mode-compatibility.md"), "utf8");
    expect(markdown).toContain("import.meta.glob");
    expect(markdown).toContain("@mc-oipa");
    expect(markdown).toContain("node:");
    expect(writeCatalog({ root, result, check: true })).toBe(true);
    expect(JSON.parse(readFileSync(resolve(root, "docs/browser-mode-compatibility.json"), "utf8"))).toEqual(result);
    file("docs/browser-mode-compatibility.json", "stale\n");
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    try {
      expect(writeCatalog({ root, result, check: true })).toBe(false);
      expect(stderr).toHaveBeenCalledWith(expect.stringContaining("-stale"));
      expect(readFileSync(resolve(root, "docs/browser-mode-compatibility.json"), "utf8")).toBe("stale\n");
    } finally { stderr.mockRestore(); }
    expect(catalogDiff({ path: "catalog", actual: "a\nb\nc\n", expected: "a\nx\nc\n" })).toBe("--- catalog\n+++ catalog (regenerated)\n@@ -2,1 +2,1 @@\n-b\n+x");
  });

  it("traces glob matches with exclusions and keeps raw glob assets out of the code graph", async () => {
    file("src/pages/globs.tsx", 'const pages = import.meta.glob(["./_glob/*.ts", "!./_glob/excluded.ts"]); const raw = import.meta.glob("./_raw/*.ts", { query: "?raw", eager: true });');
    file("src/pages/_glob/helper.ts", 'import "node:fs";');
    file("src/pages/_glob/excluded.ts", 'import "vitest";');
    file("src/pages/_raw/source.ts", 'import "node:zlib";');
    const result = await census({ root });
    expect(result.pages[0]!.issues.map((issue) => issue.class)).toEqual(["raw-url", "import-meta-glob", "import-meta-glob", "node-builtin"]);
    expect(result.pages[0]!.files).toEqual(["src/pages/_glob/helper.ts", "src/pages/_raw/source.ts", "src/pages/globs.tsx"]);
  });

  it("loads the library declarations without depending on generated dist files", () => {
    file("packages/ui/package.json", JSON.stringify({ exports: { ".": { import: "./dist/index.js" }, "./icons": { import: "./dist/icons.js" }, "./runtime/*": "./dist/runtime/*" } }));
    file("packages/react-grab/package.json", JSON.stringify({ exports: { ".": "./dist/index.js" } }));
    file("apps/playground/node_modules/@flanksource/facet/package.json", JSON.stringify({ exports: { ".": { import: "./dist/index.js" }, "./styles.css": "./dist/styles.css", "./types": { types: "./dist/types.d.ts" } } }));
    const options = loadConfiguration(resolve(root, "apps/playground"));
    expect(options.libraryImports).toEqual(expect.arrayContaining(["react", "@tanstack/react-query", "@flanksource/clicky-ui/icons", "@flanksource/facet/styles.css"]));
    expect(options.libraryImports).not.toContain("@flanksource/facet/types");
    expect(options.libraryImports).not.toContain("@flanksource/clicky-ui/runtime/*");
  });
});
