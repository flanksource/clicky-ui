import { relative, resolve, sep } from "node:path";
import type { Connect, Plugin } from "vite";
import { NAVIGATION_ROUTE } from "../src/navigation/types";
import { sendJson } from "./comments-server";
import type { DocumentProblems } from "./document-problems";
import type { GavelEndpoint } from "./gavel-launch-server";
import { createNavigation, parseNavigationQuery } from "./navigation/service";
import type { PageMetaLoader } from "./navigation/sources";

function failure(cause: unknown): { status: number; error: string } {
  const error = cause instanceof Error ? cause.message : String(cause);
  const { status, statusCode } = (cause ?? {}) as { status?: unknown; statusCode?: unknown };
  const code = [status, statusCode].find((value): value is number => typeof value === "number" && value >= 400 && value < 600);
  return { status: code ?? 500, error };
}

/**
 * `GET /__playground/navigation`: every node of the sidebar tree (pages,
 * repository documents, external pages) with comment activity, lint problems,
 * filter, sort, age and search applied on the server. See
 * `src/navigation/types.ts` for the contract.
 *
 * Page `meta` is evaluated through the dev server's module graph; the preview
 * server has none, so previews label pages from their slug unless `loadMeta`
 * is given.
 */
export function playgroundNavigation({
  dir,
  pagesDir,
  endpoint,
  problems,
  loadMeta,
}: {
  dir: string;
  pagesDir: string;
  endpoint: GavelEndpoint;
  problems: () => Promise<DocumentProblems>;
  loadMeta?: PageMetaLoader;
}): Plugin {
  const register = (middlewares: Connect.Server, pageMeta: PageMetaLoader | undefined) => {
    const navigation = createNavigation({ dir, pagesDir, endpoint, problems, loadMeta: pageMeta });
    middlewares.use(NAVIGATION_ROUTE, (req, res) => {
      if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendJson(res, 405, { error: "Navigation only supports GET" });
      }
      void (async () => {
        const url = new URL(req.url ?? "/", "http://playground.local");
        sendJson(res, 200, await navigation.children(parseNavigationQuery(url.searchParams)));
      })().catch((cause: unknown) => {
        const { status, error } = failure(cause);
        sendJson(res, status, { error });
      });
    });
    return navigation;
  };
  return {
    name: "playground-navigation",
    configureServer(server) {
      const navigation = register(
        server.middlewares,
        loadMeta ?? (async (file) => (await server.ssrLoadModule(`/${relative(server.config.root, file)}?playground-meta`))["default"]),
      );
      const source = resolve(server.config.root, "src") + sep;
      const onChange = (_event: string, file: string) => {
        if (resolve(file).startsWith(source)) navigation.clearMeta();
      };
      server.watcher.on("all", onChange);
      server.httpServer?.once("close", () => server.watcher.off("all", onChange));
    },
    configurePreviewServer(server) {
      register(server.middlewares, loadMeta);
    },
  };
}
