import { resolve } from "node:path";
import { compile } from "@tailwindcss/node";
import type { Plugin } from "vite";

export function svgPreview({ root, workspaceRoot }: { root: string; workspaceRoot: string }): Plugin {
  return {
    name: "playground-svg-preview",
    configureServer(server) {
      let compiler: ReturnType<typeof compile> | undefined;
      const dependencies = new Set<string>();
      server.watcher.on("change", file => { if (dependencies.has(file)) compiler = undefined; });
      server.middlewares.use("/__playground/svg-preview", (req, res) => {
        void (async () => {
          try {
            if (req.method !== "GET") { res.statusCode = 405; res.end("Use GET"); return; }
            const classes = new URL(req.url ?? "", "http://localhost").searchParams.get("classes");
            if (classes === null || classes.length > 16000) { res.statusCode = 400; res.end("Expected classes (maximum 16000 characters)"); return; }
            const tokens = resolve(workspaceRoot, "packages/ui/src/styles/tokens.css");
            const config = resolve(root, "tailwind.config.ts");
            dependencies.add(tokens);
            dependencies.add(config);
            compiler ??= compile(`@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" layer(utilities) source(none);\n@config ${JSON.stringify(config)};\n@reference ${JSON.stringify(tokens)};`, {
              base: root, onDependency: file => { dependencies.add(file); },
            });
            const css = (await compiler).build(classes.split(/\s+/).filter(Boolean));
            res.setHeader("Content-Type", "text/css");
            res.setHeader("Cache-Control", "no-store");
            res.end(css);
          } catch (error) {
            compiler = undefined;
            res.statusCode = 500;
            res.end(error instanceof Error ? error.message : String(error));
          }
        })();
      });
    },
  };
}
