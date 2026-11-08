// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { directoryVocabulary } from "./vocabulary-directories";
import { sourceFile, sourceRoots, sourceUrl } from "./source-roots";
import { readBrowserProject, frameSource, withFrameProviders } from "./production-project";
import { extractPageGuidance, memoryGuidanceHost } from "./markdown-extractor";
import { productionBrowserRoutes } from "./production-browser-routes";
import { productionMiddleware } from "./production-middleware";

const directories: string[] = [];
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
const item = { type: "shape", id: "circle", label: "Circle", description: "A round shape", references: ["shapes.md"], variant: "round" };
function fixture() {
  mkdirSync(".tmp", { recursive: true });
  const root = realpathSync(mkdtempSync(resolve(".tmp/vocabulary-roots-")));
  directories.push(root);
  for (const dir of ["src/pages", "src/vocabularies/shapes", "data", "docs"]) mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { aliases: {}, libraryImports: [] }, pages: [] }));
  return { root, pagesDir: join(root, "src/pages"), roots: [join(root, "src/vocabularies")], sourceRoots: sourceRoots([{ directory: join(root, "src"), url: "/runtime/" }, { directory: root, url: "/fixtures/" }, { directory: join(root, "src/vocabularies"), url: "/vocabularies/" }]) };
}
function page(file: string, declaration: unknown = { alias: "shapes", instructions: "Read shapes as geometry.", items: [item] }) {
  writeFileSync(file, `export const vocabulary = ${JSON.stringify(declaration)}; export default () => null;`);
}

it("reads imported mapped data and satisfies without executing the page, preserving extras", async () => {
  const options = fixture();
  writeFileSync(join(options.root, "data/items.ts"), `export const items = [${JSON.stringify(item)}].map(item => ({...item}));`);
  const file = join(options.roots[0]!, "shapes/index.tsx");
  writeFileSync(file, `import type { VocabularyDeclaration } from '@flanksource/clicky-ui/comments'; import {items} from '../../../data/items'; throw new Error('never execute'); export const vocabulary = {alias:'shapes', instructions:'Read shapes as geometry.', items:[...items]} satisfies VocabularyDeclaration; export default () => null;`);
  const registry = directoryVocabulary(options);
  const snapshot = await registry.refresh();
  expect(snapshot.items).toEqual([{ ...item, catalog: "shapes" }]);
  expect(snapshot.catalogs).toEqual([{ alias: "shapes", instructions: "Read shapes as geometry.", slug: "vocabularies/shapes", file: "src/vocabularies/shapes/index.tsx", page: expect.stringMatching(/^\/vocabularies\/shapes\/index.tsx\?vocabVersion=[a-f0-9]{20}$/), previewRevision: expect.stringMatching(/^[a-f0-9]{20}$/) }]);
  expect(registry.instructions("shapes")).toBe("Read shapes as geometry.");
  expect(() => registry.instructions("missing")).toThrow("Unknown vocabulary");
  expect(await registry.refresh()).toBe(snapshot);
});

it.each([
  { declaration: { alias: "shapes", items: [item] }, error: "instructions" },
  { declaration: { alias: "Bad_alias", instructions: "Read it", items: [item] }, error: "alias" },
  { declaration: { alias: "shapes", instructions: "Read it", items: [item, item] }, error: "shapes:circle" },
  { declaration: { alias: "shapes", instructions: "Read it", items: [{ ...item, references: [] }] }, error: "references" },
])("rejects invalid declarations: $error", async ({ declaration, error }) => {
  const options = fixture();
  page(join(options.roots[0]!, "shapes/index.tsx"), declaration);
  await expect(directoryVocabulary(options).refresh()).rejects.toThrow(error);
});

it("rejects duplicate aliases with both file names", async () => {
  const options = fixture();
  page(join(options.roots[0]!, "one.tsx"));
  page(join(options.pagesDir, "two.tsx"));
  await expect(directoryVocabulary(options).refresh()).rejects.toThrow(/Duplicate vocabulary alias shapes.*one.tsx.*two.tsx/);
});

