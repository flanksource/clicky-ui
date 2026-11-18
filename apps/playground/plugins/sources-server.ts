import type { MiddlewareApp, ErrorLogger } from "./middleware";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, isAbsolute, relative, sep } from "node:path";
import type { Plugin } from "vite";

import { deleteFolder, deletePage, movePage } from "./page-management-store";
import { deleteReviewable, markReviewable } from "./reviewable-store";
import {
  PageStoreError,
  assertPageExtension,
  assertSlug,
  createFolder,
  createSource,
  folderPath,
  listFolderPages,
  listFolders,
  pagePath,
  pagesFilePath,
  readPagesFile,
  readSource,
  sourceExists,
  writePagesFile,
  writeSource,
} from "./pages-store";

export const SOURCES_ROUTE = "/__playground/sources";

export type SourceRoute =
  | "folders"
  | "read"
  | "create-page"
  | "create-folder"
  | "delete-folder"
  | "mark-reviewable"
  | "delete-reviewable"
  | "write"
  | "read-file"
  | "write-file"
  | "move"
  | "delete";

/**
 * `hasTarget` is whether the request names what it acts on — `?slug=` under
 * `/`, `?folder=` under `/folders`, `?file=` under `/files`. Every destructive
 * route needs one.
 */
export function matchSourceRoute(
  method: string,
  pathname: string,
  hasTarget: boolean,
): SourceRoute | undefined {
  if (pathname === "/folders") {
    if (method === "POST") return "create-folder";
    return method === "DELETE" && hasTarget ? "delete-folder" : undefined;
  }
  if (pathname === "/reviewables") {
    if (method === "POST") return "mark-reviewable";
    if (method === "DELETE") return "delete-reviewable";
    return undefined;
  }
  if (pathname === "/files") {
    if (!hasTarget) return undefined;
    if (method === "GET") return "read-file";
    return method === "PUT" ? "write-file" : undefined;
  }
  if (pathname !== "/") return undefined;

  if (method === "GET") return hasTarget ? "read" : "folders";
  if (method === "POST") return "create-page";
  if (method === "PUT" && hasTarget) return "write";
  if (method === "PATCH") return "move";
  if (method === "DELETE" && hasTarget) return "delete";
  return undefined;
}

export function filterDeletedPageModules<T extends { file: string | null }>(
  pagesDir: string,
  file: string,
  modules: readonly T[],
): T[] | undefined {
  const relativeFile = relative(pagesDir, file);
  if (
    relativeFile === "" ||
    relativeFile === ".." ||
    relativeFile.startsWith(`..${sep}`) ||
    isAbsolute(relativeFile)
  ) {
    return undefined;
  }
  return modules.filter((module) => module.file !== file);
}

async function readJsonBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw === "")
    throw new Error(`${req.method} ${SOURCES_ROUTE} expects a JSON body`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `request body is not valid JSON (${(error as Error).message})`,
    );
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
  if (typeof source !== "string")
    throw new Error('request requires a string "source"');
  return source;
}

function requireString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value === "") {
    throw new PageStoreError(`${key} must be a non-empty string`, 400);
  }
  return value;
}

function optionalString(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value === "") {
    throw new PageStoreError(`${key} must be a non-empty string`, 400);
  }
  return value;
}

function optionalTitle(body: Record<string, unknown>): string | undefined {
  const title = body["title"];
  if (title === undefined) return undefined;
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error('"title" must be a non-empty string');
  }
  return title;
}

function optionalPositiveInteger(
  body: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new PageStoreError(`${key} must be a positive integer`, 400);
  }
  return value as number;
}

export type SourceEvents = {
  created: (file: string) => void;
  changed: (file: string) => void;
  deleted: (file: string) => void;
  folderCreated: (folder: string) => void;
  folderDeleted: (folder: string) => void;
};

