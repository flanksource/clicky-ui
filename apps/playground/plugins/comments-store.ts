import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
};

/** Page slug → the comments left on that page. */
export type CommentsFile = Record<string, StoredComment[]>;

export type CommentPatch = {
  body?: string;
  status?: string;
  updatedAt?: string;
};

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
      throw new Error(`${file}: page "${page}" must map to an array of comments`);
    }
  }
  return parsed as CommentsFile;
}

export function readPage(dir: string, page: string): StoredComment[] {
  return readAll(dir)[page] ?? [];
}

function writeAll(dir: string, data: CommentsFile): void {
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

export function assertComment(input: unknown): StoredComment {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment payload must be an object");
  }
  const candidate = input as Record<string, unknown>;
  for (const key of ["id", "body", "createdAt"] as const) {
    const value = candidate[key];
    if (typeof value !== "string" || value === "") {
      throw new Error(`comment payload requires a non-empty string "${key}"`);
    }
  }
  if (!("author" in candidate) || (candidate["author"] !== null && typeof candidate["author"] !== "object")) {
    throw new Error('comment payload requires an "author" object or null');
  }
  return input as StoredComment;
}

export function addComment(dir: string, page: string, comment: StoredComment): StoredComment {
  assertPage(page);
  assertComment(comment);

  const data = readAll(dir);
  const list = data[page] ?? [];
  if (list.some((entry) => entry.id === comment.id)) {
    throw new Error(`comment id "${comment.id}" already exists on page "${page}"`);
  }
  data[page] = [...list, comment];
  writeAll(dir, data);
  return comment;
}

export function patchComment(
  dir: string,
  page: string,
  id: string,
  patch: CommentPatch,
): StoredComment {
  assertPage(page);

  const data = readAll(dir);
  const list = data[page] ?? [];
  const index = list.findIndex((entry) => entry.id === id);
  if (index === -1) throw new Error(`comment "${id}" not found on page "${page}"`);

  const current = list[index] as StoredComment;
  const next: StoredComment = {
    ...current,
    ...(patch.body !== undefined ? { body: patch.body } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.updatedAt !== undefined ? { updatedAt: patch.updatedAt } : {}),
  };
  data[page] = list.map((entry, position) => (position === index ? next : entry));
  writeAll(dir, data);
  return next;
}

/** Removes a comment and, when it is a thread root, every reply beneath it. */
export function removeComment(dir: string, page: string, id: string): number {
  assertPage(page);

  const data = readAll(dir);
  const list = data[page] ?? [];
  if (!list.some((entry) => entry.id === id)) {
    throw new Error(`comment "${id}" not found on page "${page}"`);
  }

  const doomed = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const entry of list) {
      if (entry.parentId && doomed.has(entry.parentId) && !doomed.has(entry.id)) {
        doomed.add(entry.id);
        grew = true;
      }
    }
  }

  data[page] = list.filter((entry) => !doomed.has(entry.id));
  writeAll(dir, data);
  return doomed.size;
}
