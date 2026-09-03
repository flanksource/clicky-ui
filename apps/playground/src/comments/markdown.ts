import {
  DOCUMENT_ANCHOR,
  buildReplyMap,
  getRoots,
  sortReplies,
} from "@flanksource/clicky-ui/comments";

import type { PageComment, PlaygroundComment } from "./useComments";
import { tallyAnchors } from "./useDomAnchors";

/** One page's notes. A cross-page copy passes several; the toolbar passes one. */
export type CommentPageSection = {
  page: string;
  comments: PlaygroundComment[];
};

export type CommentMarkdownOptions = {
  labels: Record<string, string>;
  pageUrl: (page: string) => string;
  pagePath: (page: string) => string;
  screenshotUrl?: (url: string) => string;
  commentActionUrls?: (commentId: string) => {
    reply: string;
    resolve: string;
  };
};

/** Splits a cross-page listing into sections, in the order pages first appear. */
export function groupByPage(comments: PageComment[]): CommentPageSection[] {
  const sections = new Map<string, PlaygroundComment[]>();
  for (const { page, ...comment } of comments) {
    sections.set(page, [...(sections.get(page) ?? []), comment]);
  }
  return [...sections].map(([page, list]) => ({ page, comments: list }));
}

export function commentsForFolder(
  comments: PageComment[],
  folder: string,
): CommentPageSection[] {
  return groupByPage(
    comments.filter(
      ({ page }) => page === folder || page.startsWith(`${folder}/`),
    ),
  );
}

function renderSection(
  { page, comments }: CommentPageSection,
  {
    labels,
    pageUrl,
    pagePath,
    screenshotUrl = (url) => url,
    commentActionUrls,
  }: CommentMarkdownOptions,
): string[] {
  const out = [
    `## Playground feedback — ${page}`,
    `- URL: ${pageUrl(page)}`,
    `- source: \`${pagePath(page)}\``,
    "",
  ];

  const roots = getRoots(comments);
  if (roots.length === 0) {
    out.push("_No comments._", "");
    return out;
  }

  const replies = buildReplyMap(comments);
  const elementByComment = new Map(
    comments.map((comment) => [comment.id, comment.element]),
  );
  const rank = new Map(
    tallyAnchors(comments).map((tally, index) => [tally.anchor, index]),
  );
  const ordered = [...roots].sort((a, b) => {
    const ar = rank.get(a.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    const br = rank.get(b.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    return ar - br || a.createdAt.localeCompare(b.createdAt);
  });

  ordered.forEach((root, index) => {
    const anchor = root.anchor ?? DOCUMENT_ANCHOR;
    const isDocument = anchor === DOCUMENT_ANCHOR;

    out.push(
      `### ${index + 1}. ${isDocument ? "Page-level" : (labels[anchor] ?? anchor)}`,
    );
    if (!isDocument) out.push(`- anchor: \`${anchor}\``);
    out.push(`- status: ${root.status ?? "open"}`);
    if (root.rating) out.push(`- rating: ${root.rating}`);
    const actionUrls = commentActionUrls?.(root.id);
    if (actionUrls) {
      out.push(
        `- add comment: \`POST ${actionUrls.reply}\``,
        `- mark resolved: \`POST ${actionUrls.resolve}\``,
      );
    }
    if (root.body.trim()) {
      out.push(`- ${root.author?.name ?? "Anonymous"}: ${root.body}`);
    } else {
      out.push(`- author: ${root.author?.name ?? "Anonymous"}`);
    }
    for (const reply of sortReplies(replies.get(root.id) ?? [])) {
      out.push(
        `  - ${reply.author?.name ?? "Anonymous"} replied: ${reply.body}`,
      );
    }
    const element = elementByComment.get(root.id);
    if (element) {
      out.push("");
      if (element.componentName) {
        out.push(`**Component:** \`<${element.componentName}>\``, "");
      }
      out.push(
        "```",
        element.source,
        "```",
        "",
        "**HTML:**",
        "```html",
        element.html,
        "```",
      );
      if (element.screenshot?.status === "captured") {
        out.push(
          "",
          "## Attachments",
          "",
          `![${element.screenshot.filename}](${screenshotUrl(element.screenshot.url)})`,
        );
      } else if (element.screenshot?.status === "unavailable") {
        out.push(
          "",
          `**Screenshot:** unavailable (${element.screenshot.reason})`,
        );
      }
    }
    out.push("");
  });

  return out;
}

/**
 * Renders feedback as a block you can paste straight into a coding agent.
 * Each new root carries its element or page snapshot, so cross-page copies
 * retain source, HTML, and screenshot context.
 *
 * `labels` are resolved from the live DOM and therefore only cover the page
 * currently rendered — sections for other pages fall back to the raw CSS-path
 * anchor, which is still what an agent needs to find the element.
 */
export function commentsToMarkdown(
  sections: CommentPageSection[],
  options: CommentMarkdownOptions,
): string {
  if (sections.length === 0) return "_No comments._\n";
  return sections
    .flatMap((section) => renderSection(section, options))
    .join("\n");
}
