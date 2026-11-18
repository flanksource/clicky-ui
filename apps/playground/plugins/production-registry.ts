import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import { vocabularyOptions } from "./production-config";
import { vocabularyPages } from "./vocabulary-directories";
import { pagePath, assertSlug } from "./pages-store";
import type { SourceRoot } from "./source-roots";

export async function sourceFiles(root: string): Promise<string[]> {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(tsx?|mdx?)$/.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

export async function pageFiles(root: string): Promise<string[]> {
  const vocabulary = await vocabularyPages(await vocabularyOptions({ root }));
  return [...new Set([...(await sourceFiles(resolve(root, "src/pages")))
    .map((file) => file.slice(resolve(root, "src/pages").length + 1))
    .filter(
      (file) =>
        /\.(tsx|md|mdx)$/.test(file) &&
        !file.split("/").some((part) => /^[_.]/.test(part)) &&
        !/\.(test|stories)\./.test(file),
    ), ...vocabulary.filter(page => page.slug.startsWith("vocabularies/")).map(page => `${page.slug}.tsx`)])]
    .sort();
}

export async function resolveBrowserPage(options: { root: string; slug: string; sourceRoots: readonly SourceRoot[] }): Promise<string> {
  assertSlug(options.slug);
  if (options.slug.startsWith("vocabularies/")) {
    const pages = await vocabularyPages(await vocabularyOptions(options));
    const page = pages.find(page => page.slug === options.slug);
    if (page) return page.file;
  }
  return pagePath(resolve(options.root, "src/pages"), options.slug);
}

export function liveRegistry(code: string): string {
  const source = ts.createSourceFile(
    "registry.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );
  const replacements: { start: number; end: number; kind: string }[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === "import.meta.glob"
    ) {
      const text = node.getText(source);
      const kind = text.includes("?playground-meta")
        ? "meta"
        : text.includes("?playground-markdown")
          ? "guidance"
          : text.includes("?raw")
            ? "markdown"
            : "component";
      replacements.push({ start: node.getStart(source), end: node.end, kind });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (replacements.length !== 4)
    throw new Error(`Expected four page globs, found ${replacements.length}`);
  for (const { start, end, kind } of replacements.reverse()) {
    code =
      code.slice(0, start) +
      `__liveModules(${JSON.stringify(kind)})` +
      code.slice(end);
  }
  return `
function __liveModules(kind) {
  const files = globalThis.__PLAYGROUND_FILES__;
  if (!Array.isArray(files)) throw new Error("Missing live playground page manifest");
  return Object.fromEntries(files.filter(file => kind === "markdown" ? /\\.mdx?$/.test(file) : file.endsWith(".tsx"))
    .map(file => ["./pages/" + file, async () => {
      if (kind === "component") throw new Error("Browser pages must render in PageFrame");
      const response = await fetch("/__playground/browser-page?" + new URLSearchParams({file, kind}));
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }]));
}
${code}`;
}
