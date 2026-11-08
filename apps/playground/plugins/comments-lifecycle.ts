import {
  findComment,
  patchComment,
  type StoredAuthor,
  type StoredComment,
} from "./comments-store";
import { LaunchHttpError } from "./launch-client";

export class CommentHttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}
async function root(dir: string, id: string) {
  const found = await findComment(dir, id);
  if (!found) throw new LaunchHttpError(404, `comment "${id}" not found`);
  if (found.comment.parentId)
    throw new CommentHttpError(
      "Only a thread root can change lifecycle stage",
      409,
    );
  return found.comment;
}
export function requireHuman(actor: StoredAuthor) {
  if (actor.kind !== "user")
    throw new CommentHttpError(
      "Only a human can close, reopen or assign comments",
      403,
    );
}
function sameAuthor(left: StoredAuthor, right: StoredAuthor) {
  return (
    left.name === right.name && (left.kind ?? "user") === (right.kind ?? "user")
  );
}
function requireActive(comment: StoredComment) {
  if (comment.status !== "open" && comment.status !== "in_progress")
    throw new CommentHttpError(
      `Comment status ${comment.status} is not active`,
      409,
    );
}
export async function resolveComment(
  dir: string,
  id: string,
): Promise<StoredComment> {
  const comment = await root(dir, id);
  if (comment.status === "resolved") return comment;
  requireActive(comment);
  return patchComment(
    dir,
    id,
    {
      status: "resolved",
      ...(comment.agentRun
        ? { agentRun: { ...comment.agentRun, state: "done" } }
        : {}),
    },
    { actor: comment.assignee ?? { name: "You", kind: "user" } },
  );
}
export async function acknowledgeComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
): Promise<StoredComment> {
  const comment = await root(dir, id);
  requireActive(comment);
  if (
    comment.assignee &&
    sameAuthor(comment.assignee, actor) &&
    comment.acknowledgedAt
  )
    return comment;
  return patchComment(
    dir,
    id,
    {
      status: "in_progress",
      assignee: actor,
      acknowledgedBy: actor,
      acknowledgedAt: new Date().toISOString(),
    },
    { actor },
  );
}
export async function assignComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
  assignee: StoredAuthor | null,
): Promise<StoredComment> {
  requireHuman(actor);
  const comment = await root(dir, id);
  requireActive(comment);
  const same =
    assignee && comment.assignee && sameAuthor(assignee, comment.assignee);
  const self = assignee && sameAuthor(assignee, actor);
  if (!assignee && !comment.assignee && comment.status === "open")
    return comment;
  if (same && (!self || comment.acknowledgedAt)) return comment;
  return patchComment(
    dir,
    id,
    {
      status: assignee ? "in_progress" : "open",
      assignee,
      ...(self
        ? { acknowledgedBy: actor, acknowledgedAt: new Date().toISOString() }
        : { acknowledgedBy: null, acknowledgedAt: null }),
    },
    { actor, assign: true },
  );
}
export async function closeComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
): Promise<StoredComment> {
  requireHuman(actor);
  const comment = await root(dir, id);
  if (comment.status === "closed") return comment;
  if (comment.status !== "resolved") requireActive(comment);
  return patchComment(
    dir,
    id,
    { status: "closed", closedBy: actor, closedAt: new Date().toISOString() },
    { actor },
  );
}
export async function reopenComment(
  dir: string,
  id: string,
  actor: StoredAuthor,
  reply?: StoredComment,
): Promise<StoredComment> {
  requireHuman(actor);
  const comment = await root(dir, id);
  if (comment.status === "open" || comment.status === "in_progress") {
    if (reply)
      throw new CommentHttpError(
        "An active comment cannot be reopened with feedback",
        409,
      );
    return comment;
  }
  return patchComment(
    dir,
    id,
    {
      status: "open",
      closedBy: null,
      closedAt: null,
      assignee: null,
      acknowledgedBy: null,
      acknowledgedAt: null,
      agentRun: null,
    },
    { actor, ...(reply ? { reply } : {}) },
  );
}