export function announcePageMove(
  pagesDir: string,
  events: SourceEvents,
  slug: string,
  nextSlug: string,
): void {
  if (slug === nextSlug) {
    events.changed(pagePath(pagesDir, nextSlug));
    return;
  }
  // One glob invalidation discovers both the removed source and destination;
  // separate unlink/add updates race React refresh boundaries.
  events.created(pagePath(pagesDir, nextSlug));
}

export type SourcesOptions = {
  pagesDir: string;
  commentsDir: string;
  /** Root that a read's `path` is relative to, so it matches the paths linters report. */
  workspaceRoot: string;
};

async function handle(
  { pagesDir, commentsDir, workspaceRoot }: SourcesOptions,
  events: SourceEvents,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const slugParam = url.searchParams.get("slug");
  const folderParam = url.searchParams.get("folder");
  const fileParam = url.searchParams.get("file");
  const route = matchSourceRoute(
    req.method ?? "",
    url.pathname,
    slugParam !== null || folderParam !== null || fileParam !== null,
  );
  if (!route) {
    return sendJson(res, 405, {
      error: `${req.method} ${SOURCES_ROUTE}${url.pathname} is not supported`,
    });
  }

  switch (route) {
    case "mark-reviewable":
      return readJsonBody(req).then(async (body) => {
        const slug = assertSlug(body["slug"]);
        const line = optionalPositiveInteger(body, "line");
        const column = optionalPositiveInteger(body, "column");
        const domId = optionalString(body, "domId");
        const sourcePath = optionalString(body, "sourcePath");
        const result = markReviewable({
          pagesDir,
          commentsDir,
          slug,
          expectedSource: requireString(body, "expectedSource"),
          ...(domId ? { domId } : {}),
          ...(sourcePath ? { sourcePath } : {}),
          ...(line ? { line } : {}),
          ...(column ? { column } : {}),
        });
        events.changed(pagePath(pagesDir, slug));
        sendJson(res, 200, { reviewId: result.reviewId });
      });

    case "delete-reviewable":
      return readJsonBody(req).then(async (body) => {
        const slug = assertSlug(body["slug"]);
        const associated = body["associatedCommentIds"];
        if (
          !Array.isArray(associated) ||
          associated.some((id) => typeof id !== "string")
        ) {
          throw new PageStoreError(
            "associatedCommentIds must be an array of comment ids",
            400,
          );
        }
        const result = await deleteReviewable({
          pagesDir,
          commentsDir,
          slug,
          expectedSource: requireString(body, "expectedSource"),
          reviewId: requireString(body, "reviewId"),
          associatedCommentIds: associated,
        });
        events.changed(pagePath(pagesDir, slug));
        sendJson(res, 200, { removedComments: result.removedComments });
      });

    case "folders":
      return sendJson(res, 200, { folders: listFolders(pagesDir) });

    case "read": {
      const slug = assertSlug(slugParam);
      return sendJson(res, 200, {
        slug,
        source: readSource(pagesDir, slug),
        path: relative(workspaceRoot, pagePath(pagesDir, slug)),
      });
    }

    case "write":
      return readJsonBody(req).then(async (body) => {
        const slug = assertSlug(body["slug"] ?? slugParam);
        if (!sourceExists(pagesDir, slug)) {
          throw new PageStoreError(
            `page "${slug}" does not exist — create it first`,
            404,
          );
        }
        writeSource(pagesDir, slug, requireSource(body));
        events.changed(pagePath(pagesDir, slug));
        sendJson(res, 200, { slug });
      });

    case "read-file": {
      const file = readPagesFile(pagesDir, fileParam ?? "");
      return sendJson(res, 200, {
        ...file,
        path: relative(workspaceRoot, pagesFilePath(pagesDir, file.file)),
      });
    }

    case "write-file":
      return readJsonBody(req).then(async (body) => {
        const written = writePagesFile(
          pagesDir,
          fileParam ?? "",
          requireSource(body),
          requireString(body, "expectedHash"),
        );
        events.changed(pagesFilePath(pagesDir, written.file));
        sendJson(res, 200, written);
      });

    case "create-page":
      return readJsonBody(req).then(async (body) => {
        const slug = assertSlug(body["slug"]);
        createSource(
          pagesDir,
          slug,
          requireSource(body),
          assertPageExtension(body["extension"]),
        );
        events.created(pagePath(pagesDir, slug));
        sendJson(res, 201, { slug });
      });

    case "create-folder":
      return readJsonBody(req).then(async (body) => {
        const folder = createFolder(pagesDir, assertSlug(body["folder"]));
        events.folderCreated(folderPath(pagesDir, folder));
        sendJson(res, 201, { folder });
      });

    case "move":
      return readJsonBody(req).then(async (body) => {
        const slug = assertSlug(body["slug"]);
        const nextSlug = assertSlug(body["nextSlug"]);
        const title = optionalTitle(body);
        const result = await movePage({
          sourceRoot: dirname(pagesDir),
          pagesDir,
          commentsDir,
          slug,
          nextSlug,
          ...(title !== undefined ? { title } : {}),
        });
        announcePageMove(pagesDir, events, slug, nextSlug);
        sendJson(res, 200, result);
      });

    case "delete": {
      const slug = assertSlug(slugParam);
      const file = pagePath(pagesDir, slug);
      const result = await deletePage({ pagesDir, commentsDir, slug });
      events.deleted(file);
      return sendJson(res, 200, result);
    }

    case "delete-folder": {
      const folder = assertSlug(folderParam);
      const directory = folderPath(pagesDir, folder);
      // Resolved before the delete: once a page is gone its extension is too.
      const files = listFolderPages(pagesDir, folder).map((slug) =>
        pagePath(pagesDir, slug),
      );
      const result = await deleteFolder({ pagesDir, commentsDir, folder });
      // One unlink per page so the glob drops each module, then the directory.
      for (const file of files) events.deleted(file);
      events.folderDeleted(directory);
      return sendJson(res, 200, result);
    }
  }
}

