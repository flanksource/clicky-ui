import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { extractPageMeta } from "./page-meta-extractor";

const QUERY = "?playground-meta";

export function playgroundPageMeta(options: { sourceRoot: string }): Plugin {
  const root = fs.realpathSync(options.sourceRoot);
  return {
    name: "playground-page-meta",
    enforce: "pre",
    configureServer(server) {
      const invalidateRegistry = (file: string) => {
        if (
          !file.startsWith(`${root}${path.sep}pages${path.sep}`) ||
          !/\.(tsx|md|mdx)$/.test(file)
        )
          return;
        for (const environment of Object.values(server.environments)) {
          const registry = environment.moduleGraph.getModuleById(
            path.join(root, "registry.ts"),
          );
          if (registry) environment.moduleGraph.invalidateModule(registry);
        }
      };
      server.watcher.on("add", invalidateRegistry);
      server.watcher.on("unlink", invalidateRegistry);
      server.httpServer?.once("close", () => {
        server.watcher.off("add", invalidateRegistry);
        server.watcher.off("unlink", invalidateRegistry);
      });
    },
    async resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return;
      const request = source.slice(0, -QUERY.length);
      const resolved = await this.resolve(request, importer?.split("?")[0], {
        skipSelf: true,
      });
      if (!resolved)
        throw new Error(`Cannot resolve metadata source: ${source}`);
      return `${resolved.id}${QUERY}`;
    },
    load(id) {
      if (!id.endsWith(QUERY)) return;
      const file = fs.realpathSync(id.slice(0, -QUERY.length));
      if (!file.startsWith(`${root}${path.sep}`))
        throw new Error(`metadata source escapes playground src: ${file}`);
      this.addWatchFile(file);
      return extractPageMeta(file, fs.readFileSync(file, "utf8"));
    },
  };
}
