import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Plugin } from "vite";
import type { MiddlewareApp } from "./middleware";
import { sourceFile, sourceRoots, type SourceRoot } from "./source-roots";
import { directoryVocabulary } from "./vocabulary-directories";
import { registerCommentVocabulary } from "./vocabulary-registry";
import { sendJson } from "./comments-server";

export function registerVocabulariesMiddleware({ middlewares, dir, roots, sourceRoots: mappings, pagesDir }: {
  middlewares: MiddlewareApp;
  dir: string;
  roots: string[];
  sourceRoots: readonly SourceRoot[];
  pagesDir?: string;
}): () => void {
  const registry = directoryVocabulary({ roots, sourceRoots: sourceRoots(mappings), ...(pagesDir ? { pagesDir } : {}) });
  const dispose = registerCommentVocabulary(dir, registry);
  middlewares.use((request, response, next) => {
    const path = new URL(request.url ?? "/", "http://playground").pathname;
    if (path !== "/__playground/vocabularies" && !path.startsWith("/__playground/comments")) return next();
    if (path === "/__playground/vocabularies" && request.method !== "GET") return sendJson(response, 405, { error: "Vocabulary discovery requires GET" });
    void registry.refresh().then(snapshot => {
      if (path === "/__playground/vocabularies") sendJson(response, 200, snapshot);
      else next();
    }).catch(cause => sendJson(response, 500, { error: `Vocabulary loading failed: ${cause instanceof Error ? cause.message : String(cause)}` }));
  });
  return dispose;
}

export function playgroundVocabularies({ dir, roots, pagesDir }: { dir: string; roots: string[]; pagesDir?: string }): Plugin {
  const directories = roots.map(root => realpathSync(resolve(root)));
  let dispose: (() => void) | undefined;
  let mappings: SourceRoot[] = [];
  return {
    name: "playground-vocabularies",
    enforce: "pre",
    config() { return { resolve: { dedupe: ["react", "react-dom"] } }; },
    async resolveId(source, importer) {
      const file = sourceFile(source, mappings);
      if (file) return file + (source.includes("?") ? `?${source.split("?")[1]}` : "");
      const version = new URLSearchParams(importer?.split("?")[1]).get("vocabVersion");
      if (!version || (!source.startsWith(".") && !source.startsWith("/"))) return;
      const resolved = await this.resolve(source, importer!.split("?")[0], { skipSelf: true });
      if (resolved && mappings.some(root => resolved.id.startsWith(root.directory + sep))) {
        const query = (resolved.id.split("?")[1] ?? "").split("&").filter(part => part && !part.startsWith("vocabVersion="));
        query.push(`vocabVersion=${encodeURIComponent(version)}`);
        return `${resolved.id.split("?")[0]}?${query.join("&")}`;
      }
      return;
    },
    async load(id) {
      const [path, query] = id.split("?");
      if (!path!.endsWith(".json") || !new URLSearchParams(query).has("vocabVersion")) return;
      // Vite's native JSON transform skips ids carrying the vocabVersion query, so this plugin, which adds that query, loads them as JSON modules.
      const value: unknown = JSON.parse(await readFile(path!, "utf8"));
      const named = value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).filter(key => key !== "default") : [];
      return [
        `const json = ${JSON.stringify(value)};`, "export default json;",
        ...named.map((key, index) => `const json${index} = json[${JSON.stringify(key)}]; export { json${index} as ${JSON.stringify(key)} };`),
      ].join("\n");
    },
    configureServer(server) {
      server.config.server.fs.allow.push(...directories);
      mappings = sourceRoots([...new Set([...directories, ...server.config.server.fs.allow])].map((directory, index) => ({ directory, url: `/__playground/vocabulary-source/${index}/` })));
      dispose = registerVocabulariesMiddleware({ middlewares: server.middlewares, dir, roots: directories, sourceRoots: mappings, ...(pagesDir ? { pagesDir } : {}) });
      server.httpServer?.once("close", () => dispose?.());
    },
    closeBundle() { dispose?.(); },
  };
}
