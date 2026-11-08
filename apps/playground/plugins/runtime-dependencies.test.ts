// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { readBrowserProject } from "./production-project";
import { readPagesFile, writePagesFile } from "./pages-store";
import { updatePageDependency } from "../src/browser-mode/dependencies";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

it("rechecks source and header changes without refreshing the saved census and rejects stale writeback", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(resolve(".tmp/runtime-dependencies-")); roots.push(root);
  const pages = resolve(root, "src/pages");
  await mkdir(pages, { recursive: true }); await mkdir(resolve(root, "docs"));
  await writeFile(resolve(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { aliases: {}, libraryImports: [] }, pages: [] }));
  const original = 'import { parse } from "yaml"; export default () => <p>{parse("name: Ada").name}</p>;';
  await writeFile(resolve(pages, "report.tsx"), original);
  await writeFile(resolve(pages, "other.tsx"), original);
  const options = { root, slug: "report", sourceRoots: [{ directory: pages, url: "/source/" }] };
  const blocked = await readBrowserProject(options);
  expect(blocked).toMatchObject({ compatible: false, entryFile: "report.tsx", issues: [{ class: "external-package", specifier: "yaml" }] });
  const opened = readPagesFile(pages, "report.tsx");
  const updated = updatePageDependency({ ...opened, name: "yaml", version: "^2" });
  writePagesFile(pages, opened.file, updated, opened.hash);
  expect(await readBrowserProject(options)).toMatchObject({ compatible: true, manifest: { dependencies: { yaml: "^2" } } });
  expect(await readBrowserProject({ ...options, slug: "other" })).toMatchObject({ compatible: false });
  expect(() => writePagesFile(pages, opened.file, updated, opened.hash)).toThrow(/changed since/);
  expect(await readFile(resolve(pages, "other.tsx"), "utf8")).toBe(original);
});

it("accepts local package names for a page check without writing them into a header", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(resolve(".tmp/runtime-local-")); roots.push(root);
  await mkdir(resolve(root, "src/pages"), { recursive: true }); await mkdir(resolve(root, "docs"));
  await writeFile(resolve(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { aliases: {} }, pages: [] }));
  await writeFile(resolve(root, "src/pages/report.tsx"), 'import {Card} from "@acme/local/card"; export default Card;');
  const project = await readBrowserProject({ root, slug: "report", packages: ["@acme/local"], sourceRoots: [{ directory: resolve(root, "src/pages"), url: "/source/" }] });
  expect(project).toMatchObject({ compatible: true, manifest: { dependencies: {} } });
});
