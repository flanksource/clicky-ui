import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import {
  COMMENT_ELEMENT_HTML_LIMIT,
  COMMENT_ELEMENT_HTML_TRUNCATION,
  type CommentElementContext,
} from "./comments-model";
import {
  assertStoredScreenshot,
  stageScreenshotRemoval,
} from "./comments-screenshots";

export const COMMENT_RATINGS = ["positive", "negative"] as const;
export type CommentRating = (typeof COMMENT_RATINGS)[number];

/**
 * On-disk shape for playground feedback. Deliberately structural rather than an
 * import of the library's `Comment` type: this module is loaded by Vite's config
 * bundler, where the `@flanksource/clicky-ui` source aliases do not apply.
 */
export type StoredAuthor = {
  id?: string;
  name: string;
  kind?: "user" | "agent";
};

export type StoredComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  author: StoredAuthor | null;
  status?: string;
  parentId?: string | null;
  anchor?: string | null;
  rating?: CommentRating;
  element?: CommentElementContext;
};

/** Page slug → the comments left on that page. */
export type CommentsFile = Record<string, StoredComment[]>;

/** A comment plus the page it lives on, for listings that span pages. */
export type ListedComment = StoredComment & { page: string };

export type CommentPatch = {
  body?: string;
  status?: string;
  rating?: CommentRating;
  updatedAt?: string;
};

/** Narrows a listing. An absent field means "no restriction". */
export type CommentFilter = {
  page?: string;
  /** Matched against thread roots; a matching root brings its replies. */
  statuses?: readonly string[];
};

/**
 * Mirrors `DEFAULT_COMMENT_STATUSES` in the library's `comment-types.ts`. It has
 * to be re-stated here for the same reason `StoredComment` does — the config
 * bundler cannot follow the package alias. `comments-store.test.ts` asserts the
 * two stay identical, so drift fails the suite rather than reaching the UI.
 */
export const COMMENT_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

/** The subset the library flags `unresolved: true`. */
export const UNRESOLVED_STATUSES = ["open", "in_progress"] as const;

/** Status a comment moves to when an agent resolves it. */
export const RESOLVED_STATUS = "resolved";

/** Status a root is treated as when it was stored without one. */
const IMPLICIT_STATUS = "open";

export const COMMENTS_FILENAME = "comments.json";

export function commentsPath(dir: string): string {
  return join(dir, COMMENTS_FILENAME);
}

export function readAll(dir: string): CommentsFile {
  const file = commentsPath(dir);
  if (!existsSync(file)) return {};

  const raw = readFileSync(file, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${file} is not valid JSON — fix or delete it (${(error as Error).message})`,
    );
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${file} must contain a JSON object keyed by page slug`);
  }
  for (const [page, list] of Object.entries(parsed)) {
    if (!Array.isArray(list)) {
      throw new Error(
        `${file}: page "${page}" must map to an array of comments`,
      );
    }
  }
  return parsed as CommentsFile;
}

export function readPage(dir: string, page: string): StoredComment[] {
  return readAll(dir)[page] ?? [];
}

export function writeAll(dir: string, data: CommentsFile): void {
  mkdirSync(dir, { recursive: true });
  const file = commentsPath(dir);
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

export function assertPage(page: unknown): string {
  if (typeof page !== "string" || page === "") {
    throw new Error("a comment requires a non-empty page slug");
  }
  return page;
}

/** Keeps an agent from writing a status the comment rail cannot render. */
export function assertStatus(status: unknown): string {
  if (
    typeof status !== "string" ||
    !COMMENT_STATUSES.includes(status as never)
  ) {
    throw new Error(
      `status ${JSON.stringify(status)} is not one of ${COMMENT_STATUSES.join(", ")}`,
    );
  }
  return status;
}

export function assertRating(rating: unknown): CommentRating {
  if (
    typeof rating !== "string" ||
    !COMMENT_RATINGS.includes(rating as CommentRating)
  ) {
    throw new Error(
      `rating ${JSON.stringify(rating)} is not one of ${COMMENT_RATINGS.join(", ")}`,
    );
  }
  return rating as CommentRating;
}

export function assertElementContext(input: unknown): CommentElementContext {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment element context must be an object");
  }
  const candidate = input as Record<string, unknown>;
  const allowedFields = new Set([
    "componentName",
    "source",
    "html",
    "screenshot",
  ]);
  const unexpected = Object.keys(candidate).find(
    (key) => !allowedFields.has(key),
  );
  if (unexpected) {
    throw new Error(
      `comment element context has unexpected field ${JSON.stringify(unexpected)}`,
    );
  }
  const source = candidate["source"];
  const html = candidate["html"];
  if (typeof source !== "string" || source === "") {
    throw new Error("comment element source must be a non-empty string");
  }
  if (typeof html !== "string" || html === "") {
    throw new Error("comment element html must be a non-empty string");
  }
  const truncatedLength =
    COMMENT_ELEMENT_HTML_LIMIT + COMMENT_ELEMENT_HTML_TRUNCATION.length;
  if (
    html.length > COMMENT_ELEMENT_HTML_LIMIT &&
    (html.length !== truncatedLength ||
      !html.endsWith(COMMENT_ELEMENT_HTML_TRUNCATION))
  ) {
    throw new Error(
      `comment element html exceeds the ${COMMENT_ELEMENT_HTML_LIMIT}-character capture limit`,
    );
  }
  const componentName = candidate["componentName"];
  if (
    componentName !== undefined &&
    (typeof componentName !== "string" || componentName === "")
  ) {
    throw new Error("comment element componentName must be a non-empty string");
  }
  if (candidate["screenshot"] !== undefined) {
    assertStoredScreenshot(candidate["screenshot"]);
  }
  return input as CommentElementContext;
}

