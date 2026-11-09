import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { build, type Plugin, type Rollup } from "vite";
import { registerBookmarkletMiddleware } from "./bookmarklet-middleware";
export { registerBookmarkletMiddleware } from "./bookmarklet-middleware";
import {
  BOOKMARKLET_ROUTE,
} from "../src/bookmarklet/model";

export function playgroundBookmarklet(options: {
  root: string;
  dir: string;
  compiled?: boolean;
}): Plugin {
  let script = "";
  let bundleError: string | undefined;
  let watcher: Rollup.RollupWatcher | undefined;
  const bundle = async (watch: boolean) => {
    let ready: () => void;
    let failed: (reason: unknown) => void;
    const first = new Promise<void>((yes, no) => {
      ready = yes;
      failed = no;
    });
    const result = await build({
      configFile: false,
      root: options.root,
      logLevel: "warn",
      build: {
        write: false,
        emptyOutDir: false,
        ...(watch ? { watch: {} } : {}),
        lib: {
          entry: resolve(options.root, "src/bookmarklet/host.ts"),
          name: "PlaygroundGrabber",
          formats: ["iife"],
        },
        rolldownOptions: { output: { codeSplitting: false } },
      },
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
            ready();
          },
        },
      ],
    });
    if ("on" in result) {
      watcher = result;
      watcher.on("event", (event) => {
        if (event.code === "ERROR") {
          script = "";
          bundleError = event.error.message;
          failed(event.error);
        }
      });
    }
    await first;
  };

  return {
    name: "playground-bookmarklet",
    async configureServer(server) {
      if (options.compiled) {
        script = readFileSync(resolve(options.root, "dist", BOOKMARKLET_ROUTE.slice(1)), "utf8");
      } else {
        await bundle(true);
      }
      registerBookmarkletMiddleware({ middlewares: server.middlewares, dir: options.dir, script: () => script, bundleError: () => bundleError });
      server.httpServer?.once("close", () => {
        void watcher?.close();
      });
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
      await bundle(false);
      this.emitFile({
        type: "asset",
        fileName: BOOKMARKLET_ROUTE.slice(1),
        source: script,
      });
    },
  };
}
