import { useEffect, useMemo, useRef, useState } from "react";
import { ActionError, Button } from "@flanksource/clicky-ui";
import { useCommentContext } from "@flanksource/clicky-ui/comments";
import { FileReview, isBuiltinFileReviewView, type FileReviewLayout } from "@flanksource/clicky-ui/file-findings";
import { MonacoProvider } from "@flanksource/clicky-ui/monaco";
import { UiSparkles } from "@flanksource/clicky-ui/icons";

import { getMonacoWorker } from "../editor/monaco-setup";
import type { PageSource } from "../editor/useSource";
import type { AnnotationVisibility, PlaygroundView } from "../route";
import { useBlame } from "./blame-api";
import { useCommentDetails } from "../comments/useCommentDetails";

export type MarkdownDocumentView = Extract<PlaygroundView, "preview" | "source">;

export type MarkdownDocumentPageProps = {
  slug: string;
  view: MarkdownDocumentView;
  onViewChange: (view: MarkdownDocumentView) => void;
  /** The page's source, loaded through the sources endpoint; owned by the shell so its dirty state gates page actions. */
  source: PageSource;
  /** Hidden annotations leave the document without comment highlights or threads. */
  annotations: AnnotationVisibility;
  /** Opens the Captain prompt dialog against this page's saved file. */
  onReview: (file: string) => void;
};

export function MarkdownDocumentPage({ slug, view, onViewChange, source, annotations, onReview }: MarkdownDocumentPageProps) {
  const ctx = useCommentContext();
  const detailTabs = useCommentDetails();
  const [layout, setLayout] = useState<FileReviewLayout>("margin");
  const { path, ready, draft, dirty, saving } = source;
  const blameState = useBlame(ready ? path : null, ready && !dirty ? draft : null);
  // git reads the file on disk; only blame that describes the text on screen is shown.
  const blame =
    blameState?.status === "ready" && blameState.blame.source === draft.replace(/\n$/, "") ? blameState.blame.ranges : undefined;
  const blameNote =
    blameState?.status === "error"
      ? `Blame unavailable: ${blameState.error}`
      : blameState?.status === "ready" && !blame
        ? "Blame unavailable: the file on disk differs from the loaded text"
        : null;

  const comments = useMemo(
    () => ({ items: ctx.comments, callbacks: ctx.callbacks, config: ctx.config, previewLines: 3, detailTabs }),
    [ctx.comments, ctx.callbacks, ctx.config, detailTabs],
  );
  const saveRef = useRef(source.save);
  useEffect(() => {
    saveRef.current = source.save;
  }, [source.save]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      void saveRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sourceError = source.error && <ActionError error={source.error} context={[["Operation", "Load or save source"], ["Page", slug]]} />;
  if (!ready || !path) return sourceError || <p className="p-density-3 text-xs text-muted-foreground">Loading source…</p>;

  const toolbar = (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={dirty}
        onClick={() => onReview(path)}
        title={dirty ? "Save before requesting a review" : "Review the saved file with a Captain prompt"}
      >
        <UiSparkles className="size-3.5" />
        AI review…
      </Button>
      {dirty && (
        <>
          <Button size="sm" variant="ghost" disabled={saving} onClick={source.revert}>
            Revert
          </Button>
          <Button size="sm" loading={saving} onClick={() => void source.save()} title="Save (⌘S)">
            Save
          </Button>
        </>
      )}
      <span className="truncate font-mono">{path}</span>
      {blameNote && (
        <span className="truncate" title={blameNote}>
          · {blameNote}
        </span>
      )}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-density-2" data-markdown-document={slug}>
      {sourceError}
      <MonacoProvider getWorker={getMonacoWorker}>
        <FileReview
          path={path}
          source={draft}
          view={view}
          onViewChange={(next) => {
            if (!isBuiltinFileReviewView(next) || next === "problems") throw new Error(`MarkdownDocumentPage: unexpected FileReview view "${next}"`);
            onViewChange(next);
          }}
          {...(annotations === "visible" ? { comments } : {})}
          selectToComment
          authorFilter
          layout={layout}
          onLayoutChange={setLayout}
          onSourceChange={source.setDraft}
          blame={blame}
          toolbar={toolbar}
          className="min-h-[480px] flex-1"
        />
      </MonacoProvider>
    </div>
  );
}
