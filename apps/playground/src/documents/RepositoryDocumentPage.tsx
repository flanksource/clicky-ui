import { useEffect, useMemo, useState } from "react";
import { ActionError, Button, useCommentContext } from "@flanksource/clicky-ui";
import {
  FileReview,
  lintFindings,
  type FileReviewLayout,
} from "@flanksource/clicky-ui/file-findings";
import { MonacoProvider } from "@flanksource/clicky-ui/monaco";
import { getMonacoWorker } from "../editor/monaco-setup";
import type { MarkdownDocumentPageProps } from "../markdown-doc/MarkdownDocumentPage";
import type { RepositorySource } from "./useDocumentSource";
import { documentPath } from "./types";
import { useDocumentLint } from "./useDocumentLint";
import { workspaceURL } from "./api";
import { useDocumentBlame } from "./useDocumentBlame";
import { useProblemFilters } from "../markdown-doc/useProblemFilters";
import { useDocumentProblems } from "./problems";
import { useCommentDetails } from "../comments/useCommentDetails";
import { LintDialog } from "./LintDialog";
import { useLintFindings } from "./useLintFindings";

export function RepositoryDocumentPage({
  slug,
  source,
  view,
  onViewChange,
  annotations,
  onLint,
}: Omit<MarkdownDocumentPageProps, "source"> & { source: RepositorySource }) {
  const context = useCommentContext();
  const problems = useDocumentProblems();
  const detailTabs = useCommentDetails();
  const [layout, setLayout] = useState<FileReviewLayout>("margin");
  const [problemFilters, setProblemFilters] = useProblemFilters();
  const [lintDialog, setLintDialog] = useState(false);
  const [linters, setLinters] = useState(["markdownlint", "vale"]);
  const target = documentPath(slug);
  const lint = useDocumentLint({
    id: slug,
    root: source.repository?.root,
    path: target.path,
    revision: source.revision,
  });
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
  const results = useMemo(
    () => [
      ...(lint.run?.lint ?? problems.results[slug]?.plain ?? []),
      ...(problems.results[slug]?.prompt ?? []),
    ],
    [lint.run?.lint, problems.results, slug],
  );
  const review = useLintFindings({ root: source.repository?.root, results });
  const findings = useMemo(
    () =>
      lintFindings(review.results)
        .filter(
          (finding) =>
            finding.file === target.path ||
            finding.file === source.path ||
            `${finding.workDir}/${finding.file}` === source.path,
        )
        .map((finding) => ({ ...finding, file: source.path! })),
    [review.results, target.path, source.path],
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
      {([["Load document", source.error], ["Lint document", lint.error], ["Review findings", review.error]] as const).map(([operation, error]) => error && <ActionError key={operation} error={error} title="Repository review failed" context={[["Operation", operation], ["Document", slug]]} />)}
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
            onViewChange={onViewChange}
            findings={findings}
            getFindingActions={review.getFindingActions}
            problemFilters={problemFilters}
            onProblemFiltersChange={setProblemFilters}
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
                  disabled={
                    source.dirty || lint.starting || lint.run?.status.running
                  }
                  onClick={() => setLintDialog(true)}
                >
                  Run lint…
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={source.dirty}
                  onClick={() => onLint(target.path)}
                >
                  AI review…
                </Button>
                {lint.run?.status.running && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void lint.stop()}
                  >
                    Stop lint
                  </Button>
                )}
                <span role="status">{source.live}</span>
                {review.status && <span role="status">{review.status}</span>}
                {blame?.note && (
                  <span className="text-muted-foreground">{blame.note}</span>
                )}
                {(source.dirty || lint.stale) && (
                  <span className="text-muted-foreground">
                    Findings describe a previous source revision
                  </span>
                )}
                {lint.run && (
                  <span
                    className="font-mono"
                    title={lint.run.metadata.executionId}
                  >
                    Lint {lint.run.status.state} ·{" "}
                    {lint.run.metadata.labels["sourceRevision"]?.slice(0, 8)}
                  </span>
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
      {lintDialog && source.repository && (
        <LintDialog
          root={source.repository.root}
          path={target.path}
          page={slug}
          selected={linters}
          onPrompt={(promptId) => {
            setLintDialog(false);
            onLint(target.path, promptId);
          }}
          onRun={async (next) => {
            await lint.relint(next);
            setLinters(next);
          }}
          onClose={() => setLintDialog(false)}
        />
      )}
    </div>
  );
}
