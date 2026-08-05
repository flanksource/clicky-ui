import { DOCUMENT_ANCHOR, type Comment } from "@flanksource/clicky-ui/comments";

import { tallyAnchors } from "./useDomAnchors";

/**
 * Renders a page's feedback as a block you can paste straight into a coding
 * agent. react-grab hands the agent the *element*; this hands it the *notes*.
 */
export function commentsToMarkdown(
  page: string,
  comments: Comment[],
  labels: Record<string, string>,
): string {
  const out: string[] = [`## Playground feedback — ${page}`, ""];

  const roots = comments.filter((comment) => !comment.parentId);
  if (roots.length === 0) {
    out.push("_No comments._", "");
    return out.join("\n");
  }

  const replies = new Map<string, Comment[]>();
  for (const comment of comments) {
    if (!comment.parentId) continue;
    replies.set(comment.parentId, [...(replies.get(comment.parentId) ?? []), comment]);
  }

  const rank = new Map(tallyAnchors(comments).map((tally, index) => [tally.anchor, index]));
  const ordered = [...roots].sort((a, b) => {
    const ar = rank.get(a.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    const br = rank.get(b.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    return ar - br || a.createdAt.localeCompare(b.createdAt);
  });

  ordered.forEach((root, index) => {
    const anchor = root.anchor ?? DOCUMENT_ANCHOR;
    const isDocument = anchor === DOCUMENT_ANCHOR;

    out.push(`### ${index + 1}. ${isDocument ? "Page-level" : (labels[anchor] ?? anchor)}`);
    if (!isDocument) out.push(`- anchor: \`${anchor}\``);
    out.push(`- status: ${root.status ?? "open"}`);
    out.push(`- ${root.author?.name ?? "Anonymous"}: ${root.body}`);
    for (const reply of replies.get(root.id) ?? []) {
      out.push(`  - ${reply.author?.name ?? "Anonymous"} replied: ${reply.body}`);
    }
    out.push("");
  });

  return out.join("\n");
}
