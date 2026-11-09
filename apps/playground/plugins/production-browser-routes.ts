import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { sourceFile, type SourceRoot } from "./source-roots";
import type { Middleware } from "./middleware";
import { frameSource, readBrowserProject, readCompatibility, withFrameProviders } from "./production-project";
import { linkedSourceFile } from "./production-links";
import { readStaticExports } from "./static-metadata";
import { extractPageGuidance, memoryGuidanceHost } from "./markdown-extractor";
import { pageFiles, resolveBrowserPage } from "./production-registry";
import { liveSourceGraph } from "./production-source-graph";

export function productionBrowserRoutes(options: { root: string; sourceRoots: SourceRoot[] }): Middleware {
  return (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://playground.local");
    const image = url.pathname.startsWith("/src/pages/") && /\.(png|jpe?g|gif|svg|webp|avif)$/.test(url.pathname);
    if (!image && !url.pathname.startsWith("/__playground/browser-") && !options.sourceRoots.some(root => url.pathname.startsWith(root.url)) && !url.pathname.startsWith("/__playground/page-links/")) { next(); return; }
    void (async () => {
      if (request.method !== "GET") { response.writeHead(405).end("GET required"); return; }
      if (image) {
        const file = sourceFile(`http://playground.local/__images/${url.pathname.slice("/src/pages/".length)}`, [{ directory: resolve(options.root, "src/pages"), url: "/__images/" }]);
        if (!file) throw new Error(`Unknown page image ${url.pathname}`);
        const extension = extname(file).slice(1);
        response.writeHead(200, { "Content-Type": `image/${extension === "svg" ? "svg+xml" : extension === "jpg" ? "jpeg" : extension}`, "Cache-Control": "no-store" }).end(await readFile(file)); return;
      }
      const json = (value: unknown) => { response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" }).end(JSON.stringify(value)); };
      const linked = /^\/__playground\/page-links\/([A-Za-z0-9_-]+)\/(.+)$/.exec(url.pathname);
      if (linked) {
        const id = linked[1]!;
        const path = decodeURIComponent(linked[2]!);
        if (path.split("/").some(part => !part || part === "." || part === "..") || path.includes("\\")) throw new Error("Invalid linked source path");
        const bytes = id === "playground-shell" ? await frameSource({ ...options, path }) : await readFile(await linkedSourceFile({ ...options, id, path }));
        response.writeHead(200, { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" }).end(bytes); return;
      }
      if (url.pathname === "/__playground/browser-compatibility") { json(await readCompatibility(options.root)); return; }
      if (url.pathname === "/__playground/browser-files") { json(await pageFiles(options.root)); return; }
      if (url.pathname === "/__playground/browser-project") {
        const slug = url.searchParams.get("slug");
        if (!slug) throw new Error("browser-project requires slug");
        json(await withFrameProviders({ root: options.root, project: await readBrowserProject({ ...options, slug, packages: url.searchParams.getAll("package") }) })); return;
      }
      if (url.pathname === "/__playground/browser-page") {
        const file = url.searchParams.get("file");
        if (!file || !(await pageFiles(options.root)).includes(file)) throw new Error(`Unknown playground page ${file}`);
        const path = await resolveBrowserPage({ ...options, slug: file.replace(/\.(tsx|mdx?)$/, "") });
        const kind = url.searchParams.get("kind");
        if (kind === "meta") {
          const meta = readStaticExports({ file: path, roots: options.sourceRoots.map(root => root.directory), names: ["meta"] }).meta;
          json(meta ?? null); return;
        }
        if (kind === "markdown") { json(await readFile(path, "utf8")); return; }
        if (kind !== "guidance") throw new Error(`Unsupported browser-page projection ${kind}`);
        const files = await liveSourceGraph({ ...options, files: [path], aliases: {}, libraryImports: [], allowedRoots: options.sourceRoots.map(root => root.directory) });
        const sources = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(file, "utf8")])));
        json(extractPageGuidance(path, memoryGuidanceHost(sources)).guidance); return;
      }
      const file = sourceFile(url.href, options.sourceRoots);
      if (!file) { response.writeHead(404).end("Unknown source root"); return; }
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }).end(await readFile(file));
    })().catch(next);
  };
}
