import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@flanksource/clicky-ui";
import { useCommentContext } from "@flanksource/clicky-ui/comments";
import { FileReview, isBuiltinFileReviewView, lintFindings, type FileReviewLayout } from "@flanksource/clicky-ui/file-findings";
import { MonacoProvider } from "@flanksource/clicky-ui/monaco";
import { UiSparkles } from "@flanksource/clicky-ui/icons";

import { getMonacoWorker } from "../editor/monaco-setup";
import type { PageSource } from "../editor/useSource";
import { PlaygroundBanner as Banner } from "../PlaygroundShellParts";
import type { AnnotationVisibility, PlaygroundView } from "../route";
import { useBlame } from "./blame-api";
import { usePageLint, type LintRun } from "./lint-api";

export type MarkdownDocumentView = Extract<PlaygroundView, "preview" | "source" | "problems">;

export type MarkdownDocumentPageProps = {
  slug: string;
  view: MarkdownDocumentView;
  onViewChange: (view: MarkdownDocumentView) => void;
  /** The page's source, loaded through the sources endpoint; owned by the shell so its dirty state gates page actions. */
  source: PageSource;
  /** Hidden annotations leave the document without comment highlights or threads. */
  annotations: AnnotationVisibility;
  /** Opens the Captain prompt dialog against this page's saved file. */
  onLint: (file: string) => void;
};

function runError(run: LintRun): string | null {
  return run.status === "error" ? run.error : null;
}

/**
 * A markdown page reviewed in place: rendered, as editable source, or as its
 * Problems list. People's threads come from the playground comment store
 * (anchored on quoted words), findings from gavel lint and, on request, an AI
 * review or a Captain prompt run (Lint). Linting reads the file on disk, so a
 * save re-lints and unsaved edits show the findings from the last save.
 */
export function MarkdownDocumentPage({ slug, view, onViewChange, source, annotations, onLint }: MarkdownDocumentPageProps) {
  const ctx = useCommentContext();
  const { runs, results, run } = usePageLint(slug);
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

  const findings = useMemo(
    () => (path ? lintFindings(results).filter((finding) => finding.file === path) : []),
    [path, results],
  );
  const comments = useMemo(
    () => ({ items: ctx.comments, callbacks: ctx.callbacks, config: ctx.config }),
    [ctx.comments, ctx.callbacks, ctx.config],
  );
  const runId = (runs.prompt.status === "done" ? runs.prompt.results : []).find((result) => result.run_id)?.run_id;

  useEffect(() => {
    if (ready) void run("lint");
  }, [ready, run]);

  const saveAndLint = async () => {
    if (await source.save()) void run("lint");
  };
  // The keydown listener is bound once; it always calls the latest save.
  const saveRef = useRef(saveAndLint);
  useEffect(() => {
    saveRef.current = saveAndLint;
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      void saveRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const errors = [source.error, runError(runs.lint), runError(runs.prompt)].filter(
    (error): error is string => error !== null,
  );

  if (!ready || !path) return <p className="p-density-3 text-xs text-muted-foreground">Loading source…</p>;

  const toolbar = (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={dirty}
        onClick={() => onLint(path)}
        title={
          dirty
            ? "Save first: a Captain prompt run lints the saved file"
            : "Run a Captain prompt (lint preset) on the saved file; its findings arrive as a comment on the page"
        }
      >
        Lint
      </Button>
      <Button
        size="sm"
        variant="outline"
        loading={runs.prompt.status === "running"}
        onClick={() => void run("prompt")}
        title="Ask Captain for a grammar, wording and clarity review of the saved file"
      >
        <UiSparkles className="size-3.5" />
        AI review
      </Button>
      {runId && <span className="font-mono">Captain run {runId}</span>}
      {dirty && (
        <>
          <span className="text-amber-600">Findings are from the last save</span>
          <Button size="sm" variant="ghost" disabled={saving} onClick={source.revert}>
            Revert
          </Button>
          <Button size="sm" loading={saving} onClick={() => void saveAndLint()} title="Save (⌘S)">
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
      {errors.map((error) => (
        <Banner key={error} tone="danger">
          {error}
        </Banner>
      ))}
      <MonacoProvider getWorker={getMonacoWorker}>
        <FileReview
          path={path}
          source={draft}
          view={view}
          onViewChange={(next) => {
            if (!isBuiltinFileReviewView(next)) throw new Error(`MarkdownDocumentPage: FileReview chose view "${next}", but this page passes no tabs`);
            onViewChange(next);
          }}
          findings={findings}
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
