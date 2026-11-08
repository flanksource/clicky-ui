import { realpathSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export type SourceRoot = { directory: string; url: string };

export function sourceRoots(roots: readonly SourceRoot[]): SourceRoot[] {
  const urls = new Set<string>();
  return roots.map(root => {
    if (!root.url.startsWith("/") || root.url.startsWith("//") || /[?#%\\]/.test(root.url) || !root.url.endsWith("/") || root.url.split("/").some(part => part === "." || part === "..")) throw new Error(`Invalid source root URL ${root.url}`);
    if (urls.has(root.url)) throw new Error(`Duplicate source root URL ${root.url}`);
    urls.add(root.url);
    return { directory: realpathSync(root.directory), url: root.url };
  });
}

export function sourceUrl(file: string, roots: readonly SourceRoot[]): string {
  const canonical = realpathSync(file);
  const root = [...roots].sort((a, b) => b.directory.length - a.directory.length).find(root => canonical.startsWith(root.directory + sep));
  if (!root) throw new Error(`Source has no declared URL mapping: ${file}`);
  return root.url + relative(root.directory, canonical).split(sep).map(encodeURIComponent).join("/");
}

export function sourceFile(url: string, roots: readonly SourceRoot[]): string | undefined {
  const path = new URL(url, "http://playground").pathname;
  const root = [...roots].sort((a, b) => b.url.length - a.url.length).find(root => path.startsWith(root.url));
  if (!root) return undefined;
  const file = realpathSync(resolve(root.directory, decodeURIComponent(path.slice(root.url.length))));
  if (!file.startsWith(root.directory + sep)) throw new Error(`Source URL escapes its declared root: ${url}`);
  return file;
}