it("keeps normal page slugs and uses aliases in vocabulary roots, excluding private and test pages", async () => {
  const options = fixture();
  page(join(options.pagesDir, "guide.tsx"));
  page(join(options.roots[0]!, "symbols.tsx"), { alias: "symbols", instructions: "Read symbols", items: [item] });
  for (const name of ["_private.tsx", ".hidden.tsx", "ignore.test.tsx", "ignore.stories.tsx"]) page(join(options.roots[0]!, name));
  const snapshot = await directoryVocabulary(options).refresh();
  expect(snapshot.catalogs.map(({ alias, slug }) => ({ alias, slug }))).toEqual([{ alias: "symbols", slug: "vocabularies/symbols" }, { alias: "shapes", slug: "guide" }]);
});

it("versions only reachable imports, including raw assets and imported metadata glob matches", async () => {
  const options = fixture();
  const file = join(options.roots[0]!, "shapes/index.tsx");
  writeFileSync(join(options.root, "data/circle.json"), JSON.stringify(item));
  writeFileSync(join(options.roots[0]!, "shapes/items.ts"), "const data = import.meta.glob('../../../data/*.json', {eager:true, import:'default'}); export const items = Object.entries(data).map(([path,item]) => item);");
  writeFileSync(file, `import {items} from './items'; import label from './label.txt?raw'; export const vocabulary = {alias:'shapes',instructions:'Read shapes',items}; export default () => <span>{label}</span>;`);
  writeFileSync(join(options.roots[0]!, "shapes/label.txt"), "Circle");
  const registry = directoryVocabulary(options);
  const first = await registry.refresh();
  writeFileSync(join(options.roots[0]!, "unrelated.ts"), "export const unrelated = 1;");
  writeFileSync(join(options.roots[0]!, "unrelated.tsx"), "export default () => <p>Unrelated page</p>;");
  expect(await registry.refresh()).toBe(first);
  writeFileSync(join(options.roots[0]!, "shapes/label.txt"), "Round circle");
  const changed = await registry.refresh();
  expect(changed.catalogs[0]!.previewRevision).not.toBe(first.catalogs[0]!.previewRevision);
  writeFileSync(join(options.root, "data/square.json"), JSON.stringify({ ...item, id: "square" }));
  const added = await registry.refresh();
  expect(added.items.map(item => item.id)).toEqual(["circle", "square"]);
  expect(added.catalogs[0]!.previewRevision).not.toBe(changed.catalogs[0]!.previewRevision);
  rmSync(join(options.root, "data/square.json"));
  expect((await registry.refresh()).items.map(item => item.id)).toEqual(["circle"]);
});

it("resolves alias slugs to browser projects and their generated frame entry", async () => {
  const options = fixture();
  const file = join(options.roots[0]!, "shapes/index.tsx");
  page(file);
  const project = await readBrowserProject({ ...options, slug: "vocabularies/shapes" });
  expect(project).toMatchObject({ compatible: true, page: "vocabularies/shapes.tsx", entryFile: "vocabularies/shapes.tsx" });
  if (!project.compatible) throw new Error(JSON.stringify(project.issues));
  expect(Object.keys(project.hashes)).toContain(`/link/playground-pages/${file.slice(1)}`);
  expect(await withFrameProviders({ root: options.root, project })).toMatchObject({ page: "_playground/entries/vocabularies/shapes.tsx.tsx" });
  expect(await frameSource({ ...options, path: "generated/entries/vocabularies/shapes.tsx.tsx" })).toContain(`/link/playground-pages/${file.slice(1)}`);
});

