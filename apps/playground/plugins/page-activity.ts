import { readdirSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import type { Plugin } from "vite";

const ID = "virtual:playground-page-activity";
const RESOLVED = `\0${ID}`;

function pageUpdates(pagesDir: string): Record<string, string> {
  const updates: Record<string, string> = {};
  function walk(directory: string, prefix: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
      if (entry.isSymbolicLink()) throw new Error(`Page activity cannot traverse symbolic link ${join(directory, entry.name)}`);
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path, `${prefix}${entry.name}/`);
      else if (entry.isFile() && entry.name.endsWith(".tsx") && !/\.(test|stories)\.tsx$/.test(entry.name)) updates[`${prefix}${entry.name.slice(0, -4)}`] = statSync(path).mtime.toISOString();
    }
  }
  walk(pagesDir, "");
  return updates;
}

export function playgroundPageActivity(pagesDir: string): Plugin {
  return {
    name: "playground-page-activity",
    resolveId: (id) => id === ID ? RESOLVED : undefined,
    load: (id) => id === RESOLVED ? `export default ${JSON.stringify(pageUpdates(pagesDir))}` : undefined,
    configureServer(server) {
      server.middlewares.use("/__playground/page-activity", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.setHeader("Allow", "GET");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Page activity only supports GET" }));
          return;
        }
        try {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ updated: pageUpdates(pagesDir) }));
        } catch (cause) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: cause instanceof Error ? cause.message : String(cause) }));
        }
      });
      server.watcher.on("all", (_event, file) => {
        if (!resolve(file).startsWith(resolve(pagesDir) + sep)) return;
        const module = server.moduleGraph.getModuleById(RESOLVED);
        if (module) server.moduleGraph.invalidateModule(module);
      });
    },
  };
}
