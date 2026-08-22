import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import { deletePage, movePage } from "./page-management-store";
import {
  PageStoreError,
  assertSlug,
  createFolder,
  createSource,
  folderPath,
  listFolders,
  pagePath,
  readSource,
  sourceExists,
  writeSource,
} from "./pages-store";

export const SOURCES_ROUTE = "/__playground/sources";

export type SourceRoute =
  | "folders"
  | "read"
  | "create-page"
  | "create-folder"
  | "write"
  | "move"
  | "delete";

export function matchSourceRoute(
  method: string,
  pathname: string,
  hasSlug: boolean,
): SourceRoute | undefined {
  if (pathname === "/folders") {
    return method === "POST" ? "create-folder" : undefined;
  }
  if (pathname !== "/") return undefined;

  if (method === "GET") return hasSlug ? "read" : "folders";
  if (method === "POST") return "create-page";
  if (method === "PUT" && hasSlug) return "write";
  if (method === "PATCH") return "move";
  if (method === "DELETE" && hasSlug) return "delete";
  return undefined;
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw === "") throw new Error(`${req.method} ${SOURCES_ROUTE} expects a JSON body`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`request body is not valid JSON (${(error as Error).message})`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("request body must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function requireSource(body: Record<string, unknown>): string {
  const source = body["source"];
  if (typeof source !== "string") throw new Error('request requires a string "source"');
  return source;
}

function optionalTitle(body: Record<string, unknown>): string | undefined {
  const title = body["title"];
  if (title === undefined) return undefined;
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error('"title" must be a non-empty string');
  }
  return title;
}

type SourceEvents = {
  created: (file: string) => void;
  changed: (file: string) => void;
  deleted: (file: string) => void;
  folderCreated: (folder: string) => void;
};

function handle(
  pagesDir: string,
  commentsDir: string,
  events: SourceEvents,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> | void {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const slugParam = url.searchParams.get("slug");
  const route = matchSourceRoute(req.method ?? "", url.pathname, slugParam !== null);
  if (!route) {
    return sendJson(res, 405, {
      error: `${req.method} ${SOURCES_ROUTE}${url.pathname} is not supported`,
    });
  }

  switch (route) {
    case "folders":
      return sendJson(res, 200, { folders: listFolders(pagesDir) });

    case "read": {
      const slug = assertSlug(slugParam);
      return sendJson(res, 200, { slug, source: readSource(pagesDir, slug) });
    }

    case "write":
      return readJsonBody(req).then((body) => {
        const slug = assertSlug(body["slug"] ?? slugParam);
        if (!sourceExists(pagesDir, slug)) {
          throw new PageStoreError(`page "${slug}" does not exist — create it first`, 404);
        }
        writeSource(pagesDir, slug, requireSource(body));
        sendJson(res, 200, { slug });
      });

    case "create-page":
      return readJsonBody(req).then((body) => {
        const slug = assertSlug(body["slug"]);
        createSource(pagesDir, slug, requireSource(body));
        events.created(pagePath(pagesDir, slug));
        sendJson(res, 201, { slug });
      });

    case "create-folder":
      return readJsonBody(req).then((body) => {
        const folder = createFolder(pagesDir, assertSlug(body["folder"]));
        events.folderCreated(folderPath(pagesDir, folder));
        sendJson(res, 201, { folder });
      });

    case "move":
      return readJsonBody(req).then((body) => {
        const slug = assertSlug(body["slug"]);
        const nextSlug = assertSlug(body["nextSlug"]);
        const title = optionalTitle(body);
        const result = movePage({
          pagesDir,
          commentsDir,
          slug,
          nextSlug,
          ...(title !== undefined ? { title } : {}),
        });
        if (slug === nextSlug) events.changed(pagePath(pagesDir, nextSlug));
        else {
          events.deleted(pagePath(pagesDir, slug));
          events.created(pagePath(pagesDir, nextSlug));
        }
        sendJson(res, 200, result);
      });

    case "delete": {
      const slug = assertSlug(slugParam);
      const file = pagePath(pagesDir, slug);
      const result = deletePage({ pagesDir, commentsDir, slug });
      events.deleted(file);
      return sendJson(res, 200, result);
    }
  }
}

/**
 * Lets the in-browser Monaco editor read and write artifact sources under
 * `src/pages/`. Dev-server only: `vite build` output has no file backend, and
 * writes are confined to validated slugs inside the pages directory.
 */
export function playgroundSources(options: { pagesDir: string; commentsDir: string }): Plugin {
  return {
    name: "playground-sources",
    apply: "serve",
    configureServer(server) {
      // A file written through this endpoint is new to the watcher, and the
      // client reloads immediately afterwards. Announcing the add up front
      // makes `import.meta.glob` in the registry re-evaluate deterministically
      // instead of racing chokidar.
      const events: SourceEvents = {
        created: (file) => server.watcher.emit("add", file),
        changed: (file) => server.watcher.emit("change", file),
        deleted: (file) => server.watcher.emit("unlink", file),
        folderCreated: (folder) => server.watcher.emit("addDir", folder),
      };

      server.middlewares.use(SOURCES_ROUTE, (req, res, next) => {
        void (async () => {
          try {
            await handle(options.pagesDir, options.commentsDir, events, req, res);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            server.config.logger.error(`[playground-sources] ${req.method} failed: ${message}`);
            if (res.headersSent) {
              next(error);
              return;
            }
            sendJson(res, error instanceof PageStoreError ? error.statusCode : 400, {
              error: message,
            });
          }
        })();
      });
    },
  };
}
