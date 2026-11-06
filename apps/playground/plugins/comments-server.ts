import {
  requireText,
  requireAuthor,
  requireAssignee,
  optionalText,
  assertOnlyFields,
  draft,
} from "./comments-input";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { Connect, Logger, Plugin } from "vite";

import { COMMENT_TOOLS } from "./comments-schema";
import {
  CommentHttpError,
  acknowledgeComment,
  assignComment,
  closeComment,
  reopenComment,
  resolveComment,
} from "./comments-lifecycle";
import type { CommentElementContext } from "./comments-model";
import { listComments, parseCommentFilter } from "./comments-query";
import { commentActivity } from "./comment-activity";
import {
  assertScreenshotCapture,
  persistScreenshot,
} from "./comments-screenshots";
import {
  addComment,
  addReply,
  assertElementContext,
  assertPage,
  assertRating,
  assertReviewDecision,
  assertStyleEdit,
  patchComment,
  removeComment,
  type CommentPatch,
  type StoredAuthor,
  type StoredComment,
  type StoredStyleEdit,
} from "./comments-store";
import {
  persistReviewDecision,
  type ReviewSourceRequest,
} from "./reviewable-store";
import { readExternalPages } from "./external-pages-store";
import { externalUrl } from "../src/bookmarklet/model";
import { commentsClient, type CodeRangeSelector } from "./comments-client";
import { parseEditableSource } from "./editable-source-marker";
import { LaunchHttpError } from "./launch-client";
import { PageStoreError } from "./pages-store";
import { RepositoryDocuments } from "./repository-documents";

export const COMMENTS_ROUTE = "/__playground/comments";

export type CommentRoute =
  | "list"
  | "activity"
  | "schema"
  | "attachment"
  | "create"
  | "reply"
  | "acknowledge"
  | "assign"
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
    if (first === "activity")
      return method === "GET" ? { route: "activity", id: "" } : undefined;
    if (first === "schema")
      return method === "GET" ? { route: "schema", id: "" } : undefined;
    if (method === "PATCH") return { route: "update", id: first };
    if (method === "DELETE") return { route: "delete", id: first };
    return undefined;
  }

  if (segments.length === 2 && method === "POST") {
    if (second === "replies") return { route: "reply", id: first };
    if (second === "acknowledge") return { route: "acknowledge", id: first };
    if (second === "assign") return { route: "assign", id: first };
    if (second === "resolve") return { route: "resolve", id: first };
    if (second === "close") return { route: "close", id: first };
    if (second === "reopen") return { route: "reopen", id: first };
  }
  if (segments.length === 3 && second === "attachments" && method === "GET")
    return { route: "attachment", id: first };
  return undefined;
}

