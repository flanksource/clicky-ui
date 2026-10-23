// Pure and import-light on purpose: the playground's Vite plugins render the
// same thread markdown as the browser, and the plugin bundle can neither resolve
// the `@flanksource/clicky-ui` aliases nor load React.
import {
  DOCUMENT_ANCHOR,
  type Comment,
} from "../../../../packages/ui/src/comments/comment-types";

export type AnchorTally = { anchor: string; count: number; first: string };

/** Root comments grouped by anchor, ordered by when the anchor was first used. */
export function tallyAnchors(comments: Comment[]): AnchorTally[] {
  const tallies = new Map<string, AnchorTally>();
  for (const comment of comments) {
    if (comment.parentId) continue; // replies share their root's pin
    const anchor = comment.anchor ?? DOCUMENT_ANCHOR;
    if (anchor === DOCUMENT_ANCHOR) continue;

    const existing = tallies.get(anchor);
    if (!existing) {
      tallies.set(anchor, { anchor, count: 1, first: comment.createdAt });
      continue;
    }
    existing.count += 1;
    if (comment.createdAt < existing.first) existing.first = comment.createdAt;
  }
  return [...tallies.values()].sort(
    (a, b) => a.first.localeCompare(b.first) || a.anchor.localeCompare(b.anchor),
  );
}