export function assertComment(input: unknown): StoredComment {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment payload must be an object");
  }
  const candidate = input as Record<string, unknown>;
  for (const key of ["id", "createdAt"] as const) {
    const value = candidate[key];
    if (typeof value !== "string" || value === "") {
      throw new Error(`comment payload requires a non-empty string "${key}"`);
    }
  }
  if (typeof candidate["body"] !== "string") {
    throw new Error('comment payload requires a string "body"');
  }
  if (candidate["rating"] !== undefined) assertRating(candidate["rating"]);
  if (candidate["body"] === "" && candidate["rating"] === undefined) {
    throw new Error("comment payload requires body or rating");
  }
  if (
    !("author" in candidate) ||
    (candidate["author"] !== null && typeof candidate["author"] !== "object")
  ) {
    throw new Error('comment payload requires an "author" object or null');
  }
  if (candidate["status"] !== undefined) assertStatus(candidate["status"]);
  if (candidate["element"] !== undefined) {
    assertElementContext(candidate["element"]);
  }
  const isReply = typeof candidate["parentId"] === "string";
  const anchor = candidate["anchor"];
  const isAnchoredRoot =
    !isReply && typeof anchor === "string" && anchor !== "__document__";
  if (isAnchoredRoot && candidate["element"] === undefined) {
    throw new Error("an anchored root requires element context");
  }
  if (isReply && candidate["element"] !== undefined) {
    throw new Error("replies inherit their root element context");
  }
  return input as StoredComment;
}

/**
 * Reads a listing request off the query string. Pure and exported so the query
 * vocabulary an agent has to get right is unit-tested, leaving the middleware a
 * thin HTTP shell.
 */
export function parseCommentFilter(params: URLSearchParams): CommentFilter {
  const filter: CommentFilter = {};

  const page = params.get("page");
  if (page !== null) filter.page = assertPage(page);

  const statuses = params
    .getAll("status")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map(assertStatus);

  const unresolved = params.get("unresolved");
  if (unresolved !== null) {
    if (unresolved !== "true" && unresolved !== "false") {
      throw new Error(
        `"unresolved" must be "true" or "false", got ${JSON.stringify(unresolved)}`,
      );
    }
    if (unresolved === "true") statuses.push(...UNRESOLVED_STATUSES);
  }

  if (statuses.length > 0) filter.statuses = [...new Set(statuses)];
  return filter;
}

/** Roots matching `statuses`, each followed by every comment beneath it. */
function selectThreads(
  list: StoredComment[],
  statuses: readonly string[],
): StoredComment[] {
  const kept = new Set(
    list
      .filter(
        (entry) =>
          !entry.parentId && statuses.includes(entry.status ?? IMPLICIT_STATUS),
      )
      .map((entry) => entry.id),
  );

  let grew = true;
  while (grew) {
    grew = false;
    for (const entry of list) {
      if (entry.parentId && kept.has(entry.parentId) && !kept.has(entry.id)) {
        kept.add(entry.id);
        grew = true;
      }
    }
  }
  return list.filter((entry) => kept.has(entry.id));
}

