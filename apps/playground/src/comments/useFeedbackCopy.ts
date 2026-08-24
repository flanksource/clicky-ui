import { useCallback, useMemo, useState } from "react";
import type { DropdownMenuItem } from "@flanksource/clicky-ui";
import type { Comment } from "@flanksource/clicky-ui/comments";

import { PAGES, folderForPage, type PageEntry } from "../registry";
import { writeClipboard } from "./clipboard";
import {
  commentsForFolder,
  commentsToMarkdown,
  groupByPage,
  type CommentPageSection,
} from "./markdown";
import { fetchComments } from "./useComments";

export function useFeedbackCopy({
  active,
  comments,
  labels,
}: {
  active: PageEntry | undefined;
  comments: Comment[];
  labels: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copyMarkdown = useCallback(
    async (load: () => CommentPageSection[] | Promise<CommentPageSection[]>) => {
      try {
        await writeClipboard(
          Promise.resolve(load()).then((sections) =>
            commentsToMarkdown(sections, {
              labels,
              pageUrl: (page) => {
                const url = new URL(window.location.origin);
                url.searchParams.set("page", page);
                return url.href;
              },
              pagePath: (page) => `apps/playground/src/pages/${page}.tsx`,
            }),
          ),
        );
        setCopyError(null);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch (cause) {
        setCopyError(cause instanceof Error ? cause.message : String(cause));
      }
    },
    [labels],
  );

  const copyFeedback = useCallback(() => {
    if (!active) return;
    void copyMarkdown(() => [{ page: active.slug, comments }]);
  }, [active, comments, copyMarkdown]);

  const activeFolder = active ? folderForPage(active.slug, PAGES) : undefined;
  const activeFolderLabel = activeFolder
    ?.split("/")
    .map((part) => part.replace(/[-_]+/g, " "))
    .join(" / ");
  const copyActions = useMemo<DropdownMenuItem[]>(
    () => [
      {
        label: "Copy open comments (this page)",
        title: "Unresolved notes on the page you are looking at",
        disabled: active === undefined,
        onSelect: () => {
          if (!active) return;
          void copyMarkdown(async () => [
            {
              page: active.slug,
              comments: await fetchComments({ page: active.slug, unresolved: true }),
            },
          ]);
        },
      },
      ...(activeFolder && activeFolderLabel
        ? [
            {
              label: "Copy all comments (this folder)",
              title: `Every note under ${activeFolderLabel}, resolved ones included`,
              onSelect: () =>
                void copyMarkdown(async () =>
                  commentsForFolder(await fetchComments(), activeFolder),
                ),
            },
          ]
        : []),
      {
        label: "Copy all open comments",
        title: "Unresolved notes from every artifact page",
        onSelect: () =>
          void copyMarkdown(async () =>
            groupByPage(await fetchComments({ unresolved: true })),
          ),
      },
      {
        label: "Copy all comments",
        title: "Every note from every artifact page, resolved ones included",
        onSelect: () =>
          void copyMarkdown(async () => groupByPage(await fetchComments())),
      },
    ],
    [active, activeFolder, activeFolderLabel, copyMarkdown],
  );

  return { copied, copyError, copyFeedback, copyActions };
}
