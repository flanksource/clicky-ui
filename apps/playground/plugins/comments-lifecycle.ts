import {
  RESOLVED_STATUS,
  UNRESOLVED_STATUSES,
  assertComment,
  findComment,
  patchComment,
  readAll,
  writeAll,
  type StoredAuthor,
  type StoredComment,
} from "./comments-store";

export class CommentHttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

function root(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } {
  const found = findComment(dir, id);
  if (!found) throw new CommentHttpError(`comment "${id}" not found`, 404);
  if (found.comment.parentId) {
    throw new CommentHttpError(
      "only a thread root can change lifecycle stage",
      409,
    );
  }
  return found;
}

function statusOf(comment: StoredComment): string {
  return comment.status ?? "open";
}

export function resolveComment(dir: string, id: string): StoredComment {
  const { comment } = root(dir, id);
  const status = statusOf(comment);
  if (status === RESOLVED_STATUS) return comment;
  if (status === "closed") {
    throw new CommentHttpError(
      "a closed comment must be reopened before resolving",
      409,
    );
  }
  if (!UNRESOLVED_STATUSES.includes(status as never)) {
    throw new CommentHttpError(
      `comment status "${status}" cannot be resolved`,
      409,
    );
  }
  return patchComment(dir, id, {
    status: RESOLVED_STATUS,
    updatedAt: new Date().toISOString(),
  });
}

function requireHuman(actor: StoredAuthor): void {
  if (actor.kind !== "user") {
    throw new CommentHttpError(
      "only a human user can close or reopen comments",
      403,
    );
  }
}

function reopenWithReply(options: {
  dir: string;
  page: string;
  comment: StoredComment;
  actor: StoredAuthor;
  reply: StoredComment;
  updatedAt: string;
}): StoredComment {
  const storedReply: StoredComment = {
    id: options.reply.id,
    createdAt: options.reply.createdAt,
    body: options.reply.body,
    author: options.actor,
    parentId: options.comment.id,
    anchor: options.comment.anchor ?? null,
    ...(options.reply.rating ? { rating: options.reply.rating } : {}),
  };
  assertComment(storedReply);
  const reopened: StoredComment = {
    ...options.comment,
    status: "open",
    updatedAt: options.updatedAt,
  };
  delete reopened.closedAt;
  delete reopened.closedBy;

  const data = readAll(options.dir);
  const comments = data[options.page];
  if (!comments) {
    throw new Error(
      `comment page "${options.page}" disappeared while reopening`,
    );
  }
  if (comments.some((entry) => entry.id === storedReply.id)) {
    throw new Error(`comment id "${storedReply.id}" already exists`);
  }
  data[options.page] = [
    ...comments.map((entry) =>
      entry.id === options.comment.id ? reopened : entry,
    ),
    storedReply,
  ];
  writeAll(options.dir, data);
  return reopened;
}

export function closeComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
): StoredComment {
  requireHuman(actor);
  const { comment } = root(dir, id);
  const status = statusOf(comment);
  if (status === "closed") return comment;
  if (status !== RESOLVED_STATUS) {
    throw new CommentHttpError("only a resolved comment can be closed", 409);
  }
  const now = new Date().toISOString();
  return patchComment(dir, id, {
    status: "closed",
    updatedAt: now,
    closedAt: now,
    closedBy: actor,
  });
}

export function reopenComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
  reply?: StoredComment,
): StoredComment {
  requireHuman(actor);
  const { page, comment } = root(dir, id);
  const status = statusOf(comment);
  if (UNRESOLVED_STATUSES.includes(status as never)) {
    if (reply) {
      throw new CommentHttpError(
        "an active comment cannot be reopened with feedback",
        409,
      );
    }
    return comment;
  }
  if (status !== RESOLVED_STATUS && status !== "closed") {
    throw new CommentHttpError(
      `comment status "${status}" cannot be reopened`,
      409,
    );
  }
  const now = new Date().toISOString();
  if (!reply) {
    return patchComment(dir, id, {
      status: "open",
      updatedAt: now,
      closedAt: null,
      closedBy: null,
    });
  }

  return reopenWithReply({ dir, page, comment, actor, reply, updatedAt: now });
}

export function assertActiveStatusTransition(
  dir: string,
  id: string,
  nextStatus: string,
): void {
  const current = statusOf(root(dir, id).comment);
  if (
    !UNRESOLVED_STATUSES.includes(current as never) ||
    !UNRESOLVED_STATUSES.includes(nextStatus as never)
  ) {
    throw new CommentHttpError(
      "use the resolve, close, or reopen endpoint for lifecycle transitions",
      409,
    );
  }
}
