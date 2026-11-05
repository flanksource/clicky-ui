import { realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { directoryVocabulary } from "./vocabulary-directories";
import { registerCommentVocabulary } from "./vocabulary-registry";
import { sendJson } from "./comments-server";

export function playgroundVocabularies({ dir, roots }: { dir: string; roots: string[] }): Plugin {
  const directories = roots.map(root => realpathSync(resolve(root)));
  let dispose: (() => void) | undefined;
  return {
    name: "playground-vocabularies",
    enforce: "pre",
    config() { return { resolve: { dedupe: ["react", "react-dom"] } }; },
    async resolveId(source, importer) {
      const version = new URLSearchParams(importer?.split("?")[1]).get("vocabVersion");
      if (!version || (!source.startsWith(".") && !source.startsWith("/"))) return;
      const resolved = await this.resolve(source, importer!.split("?")[0], { skipSelf: true });
      if (resolved && directories.some(root => resolved.id.startsWith(root + sep))) {
        const query = (resolved.id.split("?")[1] ?? "").split("&").filter(part => part && !part.startsWith("vocabVersion="));
        query.push(`vocabVersion=${encodeURIComponent(version)}`);
        return `${resolved.id.split("?")[0]}?${query.join("&")}`;
      }
      return;
    },
    configureServer(server: ViteDevServer) {
      server.config.server.fs.allow.push(...directories);
      const registry = directoryVocabulary({ roots: directories, loadModule: file => server.ssrLoadModule(file), invalidate: files => {
        for (const file of files) for (const module of server.environments.ssr?.moduleGraph.getModulesByFile(file) ?? []) server.environments.ssr?.moduleGraph.invalidateModule(module);
      } });
      dispose = registerCommentVocabulary(dir, registry.items);
      server.httpServer?.once("close", () => dispose?.());
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url ?? "/", "http://playground").pathname;
        if (path !== "/__playground/vocabularies" && !path.startsWith("/__playground/comments")) return next();
        if (path === "/__playground/vocabularies" && request.method !== "GET") return sendJson(response, 405, { error: "Vocabulary discovery requires GET" });
        void registry.refresh().then(snapshot => {
          if (path === "/__playground/vocabularies") sendJson(response, 200, snapshot);
          else next();
        }).catch(cause => sendJson(response, 500, { error: `Vocabulary loading failed: ${cause instanceof Error ? cause.message : String(cause)}` }));
      });
    },
    closeBundle() { dispose?.(); },
  };
}
