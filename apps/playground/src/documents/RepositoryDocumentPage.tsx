import { useEffect, useMemo, useState } from "react";
import { ActionError, Button, useCommentContext } from "@flanksource/clicky-ui";
import {
  FileReview,
  isBuiltinFileReviewView,
  type FileReviewLayout,
} from "@flanksource/clicky-ui/file-findings";
import { MonacoProvider } from "@flanksource/clicky-ui/monaco";
import { getMonacoWorker } from "../editor/monaco-setup";
import type { MarkdownDocumentPageProps } from "../markdown-doc/MarkdownDocumentPage";
import type { RepositorySource } from "./useDocumentSource";
import { documentPath } from "./types";
import { workspaceURL } from "./api";
import { useDocumentBlame } from "./useDocumentBlame";
import { useCommentDetails } from "../comments/useCommentDetails";

export function RepositoryDocumentPage({
  slug,
  source,
  view,
  onViewChange,
  annotations,
  onReview,
}: Omit<MarkdownDocumentPageProps, "source"> & { source: RepositorySource }) {
  const context = useCommentContext();
  const detailTabs = useCommentDetails();
  const [layout, setLayout] = useState<FileReviewLayout>("margin");
  const target = documentPath(slug);
  const blame = useDocumentBlame(
    source.repository?.root,
    target.path,
    source.revision,
  );
  const comments = useMemo(
    () => ({
      items: context.comments,
      callbacks: context.callbacks,
      config: context.config,
      previewLines: 3,
      detailTabs,
    }),
    [context.comments, context.callbacks, context.config, detailTabs],
  );
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        void source.save();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [source.save]);
  const resolveUrl = (url: string, kind: "link" | "image") => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
    const base = new URL(target.path, "https://repository.invalid/");
    const resolved = new URL(url, base);
    const path = decodeURIComponent(resolved.pathname.slice(1));
    if (kind === "image")
      return workspaceURL("asset", source.repository!.root, path);
    if (/\.(md|mdx|markdown)$/i.test(path))
      return `/?${new URLSearchParams({ page: `document:${target.repositoryId}/${path}` })}${resolved.hash}`;
    return url;
  };
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-2"
      data-repository-document={slug}
    >
      {source.error && <ActionError error={source.error} title="Repository review failed" context={[["Operation", "Load or save document"], ["Document", slug]]} />}
      {source.conflict && (
        <p role="alert" className="rounded border border-border p-2 text-sm">
          The file changed on disk. Your draft is preserved. Copy it before
          choosing Reload disk, then reapply your changes.
        </p>
      )}
      {!source.ready || !source.path ? (
        <p role="status">
          {source.error
            ? "Document unavailable. Its review history is retained."
            : "Loading document…"}
        </p>
      ) : (
        <MonacoProvider getWorker={getMonacoWorker}>
          <FileReview
            path={source.path}
            source={source.draft}
            view={view}
            onViewChange={(next) => {
              if (!isBuiltinFileReviewView(next) || next === "problems") throw new Error(`RepositoryDocumentPage: unexpected FileReview view "${next}"`);
              onViewChange(next);
            }}
            {...(annotations === "visible" ? { comments } : {})}
            selectToComment
            authorFilter
            layout={layout}
            onLayoutChange={setLayout}
            onSourceChange={source.setDraft}
            resolveUrl={resolveUrl}
            blame={source.dirty ? undefined : blame?.ranges}
            toolbar={
              <>
                <Button
                  size="sm"
                  loading={source.saving}
                  disabled={!source.dirty}
                  onClick={() => void source.save()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!source.dirty && !source.conflict}
                  onClick={source.revert}
                >
                  Reload disk
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={source.dirty}
                  onClick={() => onReview(target.path)}
                >
                  AI review…
                </Button>
                <span role="status">{source.live}</span>
                {blame?.note && (
                  <span className="text-muted-foreground">{blame.note}</span>
                )}
                <span className="truncate font-mono" title={source.path}>
                  {source.repository?.name}/{target.path}
                </span>
              </>
            }
            className="min-h-0 flex-1"
          />
        </MonacoProvider>
      )}
    </div>
  );
}
