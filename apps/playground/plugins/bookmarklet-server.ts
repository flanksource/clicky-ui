import { isAbsolute, resolve } from "node:path";
import { existsSync, readFileSync, watch, type FSWatcher } from "node:fs";
import { build, type InlineConfig, type Plugin } from "vite";
import { registerBookmarkletMiddleware } from "./bookmarklet-middleware";
export { registerBookmarkletMiddleware } from "./bookmarklet-middleware";
import {
  BOOKMARKLET_ROUTE,
} from "../src/bookmarklet/model";

/** The grabber host as one classic script defining `PlaygroundGrabber`; shared by the bookmarklet and the Chrome extension. */
export function grabberHostBuild(root: string) {
  return {
    configFile: false,
    root,
    logLevel: "warn",
    publicDir: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      emptyOutDir: false,
      lib: {
        entry: resolve(root, "src/bookmarklet/host.ts"),
        name: "PlaygroundGrabber",
        formats: ["iife"],
      },
      rolldownOptions: { output: { codeSplitting: false } },
    },
  } satisfies InlineConfig;
}

export function playgroundBookmarklet(options: {
  root: string;
  dir: string;
  compiled?: boolean;
}): Plugin {
  let script = "";
  let bundleError: string | undefined;
  let dependencies = new Set<string>();
  const bundle = async () => {
    const config = grabberHostBuild(options.root);
    await build({
      ...config,
      build: { ...config.build, write: false },
      plugins: [
        {
          name: "playground-bookmarklet-output",
          generateBundle(_output, files) {
            const entry = Object.values(files).find(
              (file) => file.type === "chunk" && file.isEntry,
            );
            if (!entry || entry.type !== "chunk")
              throw new Error("Bookmarklet entry was not emitted");
            script = entry.code;
            bundleError = undefined;
            dependencies = new Set([...this.getModuleIds()].map(path => path.split("?")[0]!));
          },
        },
      ],
    });
  };

  return {
    name: "playground-bookmarklet",
    async configureServer(server) {
      if (options.compiled) {
        script = readFileSync(resolve(options.root, "dist", BOOKMARKLET_ROUTE.slice(1)), "utf8");
      } else {
        await bundle();
        let rebuild = Promise.resolve();
        const watchers = new Map<string, FSWatcher>();
        const observe = () => {
          for (const path of dependencies) {
            if (!isAbsolute(path) || !existsSync(path) || watchers.has(path)) continue;
            const watcher = watch(path, { persistent: false }, () => changed(path));
            watcher.on("error", cause => { script = ""; bundleError = cause.message; });
            watchers.set(path, watcher);
          }
        };
        const changed = (path: string) => {
          if (!dependencies.has(path)) return;
          rebuild = rebuild.then(bundle).then(observe).catch((cause: unknown) => {
            script = "";
            bundleError = cause instanceof Error ? cause.message : String(cause);
          });
        };
        observe();
        server.httpServer?.once("close", () => { for (const watcher of watchers.values()) watcher.close(); });
      }
      registerBookmarkletMiddleware({ middlewares: server.middlewares, dir: options.dir, script: () => script, bundleError: () => bundleError });
    },
    configurePreviewServer(server) {
      script = readFileSync(
        resolve(
          options.root,
          server.config.build.outDir,
          BOOKMARKLET_ROUTE.slice(1),
        ),
        "utf8",
      );
      registerBookmarkletMiddleware({ middlewares: server.middlewares, dir: options.dir, script: () => script, bundleError: () => bundleError });
    },
    async generateBundle() {
      await bundle();
      this.emitFile({
        type: "asset",
        fileName: BOOKMARKLET_ROUTE.slice(1),
        source: script,
      });
    },
  };
}