/**
 * Lets the in-browser Monaco editor read and write artifact sources under
 * `src/pages/`. Dev-server only: `vite build` output has no file backend, and
 * writes are confined to validated slugs inside the pages directory.
 */
export function playgroundSources(options: SourcesOptions): Plugin {
  return {
    name: "playground-sources",
    apply: "serve",
    hotUpdate: {
      order: "post",
      handler({ type, file, modules }) {
        if (type !== "delete") return;
        return filterDeletedPageModules(options.pagesDir, file, modules);
      },
    },
    configureServer(server) {
      // A file written through this endpoint is new to the watcher, and the
      // client navigates to it immediately afterwards. Announcing the add up
      // front makes `import.meta.glob` in the registry re-evaluate
      // deterministically instead of racing chokidar.
      const events: SourceEvents = {
        created: (file) => server.watcher.emit("add", file),
        changed: (file) => server.watcher.emit("change", file),
        deleted: (file) => server.watcher.emit("unlink", file),
        folderCreated: (folder) => server.watcher.emit("addDir", folder),
        folderDeleted: (folder) => server.watcher.emit("unlinkDir", folder),
      };

      registerSourcesMiddleware({ ...options, middlewares: server.middlewares, logger: server.config.logger, events });
    },
  };
}


export function registerSourcesMiddleware({ middlewares, logger, events, ...options }: SourcesOptions & { middlewares: MiddlewareApp; logger: ErrorLogger; events: SourceEvents }): void {
  middlewares.use(SOURCES_ROUTE, (req, res, next) => {
    void (async () => {
      try {
        await handle(options, events, req, res);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        logger.error(
          `[playground-sources] ${req.method} failed: ${message}`,
        );
        if (res.headersSent) {
          next(error);
          return;
        }
        sendJson(
          res,
          error instanceof PageStoreError ? error.statusCode : 400,
          {
            error: message,
          },
        );
      }
    })();
  });
}
