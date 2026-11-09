// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { readStaticExports } from "./static-metadata";
import { pageUpdates } from "./page-activity";
import { pageFile, pageMetaData } from "./navigation/sources";

const directories: string[] = [];
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function fixture(files: Record<string, string>) {
  mkdirSync(".tmp", { recursive: true });
  const root = mkdtempSync(resolve(".tmp/static-metadata-"));
  directories.push(root);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(root, name), text);
  return { file: join(root, "page.tsx"), roots: [root] };
}

it("reads metadata dependencies and named icon identities without executing the page", () => {
  const options = fixture({
    "page.tsx": `import { pick } from './catalog'; throw new Error('page executed'); export const meta = pick('sample'); export default () => <div />;`,
    "catalog.ts": `import { UiBook } from '@flanksource/clicky-ui/icons'; const entries = [{slug:'sample', title:'Sample', icon:UiBook}]; export function pick(slug: string) { const found = entries.find(item => item.slug === slug); if (!found) throw new Error('missing page'); return found; }`,
  });
  expect(readStaticExports({ ...options, names: ["meta"] })).toEqual({ meta: { slug: "sample", title: "Sample", icon: "UiBook" } });
});

it("refreshes imported catalog data and supports default exports, spreads and array projections", () => {
  const options = fixture({ "page.tsx": `import values from './data'; export default values.flatMap(({id}) => ['one','two'].map(kind => ({id: id + '/' + kind})));`, "data.ts": `export default [{id:'shape'}];` });
  expect(readStaticExports(options)).toEqual({ default: [{ id: "shape/one" }, { id: "shape/two" }] });
  writeFileSync(join(options.roots[0]!, "data.ts"), `export default [{id:'color'}];`);
  expect(readStaticExports(options)).toEqual({ default: [{ id: "color/one" }, { id: "color/two" }] });
});

it.each(["fetch('/secrets')", "missing", "(() => { while(true) {} })()"])("fails loudly on non-static metadata: %s", (expression) => {
  const options = fixture({ "page.tsx": `export const meta = ${expression};` });
  expect(() => readStaticExports(options)).toThrow(/metadata/);
});

it("reads the actual vocabulary catalogs and every page's metadata without Vite", () => {
  const roots = [resolve("../.."), resolve("../../../gtm")];
  for (const catalog of ["brand", "facet", "git"]) {
    const values = readStaticExports({ file: resolve(`src/vocabularies/${catalog}/catalog.ts`), roots });
    const arrays = Object.values(values).filter(Array.isArray);
    expect({ catalog, arrays: arrays.length, populated: arrays.every(items => items.length > 0) }).toEqual({ catalog, arrays: 1, populated: true });
  }
  for (const slug of Object.keys(pageUpdates(resolve("src/pages")))) {
    const file = pageFile(resolve("src/pages"), slug);
    if (!file.endsWith(".tsx")) continue;
    const values = readStaticExports({ file, roots, names: ["meta"] });
    expect(() => pageMetaData(file, values["meta"]), slug).not.toThrow();
  }
});
