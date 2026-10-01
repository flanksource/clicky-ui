import { assertComment, type StoredComment } from "./comments-store";

/** A review decision is one anchored comment; older decisions remain as history. */
export function recordReviewDecision(
  comments: readonly StoredComment[],
  decision: StoredComment,
): StoredComment[] {
  assertComment(decision);
  if (!decision.reviewDecision)
    throw new Error("a review decision is required");
  if (decision.author?.kind !== "user")
    throw new Error("only a human can review an element");
  const actor = decision.author;
  if (
    !decision.anchor ||
    !/^\[data-review-id="[A-Za-z][A-Za-z0-9:_-]*"\]$/.test(decision.anchor)
  )
    throw new Error("a review decision requires a review anchor");
  if (decision.rating)
    throw new Error("a review decision cannot also be a rating");
  if (decision.reviewDecision !== "approved" && !decision.body.trim()) {
    throw new Error("rejection and revision require a comment");
  }
  if (comments.some((comment) => comment.id === decision.id)) {
    throw new Error(`comment id ${JSON.stringify(decision.id)} already exists`);
  }
  const next = comments.map((comment) => {
    if (
      comment.parentId ||
      !comment.reviewDecision ||
      comment.anchor !== decision.anchor ||
      comment.status === "closed"
    )
      return comment;
    return {
      ...comment,
      status: "closed" as const,
      updatedAt: decision.createdAt,
      closedAt: decision.createdAt,
      closedBy: actor,
    };
  });
  return [
    ...next,
    decision.reviewDecision === "approved"
      ? {
          ...decision,
          status: "closed" as const,
          closedAt: decision.createdAt,
          closedBy: actor,
        }
      : { ...decision, status: "open" as const },
  ];
}