/**
 * Every comment the filter admits, tagged with its page. Pages come out in slug
 * order; within a page the stored (creation) order is preserved so a thread
 * reads root-first.
 */
export function listComments(
  dir: string,
  filter: CommentFilter = {},
): ListedComment[] {
  const data = readAll(dir);
  const pages =
    filter.page === undefined ? Object.keys(data).sort() : [filter.page];

  return pages.flatMap((page) => {
    const list = data[page] ?? [];
    const selected =
      filter.statuses === undefined
        ? list
        : selectThreads(list, filter.statuses);
    return selected.map((comment) => ({ ...comment, page }));
  });
}

/** Ids are UUIDs, so a comment is addressable without knowing its page. */
export function findComment(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } | undefined {
  for (const [page, list] of Object.entries(readAll(dir))) {
    const comment = list.find((entry) => entry.id === id);
    if (comment) return { page, comment };
  }
  return undefined;
}

function requireComment(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } {
  const found = findComment(dir, id);
  if (!found) throw new Error(`comment "${id}" not found`);
  return found;
}

/** Walks up to the thread root so replies never nest more than one level. */
function rootOf(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } {
  const found = requireComment(dir, id);
  const list = readPage(dir, found.page);

  let current = found.comment;
  const seen = new Set([current.id]);
  while (current.parentId) {
    const parent = list.find((entry) => entry.id === current.parentId);
    if (!parent || seen.has(parent.id)) break;
    seen.add(parent.id);
    current = parent;
  }
  return { page: found.page, comment: current };
}

export function addComment(
  dir: string,
  page: string,
  comment: StoredComment,
): StoredComment {
  assertPage(page);
  assertComment(comment);

  const data = readAll(dir);
  const list = data[page] ?? [];
  if (list.some((entry) => entry.id === comment.id)) {
    throw new Error(
      `comment id "${comment.id}" already exists on page "${page}"`,
    );
  }
  data[page] = [...list, comment];
  writeAll(dir, data);
  return comment;
}

/**
 * Attaches a reply to `parentId`'s thread root, inheriting the root's page and
 * anchor — a caller only has to know the id it is answering.
 */
export function addReply(
  dir: string,
  parentId: string,
  reply: StoredComment,
): StoredComment {
  const root = rootOf(dir, parentId);
  const { element: _rootOnly, ...replyFields } = reply;
  return addComment(dir, root.page, {
    ...replyFields,
    parentId: root.comment.id,
    anchor: root.comment.anchor ?? null,
  });
}

export function patchComment(
  dir: string,
  id: string,
  patch: CommentPatch,
): StoredComment {
  if (patch.status !== undefined) assertStatus(patch.status);
  if (patch.rating !== undefined) assertRating(patch.rating);

  const { page } = requireComment(dir, id);
  const data = readAll(dir);
  const list = data[page] ?? [];

  const next = list.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          ...(patch.body !== undefined ? { body: patch.body } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.rating !== undefined ? { rating: patch.rating } : {}),
          ...(patch.updatedAt !== undefined
            ? { updatedAt: patch.updatedAt }
            : {}),
        }
      : entry,
  );
  data[page] = next;
  writeAll(dir, data);
  return next.find((entry) => entry.id === id) as StoredComment;
}

/** Removes a comment and, when it is a thread root, every reply beneath it. */
export function removeComment(dir: string, id: string): number {
  const { page } = requireComment(dir, id);
  const data = readAll(dir);
  const list = data[page] ?? [];

  const doomed = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const entry of list) {
      if (
        entry.parentId &&
        doomed.has(entry.parentId) &&
        !doomed.has(entry.id)
      ) {
        doomed.add(entry.id);
        grew = true;
      }
    }
  }

  const removed = list.filter((entry) => doomed.has(entry.id));
  const screenshotRemoval = stageScreenshotRemoval(dir, removed);
  data[page] = list.filter((entry) => !doomed.has(entry.id));
  try {
    writeAll(dir, data);
    screenshotRemoval.commit();
  } catch (cause) {
    try {
      screenshotRemoval.rollback();
      data[page] = list;
      writeAll(dir, data);
    } catch (rollbackCause) {
      throw new Error(
        `comment deletion failed (${String(cause)}) and rollback failed (${String(rollbackCause)})`,
      );
    }
    throw new Error(
      `comment deletion failed and was rolled back: ${String(cause)}`,
    );
  }
  return doomed.size;
}
