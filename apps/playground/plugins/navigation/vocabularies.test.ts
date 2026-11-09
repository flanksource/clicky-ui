// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { configureComments } from "../comments-client";
import { fixedGavel } from "../gavel-launch-server";
import { createNavigation, parseNavigationQuery } from "./service";
import { directoryVocabulary } from "../vocabulary-directories";
import { vocabularyOptions } from "../production-config";

const roots: string[] = [];
afterEach(() => { vi.unstubAllGlobals(); for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

it("lists vocabulary root pages in Vocabularies with titles or aliases and keeps page declarations in place", async () => {
  mkdirSync(".tmp", { recursive: true });
  const root = realpathSync(mkdtempSync(resolve(".tmp/navigation-vocabularies-")));
  roots.push(root);
  const pagesDir = resolve(root, "src/pages");
  const external = resolve(root, "example-kit/examples/vocabularies");
  const sharedData = resolve(root, "shared-data");
  for (const path of [pagesDir, resolve(root, "src/vocabularies"), external, sharedData]) mkdirSync(path, { recursive: true });
  writeFileSync(resolve(root, ".env"), `PLAYGROUND_VOCABULARY_DIRS=${external}\nPLAYGROUND_EXTERNAL_ROOTS=${sharedData}\n`);
  const vocabulary = (alias: string) => `export const vocabulary = {alias:'${alias}', instructions:'Read ${alias}',items:[{type:'shape',id:'circle',label:'Circle',description:'Round',references:['shapes.md']}]}; export default () => null;`;
  writeFileSync(resolve(root, "src/vocabularies/shapes.tsx"), `export const meta = {title:'Shape guide'}; ${vocabulary("shapes")}`);
  writeFileSync(resolve(sharedData, "items.ts"), "export const items = [{type:'shape',id:'circle',label:'Circle',description:'Round',references:['shapes.md']}];");
  writeFileSync(resolve(external, "symbols.tsx"), "import {items} from '../../../shared-data/items'; export const vocabulary = {alias:'symbols',instructions:'Read symbols',items}; export default () => null;");
  writeFileSync(resolve(pagesDir, "guide.tsx"), vocabulary("guide"));
  expect((await directoryVocabulary(await vocabularyOptions({ root })).refresh()).catalogs).toEqual(expect.arrayContaining([
    expect.objectContaining({ alias: "symbols", slug: "vocabularies/symbols", file: "example-kit/examples/vocabularies/symbols.tsx" }),
    expect.objectContaining({ alias: "guide", slug: "guide", file: "src/pages/guide.tsx" }),
  ]));
  configureComments({ dir: root, workspace: root, endpoint: fixedGavel("http://gavel.local") });
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [], page: { total: 0, limit: 200, offset: 0 } })));
  const navigation = createNavigation({ dir: root, pagesDir, endpoint: fixedGavel("http://gavel.local"), problems: async () => ({}) });
  const tree = await navigation.children(parseNavigationQuery(new URLSearchParams({ age: "all", active: "vocabularies/shapes" })));
  expect(tree.children).toEqual(expect.arrayContaining([
    expect.objectContaining({ key: "page-item:guide", slug: "guide" }),
    expect.objectContaining({ key: "page:vocabularies", label: "Vocabularies", icon: "UiLedger", children: expect.arrayContaining([
      expect.objectContaining({ slug: "vocabularies/shapes", label: "Shape guide" }),
      expect.objectContaining({ slug: "vocabularies/symbols", label: "symbols" }),
    ]) }),
  ]));
  const expanded = await navigation.children(parseNavigationQuery(new URLSearchParams({ age: "all", node: "page:vocabularies" })));
  expect(expanded.children.map(entry => entry.slug).sort()).toEqual(["vocabularies/shapes", "vocabularies/symbols"]);
});
