import { useCallback, useMemo, useState } from "react";
import type { DropdownMenuItem } from "@flanksource/clicky-ui";
import type { Comment } from "@flanksource/clicky-ui/comments";

import { folderForPage, pages, type PageEntry } from "../registry";
import { externalPage } from "../bookmarklet/external-catalog";
import type { ExternalPage } from "../bookmarklet/model";
import { writeClipboard } from "./clipboard";
import {
  commentsForFolder,
  commentsToMarkdown,
  groupByPage,
  type CommentPageSection,
} from "./markdown";
import {
  COMMENTS_ROUTE,
  fetchComments,
  type PlaygroundComment,
} from "./useComments";

export function useFeedbackCopy({
  active,
  comments,
  labels,
  external,
}: {
  active: PageEntry | undefined;
  external?: ExternalPage | undefined;
  comments: Comment[];
  labels: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const markdownOptions = useMemo(
    () => ({
      labels,
      pageUrl: (page: string) => {
        const target = externalPage(page);
        if (target) return target.urls[0]!;
        if (page.startsWith("external:"))
          throw new Error(`External page ${page} is missing from the catalog`);
        const url = new URL(window.location.origin);
        url.searchParams.set("page", page);
        return url.href;
      },
      pagePath: (page: string) => {
        if (!page.startsWith("external:"))
          return `apps/playground/src/pages/${page}.tsx`;
        const url = externalPage(page)?.urls[0];
        if (!url)
          throw new Error(`External page ${page} is missing from the catalog`);
        return url;
      },
      screenshotUrl: (url: string) => new URL(url, window.location.origin).href,
      commentActionUrls: (commentId: string) => {
        const encodedId = encodeURIComponent(commentId);
        return {
          reply: new URL(
            `${COMMENTS_ROUTE}/${encodedId}/replies`,
            window.location.origin,
          ).href,
          resolve: new URL(
            `${COMMENTS_ROUTE}/${encodedId}/resolve`,
            window.location.origin,
          ).href,
        };
      },
    }),
    [labels],
  );

  const copyMarkdown = useCallback(
    async (
      load: () => CommentPageSection[] | Promise<CommentPageSection[]>,
    ) => {
      try {
        await writeClipboard(
          Promise.resolve(load()).then((sections) =>
            commentsToMarkdown(sections, markdownOptions),
          ),
        );
        setCopyError(null);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch (cause) {
        setCopyError(cause instanceof Error ? cause.message : String(cause));
      }
    },
    [markdownOptions],
  );

  const threadToMarkdown = useCallback(
    (thread: readonly Comment[]) => {
      const page = external?.id ?? active?.slug;
      if (!page) throw new Error("Cannot copy feedback without an active page");
      return commentsToMarkdown(
        [
          {
            page,
            comments: [...thread] as PlaygroundComment[],
          },
        ],
        markdownOptions,
      );
    },
    [active, external, markdownOptions],
  );

  const copyFeedback = useCallback(() => {
    const page = external?.id ?? active?.slug;
    if (!page) return;
    void copyMarkdown(() => [{ page, comments }]);
  }, [active, external, comments, copyMarkdown]);

  const activeFolder = active ? folderForPage(active.slug, pages()) : undefined;
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
              comments: await fetchComments({
                page: active.slug,
                unresolved: true,
              }),
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

  return {
    copied,
    copyError,
    copyFeedback,
    copyActions,
    threadToMarkdown,
  };
}
