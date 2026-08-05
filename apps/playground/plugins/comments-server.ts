import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import {
  addComment,
  assertComment,
  assertPage,
  patchComment,
  readAll,
  readPage,
  removeComment,
  type CommentPatch,
} from "./comments-store";

export const COMMENTS_ROUTE = "/__playground/comments";

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw === "") throw new Error(`${req.method} ${COMMENTS_ROUTE} expects a JSON body`);

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

function handle(dir: string, req: IncomingMessage, res: ServerResponse): Promise<void> | void {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const id = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  const pageParam = url.searchParams.get("page");

  switch (req.method) {
    case "GET":
      return sendJson(res, 200, pageParam === null ? readAll(dir) : readPage(dir, pageParam));

    case "POST":
      return readJsonBody(req).then((body) => {
        const page = assertPage(body["page"] ?? pageParam);
        const draft = body["comment"];
        if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
          throw new Error(`POST ${COMMENTS_ROUTE} requires a "comment" object`);
        }
        // The server owns identity and creation time so two tabs cannot collide.
        const comment = assertComment({
          ...(draft as Record<string, unknown>),
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        });
        sendJson(res, 201, addComment(dir, page, comment));
      });

    case "PATCH":
      return readJsonBody(req).then((body) => {
        const page = assertPage(body["page"] ?? pageParam);
        const patch: CommentPatch = {
          ...(typeof body["body"] === "string" ? { body: body["body"] } : {}),
          ...(typeof body["status"] === "string" ? { status: body["status"] } : {}),
          updatedAt: new Date().toISOString(),
        };
        sendJson(res, 200, patchComment(dir, page, id, patch));
      });

    case "DELETE": {
      const page = assertPage(pageParam);
      return sendJson(res, 200, { removed: removeComment(dir, page, id) });
    }

    default:
      return sendJson(res, 405, { error: `${req.method} is not supported on ${COMMENTS_ROUTE}` });
  }
}

/**
 * Persists playground feedback to `<dir>/comments.json` so notes survive a
 * reload and stay readable in-repo by a coding agent. Dev-server only — the
 * production `vite build` output has no comment backend by design.
 */
export function playgroundComments(options: { dir: string }): Plugin {
  return {
    name: "playground-comments",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(COMMENTS_ROUTE, (req, res, next) => {
        void (async () => {
          try {
            await handle(options.dir, req, res);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            server.config.logger.error(`[playground-comments] ${req.method} failed: ${message}`);
            if (res.headersSent) {
              next(error);
              return;
            }
            sendJson(res, 500, { error: message });
          }
        })();
      });
    },
  };
}
