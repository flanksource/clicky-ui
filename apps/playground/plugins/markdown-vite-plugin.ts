import fs from "node:fs";
import path from "node:path";

import type { Plugin } from "vite";

import { extractPageGuidance, type GuidanceHost } from "./markdown-extractor";

const QUERY = "?playground-markdown";
const EXTENSIONS = ["", ".tsx", ".ts", ".jsx", ".js"];

export function playgroundMarkdown(options: { sourceRoot: string }): Plugin {
  const sourceRoot = fs.realpathSync(options.sourceRoot);

  return {
    name: "playground-markdown",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return undefined;
      const request = source.slice(0, -QUERY.length);
      const file = path.isAbsolute(request)
        ? request
        : path.resolve(importer ? path.dirname(importer) : sourceRoot, request);
      return `${file}${QUERY}`;
    },
    load(id) {
      if (!id.endsWith(QUERY)) return undefined;
      const entry = checkedFile(id.slice(0, -QUERY.length), sourceRoot);
      const host = filesystemGuidanceHost(sourceRoot);
      const result = extractPageGuidance(entry, host);
      for (const dependency of result.dependencies) this.addWatchFile(dependency);
      return `export default ${JSON.stringify(result.guidance)};`;
    },
  };
}

function filesystemGuidanceHost(sourceRoot: string): GuidanceHost {
  return {
    read(file) {
      return fs.readFileSync(checkedFile(file, sourceRoot), "utf8");
    },
    resolve(importer, specifier) {
      if (!specifier.startsWith(".")) return undefined;
      const base = path.resolve(path.dirname(importer), specifier);
      for (const extension of EXTENSIONS) {
        const candidate = `${base}${extension}`;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return checkedFile(candidate, sourceRoot);
        }
      }
      for (const extension of EXTENSIONS.slice(1)) {
        const candidate = path.join(base, `index${extension}`);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return checkedFile(candidate, sourceRoot);
        }
      }
      return undefined;
    },
  };
}

function checkedFile(file: string, sourceRoot: string): string {
  const real = fs.realpathSync(file);
  if (real !== sourceRoot && !real.startsWith(`${sourceRoot}${path.sep}`)) {
    throw new Error(`guidance source escapes playground src: ${file}`);
  }
  return real;
}
