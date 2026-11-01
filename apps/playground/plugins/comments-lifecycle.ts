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
import { IMPLICIT_STATUS } from "./comments-statuses";

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
  return comment.status ?? IMPLICIT_STATUS;
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
    // The agent resolving its own hand-off is how a shared session reports
    // completion of one thread.
    ...(comment.agentRun
      ? { agentRun: { ...comment.agentRun, state: "done" as const } }
      : {}),
  });
}

function requireHuman(actor: StoredAuthor, action: string): void {
  if (actor.kind !== "user") {
    throw new CommentHttpError(`only a human user can ${action}`, 403);
  }
}

/** Two actors are the same holder when name and kind agree; session metadata varies per run. */
function sameAuthor(left: StoredAuthor, right: StoredAuthor): boolean {
  return (
    left.name === right.name && (left.kind ?? "user") === (right.kind ?? "user")
  );
}

function requireUnresolved(comment: StoredComment, action: string): string {
  const status = statusOf(comment);
  if (!UNRESOLVED_STATUSES.includes(status as never)) {
    throw new CommentHttpError(
      `comment status "${status}" cannot be ${action}`,
      409,
    );
  }
  return status;
}

/**
 * Claims a root for `actor`: `open` becomes `in_progress` with the actor as
 * assignee. Repeating the call as the holder changes nothing, another agent's
 * claim is refused, and a user may take a thread over from anyone.
 */
export function acknowledgeComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
): StoredComment {
  const { comment } = root(dir, id);
  requireUnresolved(comment, "acknowledged");
  const holder = comment.assignee;
  if (holder && !sameAuthor(holder, actor)) {
    if (actor.kind !== "user") {
      throw new CommentHttpError(
        `comment is already held by ${holder.name}; only a human user can take it over`,
        409,
      );
    }
  } else if (holder && comment.acknowledgedAt) {
    return comment;
  }
  const now = new Date().toISOString();
  return patchComment(dir, id, {
    status: "in_progress",
    assignee: actor,
    acknowledgedBy: actor,
    acknowledgedAt: now,
    updatedAt: now,
  });
}

/**
 * Human-only: hands an active root to `assignee`, or clears the hand-off with
 * `null`, which returns the root to `open`. The assignee still has to
 * acknowledge, unless the actor assigned themselves.
 */
export function assignComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
  assignee: StoredAuthor | null,
): StoredComment {
  requireHuman(actor, "assign comments");
  const { comment } = root(dir, id);
  const status = requireUnresolved(comment, "assigned");
  const now = new Date().toISOString();
  if (assignee === null) {
    if (!comment.assignee && status === "open") return comment;
    return patchComment(dir, id, {
      status: "open",
      assignee: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      updatedAt: now,
    });
  }
  const sameHolder = comment.assignee && sameAuthor(comment.assignee, assignee);
  const selfAssigned = sameAuthor(assignee, actor);
  const acknowledge = selfAssigned && !(sameHolder && comment.acknowledgedAt);
  if (sameHolder && status === "in_progress" && !acknowledge) return comment;
  return patchComment(dir, id, {
    status: "in_progress",
    assignee,
    updatedAt: now,
    ...(acknowledge
      ? { acknowledgedBy: assignee, acknowledgedAt: now }
      : sameHolder
        ? {}
        : { acknowledgedBy: null, acknowledgedAt: null }),
  });
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
  delete reopened.assignee;
  delete reopened.acknowledgedAt;
  delete reopened.acknowledgedBy;
  delete reopened.agentRun;

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
  requireHuman(actor, "close or reopen comments");
  const { comment } = root(dir, id);
  const status = statusOf(comment);
  if (status === "closed") return comment;
  if (
    status !== RESOLVED_STATUS &&
    !UNRESOLVED_STATUSES.includes(status as never)
  ) {
    throw new CommentHttpError(
      `comment status "${status}" cannot be closed`,
      409,
    );
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
  requireHuman(actor, "close or reopen comments");
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
      assignee: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      agentRun: null,
    });
  }

  return reopenWithReply({ dir, page, comment, actor, reply, updatedAt: now });
}
