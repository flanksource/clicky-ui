import { COMMENT_STATUSES, isUnresolvedStatus } from "./comments-statuses";

export type FeedbackActivity = {
  updated: number;
  commented: number;
  resolved: number;
  openCount: number;
  resolvedCount: number;
  waitingOn: string[];
  rootCounts: Record<string, number>;
  commentCount: number;
};

type ActivityComment = {
  page: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string | null;
  status?: string;
  assignee?: { name: string } | null;
};

export function commentActivity(comments: readonly ActivityComment[]): Record<string, FeedbackActivity> {
  const pages = Object.create(null) as Record<string, FeedbackActivity>;
  for (const comment of comments) {
    const time = Date.parse(comment.updatedAt ?? comment.createdAt);
    if (!Number.isFinite(time)) throw new Error(`Invalid activity timestamp for ${comment.page}`);
    const page = pages[comment.page] ??= { updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, waitingOn: [], rootCounts: Object.fromEntries(COMMENT_STATUSES.map((status) => [status, 0])), commentCount: 0 };
    page.commentCount++;
    page.commented = Math.max(page.commented, time);
    if (comment.parentId) continue;
    const status = comment.status ?? "open";
    if (!Object.hasOwn(page.rootCounts, status)) throw new Error(`Invalid comment status ${status}`);
    page.rootCounts[status] = (page.rootCounts[status] ?? 0) + 1;
    if (isUnresolvedStatus(status)) page.openCount++;
    if (status === "resolved") {
      page.resolvedCount++;
      page.resolved = Math.max(page.resolved, time);
    }
    const name = status === "resolved" ? "You · review" : isUnresolvedStatus(status) ? comment.assignee?.name ?? "Unassigned" : null;
    if (name && !page.waitingOn.includes(name)) page.waitingOn.push(name);
    page.waitingOn.sort();
  }
  return pages;
}

export function assertFeedbackActivity(value: unknown): asserts value is Record<string, FeedbackActivity> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid comment activity");
  for (const [slug, item] of Object.entries(value)) {
    if (!item || typeof item !== "object") throw new Error(`Invalid activity for ${slug}`);
    const page = item as Partial<FeedbackActivity>;
    if ([page.updated, page.commented, page.resolved, page.openCount, page.resolvedCount, page.commentCount].some((field) => typeof field !== "number" || !Number.isFinite(field) || field < 0)
      || !Array.isArray(page.waitingOn) || page.waitingOn.some((name) => typeof name !== "string")
      || !page.rootCounts || COMMENT_STATUSES.some((status) => typeof page.rootCounts?.[status] !== "number")) {
      throw new Error(`Invalid activity fields for ${slug}`);
    }
  }
}
