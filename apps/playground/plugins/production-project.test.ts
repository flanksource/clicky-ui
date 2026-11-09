// @vitest-environment node
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { readBrowserProject, readCompatibility } from "./production-project";
import { productionConfig } from "./production-config";
import { linkedSourceFile } from "./production-links";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

it("serves original reachable source and explicit aliases without executing a page", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await realpath(await mkdtemp(resolve(".tmp/production-project-")));
  roots.push(root);
  await mkdir(resolve(root, "src/pages"), { recursive: true });
  await mkdir(resolve(root, "docs"));
  const page = 'import data from "./data.json"; throw new Error("must not execute"); export default () => <div>{data.count}</div>;';
  await writeFile(resolve(root, "src/pages/report.tsx"), page);
  await writeFile(resolve(root, "src/pages/data.json"), '{"count":3}');
  await writeFile(resolve(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { externalRoots: [], aliases: {} }, pages: [{ slug: "report", file: "src/pages/report.tsx", compatible: true, files: ["src/pages/report.tsx", "src/pages/data.json"], issues: [] }] }));
  const project = await readBrowserProject({ root, slug: "report", sourceRoots: [{ directory: resolve(root, "src/pages"), url: "/__playground/page-source/" }] });
  expect(project).toMatchObject({ page: "report.tsx", compatible: true, files: {}, aliases: {} });
  if (!project.compatible) throw new Error("Expected compatible project");
  expect(project.links[0]?.build.pageSources).toEqual([{ root: resolve(root, "src/pages").slice(1), prefix: "", editable: true }]);
  expect(Object.keys(project.links[0]!.build.modules)).toContain(resolve(root, "src/pages/data.json").slice(1));
  expect(Object.keys(project.hashes)).toContain(`/link/playground-pages/${resolve(root, "src/pages/report.tsx").slice(1)}`);
  expect(JSON.stringify(project)).not.toContain("must not execute");
  expect(await readFile(resolve(root, "src/pages/report.tsx"), "utf8")).toBe(page);
  await writeFile(resolve(root, "src/pages/report.tsx"), 'import {title} from "./new-helper"; export default () => <h1>{title}</h1>;');
  await writeFile(resolve(root, "src/pages/new-helper.ts"), 'export const title = "New dependency";');
  const changed = await readBrowserProject({ root, slug: "report", sourceRoots: [{ directory: resolve(root, "src/pages"), url: "/__playground/page-source/" }] });
  if (!changed.compatible) throw new Error("Expected updated compatible project");
  expect(Object.keys(changed.hashes)).toContain(`/link/playground-pages/${resolve(root, "src/pages/new-helper.ts").slice(1)}`);
});

it("rechecks an incompatible page from its current source rather than stale census reasons", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(resolve(".tmp/production-project-"));
  roots.push(root);
  await mkdir(resolve(root, "docs"));
  await mkdir(resolve(root, "src/pages"), { recursive: true });
  const issues = [{ blocking: true, reason: "Imports shell state", fix: "Publish the provider", file: "src/pages/broken.tsx", line: 2 }];
  await writeFile(resolve(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { aliases: {} }, pages: [{ slug: "broken", file: "src/pages/broken.tsx", compatible: false, files: [], issues }] }));
  await writeFile(resolve(root, "src/pages/broken.tsx"), 'import "node:fs"; export default () => <div/>;');
  expect(await readBrowserProject({ root, slug: "broken", sourceRoots: [] })).toMatchObject({ compatible: false, issues: [{ class: "node-builtin", specifier: "node:fs" }] });
  await writeFile(resolve(root, "src/pages/broken.tsx"), 'export default () => <div/>;');
  expect(await readBrowserProject({ root, slug: "broken", sourceRoots: [] })).toMatchObject({ compatible: true });
  await expect(readBrowserProject({ root, slug: "missing", sourceRoots: [] })).rejects.toThrow("ENOENT");
});

it("maps every census-compatible workspace source without compiling pages on the server", async () => {
  const root = resolve(".");
  const config = await productionConfig(root);
  const census = await readCompatibility(root);
  const compatible = census.pages.filter(page => page.compatible);
  expect(compatible.length).toBeGreaterThan(0);
  for (const page of compatible) {
    const project = await readBrowserProject({ root, slug: page.slug, sourceRoots: config.sourceRoots });
    expect(project.compatible, page.slug).toBe(true);
    if (!project.compatible) throw new Error(`Unexpected incompatible page ${page.slug}`);
    expect(Object.keys(project.hashes).length, page.slug).toBe(page.files.length);
  }
});

it("retains the icons ESM runtime paths alongside the aliased CommonJS conversion", async () => {
  const root = resolve(".");
  const config = await productionConfig(root);
  const project = await readBrowserProject({ root, slug: "flanksource/workload-panel", sourceRoots: config.sourceRoots });
  if (!project.compatible) throw new Error("Workload panel must remain census compatible");
  const icons = project.links.find(link => link.build.library === "@flanksource/icons");
  if (!icons) throw new Error("Icons alias was not linked");
  expect(Object.keys(icons.build.modules)).toContain("mi/index.mjs");
  const file = await linkedSourceFile({ root, sourceRoots: config.sourceRoots, id: icons.id, path: "mi/index.mjs" });
  expect(await readFile(file, "utf8")).toContain("export function Docker");
  const trust = await readBrowserProject({ root, slug: "trust/access-review-signoff", sourceRoots: config.sourceRoots });
  if (!trust.compatible) throw new Error("Trust signoff must remain census compatible");
  const library = trust.links.find(link => link.build.library === "@flanksource/icons");
  expect(library?.build.commonjs).toHaveProperty("source/icon/index.js");
  expect(library?.build.pageSources).toBeUndefined();
  expect(trust.links.flatMap(link => link.build.pageSources ?? []).every(source => !source.root.includes("node_modules"))).toBe(true);
});
