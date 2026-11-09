import type { FolderManifest, PageLock } from "@flanksource/page-runtime/schema";
import { validateFrameMessage, validateHostMessage } from "@flanksource/page-runtime/host";

export type Project = { format: 1; name: string; entry: string; files: Record<string, string>; locks: Record<string, PageLock> };
export type SourceNode = { path: string; name: string; children?: SourceNode[] };

export function persistableLocks({ project, savedFiles }: { project: Project; savedFiles: Record<string, string> }): Record<string, PageLock> | null {
  if (project.files["package.json"] !== savedFiles["package.json"]) return null;
  return Object.fromEntries(Object.entries(project.locks).filter(([page]) => savedFiles[page] !== undefined));
}

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}: expected object`);
  return value as Record<string, unknown>;
}

function strings(value: unknown, label: string): Record<string, string> {
  const result = object(value, label);
  if (Object.values(result).some((item) => typeof item !== "string")) throw new Error(`${label}: expected string values`);
  return result as Record<string, string>;
}

export function parseProject(value: unknown): Project {
  const p = object(value, "project");
  if (p.format !== 1 || typeof p.name !== "string" || !p.name.trim() || typeof p.entry !== "string") throw new Error("invalid project format/name/entry");
  const files = strings(p.files, "files");
  validateHostMessage({ type: "sources", files });
  if (files[p.entry] === undefined || !/\.(tsx|jsx|mdx)$/.test(p.entry)) throw new Error(`entry ${p.entry} must name an existing TSX, JSX or MDX page`);
  manifestOf(files);
  const locks: Record<string, PageLock> = {};
  for (const [page, lock] of Object.entries(object(p.locks, "locks"))) {
    const cached = object(lock, `lock ${page}`);
    if (cached.lock === 1) {
      if (cached.page !== page || files[page] === undefined) throw new Error(`lock ${page} does not match an existing page`);
      continue;
    }
    const message = validateFrameMessage({ type: "lock", lock });
    if (message.type !== "lock" || message.lock.page !== page || files[page] === undefined) throw new Error(`lock ${page} does not match an existing page`);
    locks[page] = message.lock;
  }
  return { format: 1, name: p.name, entry: p.entry, files, locks };
}

export function manifestOf(files: Record<string, string>): FolderManifest {
  if (files["package.json"] === undefined) throw new Error("project requires package.json");
  const value = object(JSON.parse(files["package.json"]), "package.json");
  const dependencies = strings(value.dependencies, "dependencies");
  const pages: Record<string, Record<string, string>> = {};
  if (value.pageRuntime !== undefined) {
    const runtime = object(value.pageRuntime, "pageRuntime");
    if (runtime.pages !== undefined) for (const [page, versions] of Object.entries(object(runtime.pages, "pageRuntime.pages"))) {
      validateHostMessage({ type: "sources", files: { [page]: "" } });
      pages[page] = strings(versions, `pageRuntime.pages.${page}`);
    }
  }
  return { dependencies, ...(value.pageRuntime !== undefined ? { pageRuntime: { pages } } : {}) };
}

export function overrideVersions({ project, page, versions }: { project: Project; page: string; versions: Record<string, string> }): Project {
  if (!project.files[page]) throw new Error(`unknown page ${page}`);
  for (const [name, version] of Object.entries(versions)) {
    if (!["@flanksource/clicky-ui", "@flanksource/facet"].includes(name)) throw new Error(`${name} is not a managed library; React follows clicky-ui`);
    if (!version.trim()) throw new Error(`${name}: version is required`);
  }
  const manifest = manifestOf(project.files);
  const original = object(JSON.parse(project.files["package.json"]!), "package.json");
  const updated = { ...original, pageRuntime: { ...object(original.pageRuntime ?? {}, "pageRuntime"), pages: { ...manifest.pageRuntime?.pages, [page]: { ...manifest.pageRuntime?.pages?.[page], ...versions } } } };
  const locks = { ...project.locks };
  delete locks[page];
  return { ...project, files: { ...project.files, "package.json": `${JSON.stringify(updated, null, 2)}\n` }, locks };
}

export function sourceTree(files: Record<string, string>): SourceNode[] {
  const roots: SourceNode[] = [];
  for (const path of Object.keys(files).sort()) {
    let nodes = roots;
    const parts = path.split("/");
    parts.forEach((name, index) => {
      const key = parts.slice(0, index + 1).join("/");
      let node = nodes.find((candidate) => candidate.path === key);
      if (!node) { node = { name, path: key, ...(index < parts.length - 1 ? { children: [] } : {}) }; nodes.push(node); }
      if (node.children) nodes = node.children;
    });
  }
  return roots;
}
