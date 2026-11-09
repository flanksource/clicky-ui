import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import ts from "typescript";

import type { GuidanceHost } from "./markdown-static-evaluator";

export type PageModuleGraph = {
  /** The page and every module it reaches through relative imports, absolute, inside `pagesDir`. */
  files: string[];
  /** Resolved relative imports that land outside `pagesDir`. */
  external: string[];
};

const CODE_EXTENSIONS = [".tsx", ".ts"] as const;

function isFile(file: string): boolean {
  return existsSync(file) && statSync(file).isFile();
}

export function diskModuleHost(): GuidanceHost {
  return {
    read: (file) => (isFile(file) ? readFileSync(file, "utf8") : undefined),
    resolve(importer, specifier) {
      if (!specifier.startsWith(".")) return undefined;
      const base = resolve(dirname(importer), specifier.replace(/[?#].*$/, ""));
      const candidates = [
        ...(CODE_EXTENSIONS.some((e) => base.endsWith(e)) ? [base] : []),
        ...CODE_EXTENSIONS.map((e) => `${base}${e}`),
        ...CODE_EXTENSIONS.map((e) => `${base}${sep}index${e}`),
      ];
      return candidates.find(isFile);
    },
  };
}

/**
 * Breadth-first walk of the relative imports reachable from `pageFile`: static
 * imports, re-exports and dynamic `import("./x")` (the `lazy()` pages use).
 * Bare package specifiers and non-code assets are not part of the graph.
 */
export function pageModuleGraph(options: { host: GuidanceHost; pageFile: string; pagesDir: string }): PageModuleGraph {
  const { host, pageFile, pagesDir } = options;
  const root = resolve(pagesDir) + sep;
  const files: string[] = [];
  const external = new Set<string>();
  const queue = [resolve(pageFile)];
  const seen = new Set(queue);

  for (let file = queue.shift(); file !== undefined; file = queue.shift()) {
    if (!file.startsWith(root)) {
      external.add(file);
      continue;
    }
    const text = host.read(file);
    if (text === undefined) throw new Error(`cannot read ${file} while building the module graph of ${pageFile}`);
    files.push(file);
    for (const { fileName } of ts.preProcessFile(text, true, true).importedFiles) {
      const target = host.resolve(file, fileName);
      if (target !== undefined && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return { files, external: [...external] };
}