export async function readJsonBody(
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

export function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function persistElementContext(input: unknown): CommentElementContext {
  if (input === null || typeof input !== "object" || Array.isArray(input))
    throw new Error("Every root comment requires element context");
  const candidate = input as Record<string, unknown>;
  return assertElementContext({
    ...candidate,
    ...(candidate.screenshot
      ? {
          screenshot: persistScreenshot(
            assertScreenshotCapture(candidate.screenshot),
          ),
        }
      : {}),
  });
}

/** A root just stored by `POST /__playground/comments` or a prompt run (not a review decision). */
export type CommentCreatedEvent = {
  page: string;
  comment: StoredComment;
  /** The playground origin the comment was posted to, e.g. `http://localhost:5801`. */
  origin: string;
  /** The human behind a root authored by something else, e.g. who ran a prompt. */
  requestedBy?: StoredAuthor;
};

/** What a new root is made of; `element` is the raw capture, screenshot included. */
export type RootCommentInput = Pick<
  StoredComment,
  | "body"
  | "rating"
  | "reviewDecision"
  | "checklist"
  | "refs"
  | "promptRun"
  | "lint"
  | "styleEdit"
> & {
  page: unknown;
  author: StoredAuthor;
  anchor?: string;
  element: unknown;
  source?: Pick<ReviewSourceRequest, "pagesDir" | "expectedSource">;
  /** The pages root `styleEdit.marker.file` is relative to; required with a `styleEdit`. */
  pagesDir?: string;
};

/**
 * The Gavel `code-range` selector for the line a refused style edit points at,
 * derived from the validated marker and the server's own roots. Nothing in it
 * is taken from the client beyond the marker's file, line and source hash.
 */
export function styleEditSelector(
  styleEdit: StoredStyleEdit,
  { pagesDir, workspace }: { pagesDir: string; workspace: string },
): CodeRangeSelector {
  const marker = parseEditableSource(styleEdit.marker);
  const absolute = resolve(pagesDir, marker.file);
  if (!absolute.startsWith(resolve(pagesDir) + sep)) {
    throw new Error(`styleEdit marker file ${marker.file} is outside the pages directory`);
  }
  const path = relative(workspace, absolute).split(sep).join("/");
  if (path === "" || path.startsWith("../") || isAbsolute(path)) {
    throw new Error(`styleEdit marker file ${marker.file} is outside the workspace ${workspace}`);
  }
  return { kind: "code-range", version: 1, path, revision: marker.hash, startLine: marker.line, endLine: marker.line };
}

/**
 * Stores a new thread root: persists its element capture, checks an external
 * page's URL, and records a review decision in place of an earlier one. The
 * screenshot is removed again when anything fails.
 */
export async function createRootComment(
  dir: string,
  input: RootCommentInput,
): Promise<{ page: string; comment: StoredComment }> {
  const {
    page: rawPage,
    author,
    anchor,
    element: rawElement,
    source,
    pagesDir,
    ...fields
  } = input;
  const id = randomUUID();
  let selector: CodeRangeSelector | undefined;
  if (fields.styleEdit !== undefined) {
    if (fields.reviewDecision) throw new Error("a style edit cannot carry a review decision");
    if (!pagesDir) throw new Error("style edit comments require the pages directory");
    selector = styleEditSelector(assertStyleEdit(fields.styleEdit), {
      pagesDir,
      workspace: commentsClient(dir).workspace,
    });
  }
  const element = persistElementContext(rawElement);
  const stored: StoredComment = {
    ...fields,
    id,
    createdAt: new Date().toISOString(),
    author,
    status: "open",
    parentId: null,
    anchor: anchor ?? null,
    element,
  };
  const page = assertPage(rawPage);
  if (page.startsWith("document:"))
    element.source = new RepositoryDocuments(dir).document(page).absolutePath;
  if (page.startsWith("external:")) {
    const target = readExternalPages(dir).find((entry) => entry.id === page);
    if (
      !element.pageUrl ||
      !target?.urls.includes(externalUrl(element.pageUrl).url)
    ) {
      throw new Error(
        "External comment capture URL must belong to its registered comment set",
      );
    }
  }
  if (!stored.reviewDecision) {
    return { page, comment: await addComment(dir, page, stored, selector) };
  }
  if (!source)
    throw new Error(
      "review decisions require expectedSource and a local source page",
    );
  return {
    page,
    comment: await persistReviewDecision(
      { ...source, commentsDir: dir, slug: page },
      stored,
    ),
  };
}

export type PlaygroundCommentsOptions = {
  dir: string;
  pagesDir?: string;
  /** Runs after a root is stored and answered; a rejection is logged. */
  onCreated?: (event: CommentCreatedEvent) => Promise<void>;
};

async function handle(
  dir: string,
  pagesDir: string | undefined,
  req: IncomingMessage,
  res: ServerResponse,
  created: (event: CommentCreatedEvent) => void,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://playground.local");
  const matched = matchRoute(req.method ?? "", url.pathname);
  if (!matched) {
    return sendJson(res, 405, {
      error: `${req.method} ${COMMENTS_ROUTE}${url.pathname} is not a comment endpoint`,
    });
  }
  const { route, id } = matched;

  switch (route) {
    case "activity":
      return sendJson(res, 200, {
        pages: commentActivity(await listComments(dir)),
      });
    case "attachment": {
      const client = commentsClient(dir);
      const target = new URL(
        "/api/v1/comments" + url.pathname,
        await client.endpoint.url(),
      );
      const response = await fetch(target, {
        headers: { "X-Gavel-Comment-Scope": client.scope },
      });
      if (!response.ok)
        throw new LaunchHttpError(response.status, await response.text());
      res.statusCode = response.status;
      for (const header of [
        "content-type",
        "content-length",
        "content-disposition",
        "etag",
        "x-content-type-options",
      ]) {
        const value = response.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      res.setHeader("Cache-Control", "no-store");
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    case "list":
      return sendJson(res, 200, {
        comments: await listComments(dir, parseCommentFilter(url.searchParams)),
      });

    case "schema":
      return sendJson(res, 200, { tools: COMMENT_TOOLS });

    case "create":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, [
          "page",
          "body",
          "rating",
          "reviewDecision",
          "author",
          "anchor",
          "element",
          "expectedSource",
          "styleEdit",
        ]);
        const host = req.headers.host;
        if (!host) throw new Error("request has no Host header");
        const rating = optionalText(body, "rating");
        const reviewDecision = optionalText(body, "reviewDecision");
        if (reviewDecision && !pagesDir)
          throw new Error("local source review is not configured");
        const anchor = optionalText(body, "anchor");
        const { page, comment } = await createRootComment(dir, {
          page: body["page"],
          body: optionalText(body, "body") ?? "",
          author: requireAuthor(body),
          ...(anchor === undefined ? {} : { anchor }),
          element: body["element"],
          ...(body["styleEdit"] === undefined
            ? {}
            : {
                styleEdit: body["styleEdit"] as StoredStyleEdit,
                ...(pagesDir === undefined ? {} : { pagesDir }),
              }),
          ...(rating === undefined ? {} : { rating: assertRating(rating) }),
          ...(reviewDecision === undefined
            ? {}
            : {
                reviewDecision: assertReviewDecision(reviewDecision),
                source: {
                  pagesDir: pagesDir as string,
                  expectedSource: requireText(body, "expectedSource"),
                },
              }),
        });
        sendJson(res, 201, comment);
        if (!comment.reviewDecision) {
          created({ page, comment, origin: `http://${host}` });
        }
      });

    case "reply":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, ["body", "author"]);
        sendJson(
          res,
          201,
          await addReply(dir, id, draft(body, requireText(body, "body"))),
        );
      });

    case "acknowledge":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, ["author"]);
        sendJson(
          res,
          200,
          await acknowledgeComment(dir, id, requireAuthor(body)),
        );
      });

    case "assign":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, ["author", "assignee"]);
        sendJson(
          res,
          200,
          await assignComment(
            dir,
            id,
            requireAuthor(body),
            requireAssignee(body),
          ),
        );
      });

    case "resolve":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, []);
        sendJson(res, 200, await resolveComment(dir, id));
      });

    case "close":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, ["author"]);
        sendJson(res, 200, await closeComment(dir, id, requireAuthor(body)));
      });

    case "reopen":
      return readJsonBody(req).then(async (body) => {
        assertOnlyFields(body, ["author", "body"]);
        const actor = requireAuthor(body);
        const replyBody = optionalText(body, "body");
        sendJson(
          res,
          200,
          await reopenComment(
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
      return readJsonBody(req).then(async (body) => {
        // Status is not editable here: acknowledge, assign, resolve, close and
        // reopen are the only ways to move a thread between stages.
        assertOnlyFields(body, ["body", "rating"]);
        // A non-string field is a caller bug, not an omission: naming it in a
        // 400 (as every other route does) beats a 200 that silently wrote
        // nothing but `updatedAt`.
        const nextBody = optionalText(body, "body");
        const nextRating = optionalText(body, "rating");
        const patch: CommentPatch = {
          ...(nextBody === undefined ? {} : { body: nextBody }),
          ...(nextRating === undefined
            ? {}
            : { rating: assertRating(nextRating) }),
          updatedAt: new Date().toISOString(),
        };
        sendJson(res, 200, await patchComment(dir, id, patch));
      });

    case "delete":
      return sendJson(res, 200, { removed: await removeComment(dir, id) });
  }
}

/**
 * Persists playground feedback through Gavel comments and exposes the same data
 * as an API a model can call — `GET <route>/schema` describes every endpoint
 * available to agents. Human-only lifecycle routes remain UI-owned.
 * The middleware runs in both Vite development and local build preview.
 */
export function playgroundComments(options: PlaygroundCommentsOptions): Plugin {
  return {
    name: "playground-comments",
    configureServer(server) {
      registerCommentsMiddleware(
        server.middlewares,
        server.config.logger,
        options,
      );
    },
    configurePreviewServer(server) {
      registerCommentsMiddleware(
        server.middlewares,
        server.config.logger,
        options,
      );
    },
  };
}

function registerCommentsMiddleware(
  middlewares: Connect.Server,
  logger: Logger,
  { dir, pagesDir, onCreated }: PlaygroundCommentsOptions,
) {
  const created = (event: CommentCreatedEvent) => {
    onCreated?.(event).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `[playground-comments] onCreated for comment ${event.comment.id} failed: ${message}`,
      );
    });
  };
  middlewares.use(COMMENTS_ROUTE, (req, res, next) => {
    void (async () => {
      try {
        await handle(dir, pagesDir, req, res, created);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[playground-comments] ${req.method} failed: ${message}`);
        if (res.headersSent) {
          next(error);
          return;
        }
        sendJson(
          res,
          error instanceof LaunchHttpError
            ? error.status
            : error instanceof CommentHttpError
              ? error.statusCode
              : error instanceof PageStoreError
                ? error.statusCode
                : 400,
          {
            error: message,
            ...(error instanceof LaunchHttpError && error.diagnostics
              ? error.diagnostics
              : {}),
          },
        );
      }
    })();
  });
}
