import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

import { COMMENT_TOOLS } from "./comments-schema";
import {
  CommentHttpError,
  assertActiveStatusTransition,
  closeComment,
  reopenComment,
  resolveComment,
} from "./comments-lifecycle";
import type { CommentElementContext } from "./comments-model";
import { listComments, parseCommentFilter } from "./comments-query";
import {
  assertScreenshotCapture,
  discardScreenshot,
  persistScreenshot,
  serveScreenshot,
  stageScreenshotRemoval,
} from "./comments-screenshots";
import {
  addComment,
  addReply,
  assertElementContext,
  assertPage,
  assertRating,
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
  | "screenshot"
  | "create"
  | "reply"
  | "resolve"
  | "close"
  | "reopen"
  | "update"
  | "delete";

/**
 * Resolves a request against the comment endpoints. Human-only lifecycle
 * routes are intentionally absent from `comments-schema.ts`.
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
    if (second === "close") return { route: "close", id: first };
    if (second === "reopen") return { route: "reopen", id: first };
  }
  if (segments.length === 2 && first === "screenshots" && method === "GET") {
    return { route: "screenshot", id: second ?? "" };
  }
  return undefined;
}

async function readJsonBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  const limit = 48 * 1024 * 1024;
  for await (const chunk of req) {
    const buffer = chunk as Buffer;
    bytes += buffer.byteLength;
    if (bytes > limit) {
      throw new Error(`request body exceeds the ${limit}-byte limit`);
    }
    chunks.push(buffer);
  }
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

function assertOnlyFields(
  body: Record<string, unknown>,
  allowed: readonly string[],
): void {
  const unexpected = Object.keys(body).find((key) => !allowed.includes(key));
  if (unexpected) {
    throw new Error(
      `request body has unexpected field ${JSON.stringify(unexpected)}`,
    );
  }
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

function persistElementContext(
  dir: string,
  id: string,
  input: unknown,
): CommentElementContext {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("every root comment requires element context");
  }
  const candidate = input as Record<string, unknown>;
  if (candidate["screenshot"] === undefined) {
    throw new Error("every root comment requires a screenshot capture result");
  }
  const screenshot = persistScreenshot(
    dir,
    id,
    assertScreenshotCapture(candidate["screenshot"]),
  );
  try {
    return assertElementContext({ ...candidate, screenshot });
  } catch (cause) {
    discardScreenshot(dir, id, screenshot);
    throw cause;
  }
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
      error: `${req.method} ${COMMENTS_ROUTE}${url.pathname} is not a comment endpoint`,
    });
  }
  const { route, id } = matched;

  switch (route) {
    case "screenshot":
      if (!serveScreenshot(dir, url.pathname, res)) {
        return sendJson(res, 404, { error: `screenshot "${id}" not found` });
      }
      return;

    case "list":
      return sendJson(res, 200, {
        comments: listComments(dir, parseCommentFilter(url.searchParams)),
      });

    case "schema":
      return sendJson(res, 200, { tools: COMMENT_TOOLS });

    case "create":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, [
          "page",
          "body",
          "rating",
          "author",
          "anchor",
          "element",
        ]);
        const anchor = optionalText(body, "anchor");
        const rating = optionalText(body, "rating");
        const comment = draft(body, optionalText(body, "body") ?? "");
        const element = persistElementContext(dir, comment.id, body["element"]);
        const stored: StoredComment = {
          ...comment,
          status: "open",
          parentId: null,
          anchor: anchor ?? null,
          ...(rating === undefined ? {} : { rating: assertRating(rating) }),
          element,
        };
        try {
          sendJson(res, 201, addComment(dir, assertPage(body["page"]), stored));
        } catch (cause) {
          const removal = stageScreenshotRemoval(dir, [stored]);
          removal.commit();
          throw cause;
        }
      });

    case "reply":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, ["body", "author"]);
        sendJson(
          res,
          201,
          addReply(dir, id, draft(body, requireText(body, "body"))),
        );
      });

    case "resolve":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, []);
        sendJson(res, 200, resolveComment(dir, id));
      });

    case "close":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, ["author"]);
        sendJson(res, 200, closeComment(dir, id, requireAuthor(body)));
      });

    case "reopen":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, ["author", "body"]);
        const actor = requireAuthor(body);
        const replyBody = optionalText(body, "body");
        sendJson(
          res,
          200,
          reopenComment(
            dir,
            id,
            actor,
            replyBody === undefined
              ? undefined
              : {
                  id: randomUUID(),
                  createdAt: new Date().toISOString(),
                  body: requireText(body, "body"),
                  author: actor,
                },
          ),
        );
      });

    case "update":
      return readJsonBody(req).then((body) => {
        assertOnlyFields(body, ["body", "status", "rating"]);
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
        if (nextStatus !== undefined) {
          assertActiveStatusTransition(dir, id, nextStatus);
        }
        sendJson(res, 200, patchComment(dir, id, patch));
      });

    case "delete":
      return sendJson(res, 200, { removed: removeComment(dir, id) });
  }
}

/**
 * Persists playground feedback to `<dir>/comments.json` so notes survive a
 * reload and stay readable in-repo by a coding agent, and exposes the same data
 * as an API a model can call — `GET <route>/schema` describes every endpoint
 * available to agents. Human-only lifecycle routes remain UI-owned.
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
            sendJson(
              res,
              error instanceof CommentHttpError ? error.statusCode : 400,
              { error: message },
            );
          }
        })();
      });
    },
  };
}
