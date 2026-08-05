import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import {
  assertSlug,
  createSource,
  pagePath,
  readSource,
  sourceExists,
  writeSource,
} from "./pages-store";

export const SOURCES_ROUTE = "/__playground/sources";

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

function handle(
  pagesDir: string,
  onCreated: (file: string) => void,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> | void {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const slugParam = url.searchParams.get("slug");

  switch (req.method) {
    case "GET": {
      const slug = assertSlug(slugParam);
      return sendJson(res, 200, { slug, source: readSource(pagesDir, slug) });
    }

    case "PUT":
      return readJsonBody(req).then((body) => {
        const slug = assertSlug(body["slug"] ?? slugParam);
        if (!sourceExists(pagesDir, slug)) {
          // Saving is for existing artifacts; creating goes through POST so a
          // typo in the slug cannot quietly spawn a new file.
          throw new Error(`page "${slug}" does not exist — create it first`);
        }
        writeSource(pagesDir, slug, requireSource(body));
        sendJson(res, 200, { slug });
      });

    case "POST":
      return readJsonBody(req).then((body) => {
        const slug = assertSlug(body["slug"]);
        createSource(pagesDir, slug, requireSource(body));
        onCreated(pagePath(pagesDir, slug));
        sendJson(res, 201, { slug });
      });

    default:
      return sendJson(res, 405, { error: `${req.method} is not supported on ${SOURCES_ROUTE}` });
  }
}

/**
 * Lets the in-browser Monaco editor read and write artifact sources under
 * `src/pages/`. Dev-server only: `vite build` output has no file backend, and
 * writes are confined to validated slugs inside the pages directory.
 */
export function playgroundSources(options: { pagesDir: string }): Plugin {
  return {
    name: "playground-sources",
    apply: "serve",
    configureServer(server) {
      // A file written through this endpoint is new to the watcher, and the
      // client reloads immediately afterwards. Announcing the add up front
      // makes `import.meta.glob` in the registry re-evaluate deterministically
      // instead of racing chokidar.
      const onCreated = (file: string) => server.watcher.emit("add", file);

      server.middlewares.use(SOURCES_ROUTE, (req, res, next) => {
        void (async () => {
          try {
            await handle(options.pagesDir, onCreated, req, res);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            server.config.logger.error(`[playground-sources] ${req.method} failed: ${message}`);
            if (res.headersSent) {
              next(error);
              return;
            }
            sendJson(res, 400, { error: message });
          }
        })();
      });
    },
  };
}