it("refreshes previews for lazy image glob matches outside the vocabulary directory", async () => {
  const options = fixture();
  const file = join(options.roots[0]!, "shapes/index.tsx");
  page(file);
  writeFileSync(file, `import './specimen'; export const vocabulary = {alias:'shapes',instructions:'Read shapes',items:${JSON.stringify([item])}}; export default () => null;`);
  writeFileSync(join(options.roots[0]!, "shapes/specimen.ts"), "export const images = import.meta.glob('../../../data/*.svg');");
  writeFileSync(join(options.root, "data/circle.svg"), '<svg width="10"/>');
  const registry = directoryVocabulary(options);
  const first = await registry.refresh();
  writeFileSync(join(options.root, "data/circle.svg"), '<svg width="20"/>');
  const changed = await registry.refresh();
  expect(changed.catalogs[0]!.previewRevision).not.toBe(first.catalogs[0]!.previewRevision);
  writeFileSync(join(options.root, "data/square.svg"), '<svg width="10"/>');
  expect((await registry.refresh()).catalogs[0]!.previewRevision).not.toBe(changed.catalogs[0]!.previewRevision);
});

it("extracts vocabulary instructions and mapped items as page guidance", () => {
  const files = { "/src/page.tsx": "import {items} from './items'; export const vocabulary = {alias:'shapes',instructions:'Read shapes',items:[...items]} satisfies VocabularyDeclaration; export default () => null;", "/src/items.ts": `export const items = [${JSON.stringify(item)}].map(item => ({...item}));` };
  expect(extractPageGuidance("/src/page.tsx", memoryGuidanceHost(files)).guidance.blocks).toEqual([{ kind: "vocabulary", alias: "shapes", instructions: "Read shapes", items: [{ ...item, catalog: "shapes" }] }]);
});

it("serves a vocabulary alias through browser-page, browser-project, frame and source routes", async () => {
  const options = fixture();
  const file = join(options.roots[0]!, "shapes/index.tsx");
  page(file);
  const app = productionMiddleware();
  app.middlewares.use(productionBrowserRoutes(options));
  await new Promise<void>(done => app.server.listen(0, "127.0.0.1", done));
  try {
    const address = app.server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server address");
    const origin = `http://127.0.0.1:${address.port}`;
    const get = async (path: string) => {
      const response = await fetch(origin + path);
      expect(response.status, path).toBe(200);
      return response;
    };
    expect(await (await get("/__playground/browser-files")).json()).toEqual(["vocabularies/shapes.tsx"]);
    expect(await (await get("/__playground/browser-project?slug=vocabularies/shapes")).json()).toMatchObject({ compatible: true, page: "_playground/entries/vocabularies/shapes.tsx.tsx" });
    expect(await (await get("/__playground/browser-page?file=vocabularies/shapes.tsx&kind=guidance")).json()).toEqual({ blocks: [{ kind: "vocabulary", alias: "shapes", instructions: "Read shapes as geometry.", items: [{ ...item, catalog: "shapes" }] }] });
    expect(await (await get("/__playground/page-links/playground-shell/generated/entries/vocabularies/shapes.tsx.tsx")).text()).toContain(`/link/playground-pages/${file.slice(1)}`);
    expect(await (await get("/vocabularies/shapes/index.tsx")).text()).toContain("export const vocabulary");
  } finally {
    app.server.closeAllConnections();
    await new Promise<void>((done, reject) => app.server.close(error => error ? reject(error) : done()));
  }
});

it("rejects unmapped pages and source URLs escaping the declared root", () => {
  const options = fixture();
  const file = join(options.roots[0]!, "shapes/index.tsx");
  page(file);
  expect(sourceUrl(file, options.sourceRoots)).toBe("/vocabularies/shapes/index.tsx");
  expect(sourceFile("/vocabularies/shapes/index.tsx?vocabVersion=revision", options.sourceRoots)).toBe(file);
  expect(() => sourceUrl(file, [])).toThrow("no declared URL mapping");
  expect(() => sourceFile("/vocabularies/%2e%2e%2fpackage.json", [options.sourceRoots[2]!])).toThrow();
});
