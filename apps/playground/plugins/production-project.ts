import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { sourceRoots, sourceUrl, type SourceRoot } from "./source-roots";
import type { Census } from "../scripts/browser-mode-census-catalog";
import type { BrowserProject } from "../src/browser-mode/project";
import { sourceLink, sourceLocation, prepareSourceAliases } from "./production-links";
import { inspectPage } from "../scripts/browser-mode-census";
import { readPageDependencies } from "../src/browser-mode/dependencies";
import { resolveBrowserPage } from "./production-registry";
import { sourceHash } from "./source-hash";
import { readDependencyDefaults } from "./runtime-dependencies-defaults";
import { vocabularyOptions } from "./production-config";

export async function readCompatibility(root: string): Promise<Census> {
  const census = JSON.parse(await readFile(resolve(root, "docs/browser-mode-compatibility.json"), "utf8")) as Census;
  if (census.version !== 1 || !Array.isArray(census.pages)) throw new Error("Invalid browser-mode compatibility census");
  return census;
}

export function projectPath(options: { file: string; root: string; sourceRoots: readonly SourceRoot[] }): string {
  const location = sourceLocation(options);
  return `/link/${location.id}/${location.sourceRoot ? "" : "source/"}${location.path}`;
}

export async function readBrowserProject(options: { root: string; slug: string; sourceRoots: readonly SourceRoot[]; packages?: string[] }): Promise<BrowserProject> {
  options = { ...options, root: await realpath(options.root), sourceRoots: sourceRoots(options.sourceRoots) };
  const census = await readCompatibility(options.root);
  const entry = await resolveBrowserPage(options);
  const source = await readFile(entry, "utf8");
  const entryFile = options.slug.startsWith("vocabularies/") ? `${options.slug}.tsx` : relative(resolve(options.root, "src/pages"), entry);
  const defaults = readDependencyDefaults(options);
  const base = { entryFile, sourceHash: sourceHash(source), manifest: { dependencies: {} as Record<string, string> }, pageDependencies: {} as Record<string, string>, defaults, requiredPackages: [] as string[], configuration: { aliases: census.configuration.aliases, libraryImports: census.configuration.libraryImports ?? [], sourceRoots: [...options.sourceRoots] } };
  let page;
  try {
    base.pageDependencies = readPageDependencies({ source, file: base.entryFile });
    base.manifest.dependencies = { ...defaults.profile, ...defaults.workspace, ...base.pageDependencies };
    page = await inspectPage({ root: options.root, file: entry, externalRoots: options.sourceRoots.map(root => root.directory), aliases: census.configuration.aliases, libraryImports: census.configuration.libraryImports ?? [], packages: [...Object.keys(base.manifest.dependencies), ...(options.packages ?? [])] });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ...base, compatible: false, issues: [{ blocking: true, class: "invalid-source", reason, fix: "Correct the page dependency header.", file: base.entryFile, line: Number(/:(\d+):/.exec(reason)?.[1] ?? 1) }] };
  }
  const issues = page.issues.filter(issue => issue.blocking).map(issue => {
    const file = resolve(options.root, issue.file);
    const root = options.sourceRoots.find(root => file.startsWith(root.directory + "/"));
    return { ...issue, ...(root ? { sourceUrl: sourceUrl(file, [root]) } : {}) };
  });
  base.requiredPackages = [...new Set(page.issues.filter(issue => issue.class === "external-package").map(issue => issue.specifier.startsWith("@") ? issue.specifier.split("/").slice(0, 2).join("/") : issue.specifier.split("/")[0]!))];
  if (issues.length) return { ...base, compatible: false, issues };
  const links = new Map<string, ReturnType<typeof sourceLink>>();
  const hashes: Record<string, string> = {};
  const files = page.files.map(file => resolve(options.root, file));
  for (const file of files) {
    const location = sourceLocation({ ...options, file });
    const link = links.get(location.id) ?? sourceLink(location);
    link.build.modules[`${location.sourceRoot ? "" : "source/"}${location.path}`] = { resolutions: {} };
    const declaration = { root: location.sourceRoot ?? "source", prefix: location.prefix, editable: location.editable };
    if (!link.build.pageSources!.some(root => root.root === declaration.root || declaration.root.startsWith(root.root + "/"))) {
      link.build.pageSources = [...link.build.pageSources!.filter(root => !root.root.startsWith(declaration.root + "/")), declaration];
    }
    links.set(location.id, link);
    hashes[projectPath({ ...options, file })] = createHash("sha256").update(await readFile(file)).digest("hex");
  }
  const aliases: Record<string, string> = {};
  for (const [name, path] of Object.entries(census.configuration.aliases)) {
    const file = await realpath(resolve(options.root, path));
    if (!files.some(path => path === file || path.startsWith(file + "/"))) continue;
    const target = projectPath({ ...options, file });
    if (Object.hasOwn(hashes, target)) aliases[name] = target;
    else aliases[name + "/"] = target + "/";
  }
  await prepareSourceAliases({ root: options.root, sourceRoots: options.sourceRoots, links: [...links.values()] });
  return { ...base, compatible: true, issues: [], page: entryFile, files: {}, aliases, links: [...links.values()], hashes };
}

export async function withFrameProviders(options: { root: string; project: BrowserProject }): Promise<BrowserProject> {
  if (!options.project.compatible) return options.project;
  const project = options.project;
  const entry = `entries/${project.page}.tsx`;
  if (!project.links.some(link => link.id === "playground-pages")) throw new Error("Page has no primary source link");
  const shell = sourceLink({ id: "playground-shell", directory: options.root, prefix: "_playground", editable: false });
  shell.build.pageSources = [{ root: "generated", prefix: "_playground", editable: false }];
  shell.build.entries = { [shell.build.library]: `generated/${entry}` };
  shell.build.modules = { [`generated/${entry}`]: { resolutions: {} }, "generated/providers.tsx": { resolutions: {} } };
  return { ...project, page: `_playground/${entry}`, links: [...project.links, shell] };
}

export async function frameSource(options: { root: string; path: string; sourceRoots?: readonly SourceRoot[] }): Promise<string> {
  if (options.path === "generated/providers.tsx") return readFile(resolve(options.root, "src/browser-mode/frame-page.tsx"), "utf8");
  const match = /^generated\/entries\/(.+)\.tsx$/.exec(options.path);
  if (!match) throw new Error(`Unknown generated frame source ${options.path}`);
  const slug = match[1]!.replace(/\.tsx$/, "");
  const mappings = await vocabularyOptions(options);
  const file = await resolveBrowserPage({ root: options.root, slug, sourceRoots: mappings.sourceRoots });
  const target = projectPath({ root: options.root, file, sourceRoots: mappings.sourceRoots });
  return `import * as Page from ${JSON.stringify(target)}; import {FrameProviders} from "/link/playground-shell/generated/providers.tsx"; export const ready = async () => { if (typeof Page.ready === "function") await Page.ready(); else if (Page.ready) await Page.ready; }; export default function PlaygroundPage({data}) { return <FrameProviders data={data}><Page.default data={data} /></FrameProviders>; }`;
}
