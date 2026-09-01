import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import { COMMENT_TOOLS } from "./comments-schema";
import {
  RESOLVED_STATUS,
  addComment,
  addReply,
  assertElementContext,
  assertPage,
  assertRating,
  listComments,
  parseCommentFilter,
  patchComment,
  removeComment,
  type CommentPatch,
  type StoredAuthor,
  type StoredComment,
} from "./comments-store";

export const COMMENTS_ROUTE = "/__playground/comments";

export type CommentRoute =
  | "list"
  | "schema"
  | "create"
  | "reply"
  | "resolve"
  | "update"
  | "delete";

/**
 * Resolves a request against the endpoints `comments-schema.ts` advertises.
 * `pathname` is what the middleware sees — everything after `COMMENTS_ROUTE`.
 * Pure, so the routing table an agent depends on is unit-tested.
 */
export function matchRoute(
  method: string,
  pathname: string,
): { route: CommentRoute; id: string } | undefined {
  const segments = pathname
    .split("/")
    .filter((segment) => segment !== "")
    .map(decodeURIComponent);

  if (segments.length === 0) {
    if (method === "GET") return { route: "list", id: "" };
    if (method === "POST") return { route: "create", id: "" };
    return undefined;
  }

  const [first, second] = segments as [string, string | undefined];

  if (segments.length === 1) {
    if (first === "schema")
      return method === "GET" ? { route: "schema", id: "" } : undefined;
    if (method === "PATCH") return { route: "update", id: first };
    if (method === "DELETE") return { route: "delete", id: first };
    return undefined;
  }

  if (segments.length === 2 && method === "POST") {
    if (second === "replies") return { route: "reply", id: first };
    if (second === "resolve") return { route: "resolve", id: first };
  }
  return undefined;
}

async function readJsonBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw === "") return {};

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

function requireText(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`"${key}" is required and must be a non-empty string`);
  }
  return value;
}

/**
 * Authorship is never inferred: a reply that silently shows up as "You" when an
 * agent wrote it is worse than a 400 naming the missing field.
 */
function requireAuthor(body: Record<string, unknown>): StoredAuthor {
  const author = body["author"];
  if (author === null || typeof author !== "object" || Array.isArray(author)) {
    throw new Error(
      '"author" is required, e.g. {"name":"Claude","kind":"agent"}',
    );
  }
  const candidate = author as Record<string, unknown>;
  const name = candidate["name"];
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error('"author.name" is required and must be a non-empty string');
  }
  const kind = candidate["kind"];
  if (kind !== undefined && kind !== "user" && kind !== "agent") {
    throw new Error('"author.kind" must be "user" or "agent"');
  }
  return { name, ...(kind === undefined ? {} : { kind }) };
}

function optionalText(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`"${key}" must be a string`);
  return value;
}

/** The server owns identity and creation time so two callers cannot collide. */
function draft(body: Record<string, unknown>, text: string): StoredComment {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    body: text,
    author: requireAuthor(body),
  };
}

function handle(
  dir: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> | void {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const matched = matchRoute(req.method ?? "", url.pathname);
  if (!matched) {
    return sendJson(res, 405, {
      error: `${req.method} ${COMMENTS_ROUTE}${url.pathname} is not an endpoint — GET ${COMMENTS_ROUTE}/schema lists them`,
    });
  }
  const { route, id } = matched;

  switch (route) {
    case "list":
      return sendJson(res, 200, {
        comments: listComments(dir, parseCommentFilter(url.searchParams)),
      });

    case "schema":
      return sendJson(res, 200, { tools: COMMENT_TOOLS });

    case "create":
      return readJsonBody(req).then((body) => {
        const anchor = optionalText(body, "anchor");
        const rating = optionalText(body, "rating");
        const status = optionalText(body, "status");
        const element = body["element"];
        sendJson(
          res,
          201,
          addComment(dir, assertPage(body["page"]), {
            ...draft(body, optionalText(body, "body") ?? ""),
            status: status ?? "open",
            parentId: null,
            anchor: anchor ?? null,
            ...(rating === undefined ? {} : { rating: assertRating(rating) }),
            ...(element === undefined
              ? {}
              : { element: assertElementContext(element) }),
          }),
        );
      });

    case "reply":
      return readJsonBody(req).then((body) => {
        sendJson(
          res,
          201,
          addReply(dir, id, draft(body, requireText(body, "body"))),
        );
      });

    case "resolve":
      return readJsonBody(req).then((body) => {
        sendJson(res, 200, {
          ...patchComment(dir, id, {
            status: optionalText(body, "status") ?? RESOLVED_STATUS,
            updatedAt: new Date().toISOString(),
          }),
        });
      });

    case "update":
      return readJsonBody(req).then((body) => {
        // A non-string field is a caller bug, not an omission: naming it in a
        // 400 (as every other route does) beats a 200 that silently wrote
        // nothing but `updatedAt`.
        const nextBody = optionalText(body, "body");
        const nextStatus = optionalText(body, "status");
        const nextRating = optionalText(body, "rating");
        const patch: CommentPatch = {
          ...(nextBody === undefined ? {} : { body: nextBody }),
          ...(nextStatus === undefined ? {} : { status: nextStatus }),
          ...(nextRating === undefined
            ? {}
            : { rating: assertRating(nextRating) }),
          updatedAt: new Date().toISOString(),
        };
        sendJson(res, 200, patchComment(dir, id, patch));
      });

    case "delete":
      return sendJson(res, 200, { removed: removeComment(dir, id) });
  }
}

/**
 * Persists playground feedback to `<dir>/comments.json` so notes survive a
 * reload and stay readable in-repo by a coding agent, and exposes the same data
 * as an API a model can call — `GET <route>/schema` describes every endpoint.
 * Dev-server only: the production `vite build` output has no comment backend by
 * design.
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
            const message =
              error instanceof Error ? error.message : String(error);
            server.config.logger.error(
              `[playground-comments] ${req.method} failed: ${message}`,
            );
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
