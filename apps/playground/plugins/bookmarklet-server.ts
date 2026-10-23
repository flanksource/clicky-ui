import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build, type Connect, type Plugin, type Rollup } from "vite";
import {
  BOOKMARKLET_ROUTE,
  EXTERNAL_PAGES_ROUTE,
  externalUrl,
} from "../src/bookmarklet/model";
import { readJsonBody, sendJson } from "./comments-server";
import {
  associateExternalPage,
  readExternalPages,
} from "./external-pages-store";

export function playgroundBookmarklet(options: {
  root: string;
  dir: string;
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
        rollupOptions: { output: { inlineDynamicImports: true } },
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
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://playground.local");
    if (url.pathname === BOOKMARKLET_ROUTE) {
      if (!script)
        return sendJson(res, 503, {
          error: bundleError ?? "Bookmarklet bundle is not ready",
        });
      res.setHeader("Content-Type", "text/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(script);
      return;
    }
    if (url.pathname === `${EXTERNAL_PAGES_ROUTE}/html`) {
      if (req.method !== "GET")
        return sendJson(res, 405, { error: "Expected GET" });
      try {
        const page = readExternalPages(options.dir).find(
          (entry) => entry.id === url.searchParams.get("page"),
        );
        const source = url.searchParams.get("url");
        if (!page || !source || !page.urls.includes(source))
          return sendJson(res, 404, {
            error: "Registered external page not found",
          });
        const file = new URL(source);
        if (file.protocol !== "file:" || !/\.html?$/i.test(file.pathname))
          return sendJson(res, 400, {
            error: "Expected a registered local HTML file",
          });
        const html = readFileSync(fileURLToPath(file), "utf8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Security-Policy", "sandbox allow-scripts");
        res.end(html);
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return;
    }
    if (url.pathname !== EXTERNAL_PAGES_ROUTE) return next();
    void (async () => {
      try {
        if (req.method === "GET") {
          const pages = readExternalPages(options.dir);
          const input = url.searchParams.get("url");
          if (input === null) return sendJson(res, 200, { pages });
          const target = externalUrl(input);
          return sendJson(res, 200, {
            page: pages.find((page) => page.urls.includes(target.url)) ?? null,
            candidates: pages.filter((page) => page.base === target.base),
          });
        }
        if (req.method === "POST") {
          return sendJson(res, 200, {
            page: associateExternalPage(options.dir, await readJsonBody(req)),
          });
        }
        sendJson(res, 405, { error: "Expected GET or POST" });
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  };
  return {
    name: "playground-bookmarklet",
    async configureServer(server) {
      await bundle(true);
      server.middlewares.use(middleware);
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
      server.middlewares.use(middleware);
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
