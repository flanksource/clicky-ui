/**
 * Mirrors `DEFAULT_COMMENT_STATUSES` in the library's `comment-types.ts`. It has
 * to be re-stated here because the Vite config bundler cannot follow the
 * package alias. `comments-store.test.ts` asserts the two stay identical, so
 * drift fails the suite rather than reaching the UI.
 *
 * Deliberately import-free: the dashboard filter that the copied watcher script
 * runs under plain Node type stripping reads these lists too.
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

/** A root with no stored status has not been acted on, so it is open. */
export const IMPLICIT_STATUS = "open";

export function isUnresolvedStatus(status: string | undefined): boolean {
  return (UNRESOLVED_STATUSES as readonly string[]).includes(
    status ?? IMPLICIT_STATUS,
  );
}
