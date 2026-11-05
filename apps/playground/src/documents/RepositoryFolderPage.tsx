import { useCallback, useMemo, useState } from "react";
import { ActionError, Button, DOCUMENT_ANCHOR, LintResults } from "@flanksource/clicky-ui";
import { usePromptRuns } from "../prompt-runs/PromptRunsProvider";
import { documentJson, folderLintScope, workspaceURL } from "./api";
import { useRepositoryCatalog } from "./catalog";
import { LintDialog } from "./LintDialog";
import { refreshDocumentProblems, useDocumentProblems } from "./problems";
import { folderPath } from "./types";
import { useDocumentLint } from "./useDocumentLint";
import { useFolderProblemsView } from "./useFolderProblemsView";
import { useLintFindings } from "./useLintFindings";

export function RepositoryFolderPage({
  id,
  onNavigate,
}: {
  id: string;
  onNavigate: (slug: string) => void;
}) {
  const target = folderPath(id);
  const catalog = useRepositoryCatalog();
  const repository = catalog.repositories.find(
    (item) => item.id === target.repositoryId,
  );
  const problems = useDocumentProblems();
  const [state, setState] = useFolderProblemsView();
  const [dialog, setDialog] = useState(false);
  const [linters, setLinters] = useState(["markdownlint", "vale"]);
  const { openPrompt } = usePromptRuns();
  const prepare = useCallback(() => folderLintScope(id), [id]);
  const lint = useDocumentLint({
    id,
    root: repository?.root,
    path: target.path,
    revision: undefined,
    prepare,
  });
  const results = useMemo(() => {
    if (!repository) return [];
    const prefix = `document:${target.repositoryId}/`;
    return Object.entries(problems.results).flatMap(([document, entry]) => {
      if (!document.startsWith(prefix)) return [];
      const file = document.slice(prefix.length);
      if (target.path !== "." && !file.startsWith(`${target.path}/`)) return [];
      return [...entry.plain, ...entry.prompt].map((result) => ({
        ...result,
        work_dir: repository.root,
        violations:
          result.violations?.map((violation) => ({ ...violation, file })) ??
          null,
      }));
    });
  }, [problems.results, target.repositoryId, target.path, repository]);
  const review = useLintFindings({ root: repository?.root, results });
  const loadSource = useCallback(
    async ({ file }: { file: string }) => {
      if (!repository) throw new Error("Repository is not loaded");
      return (
        await documentJson<{ source: string }>(
          workspaceURL("file", repository.root, file),
        )
      ).source;
    },
    [repository],
  );
  const runPrompt = (promptId?: string) => {
    if (!repository) throw new Error("Repository is not loaded");
    setDialog(false);
    openPrompt({
      page: id,
      anchor: DOCUMENT_ANCHOR,
      element: Promise.resolve({
        source: `${repository.root}/${target.path}`,
        html: "<section>Folder Markdown review</section>",
      }),
      ...(promptId ? { promptId } : {}),
    });
  };
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3"
      data-repository-folder={id}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Folder problems</h1>
          <p className="break-words text-sm text-muted-foreground">
            {repository?.name} / {target.path} · Includes all subfolders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void refreshDocumentProblems()}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!repository || lint.starting || lint.run?.status.running}
            onClick={() => setDialog(true)}
          >
            Run lint…
          </Button>
          <Button size="sm" disabled={!repository} onClick={() => runPrompt()}>
            AI review…
          </Button>
          {lint.run?.status.running && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void lint.stop()}
            >
              Stop lint
            </Button>
          )}
        </div>
      </div>
      {([["Load repositories", catalog.error], ["Load problems", problems.error], ["Lint folder", lint.error], ["Review findings", review.error]] as const).map(([operation, error]) => error && <ActionError key={operation} error={error} title="Repository review failed" context={[["Operation", operation], ["Folder", id]]} />)}
      {(lint.starting || lint.run || review.status) && (
        <p role="status" className="text-xs text-muted-foreground">
          {review.status ??
            (lint.starting
              ? "Preparing lint…"
              : `Lint ${lint.run?.status.state}`)}
        </p>
      )}
      <LintResults
        title={null}
        className="min-h-0 flex-1 rounded border border-border"
        results={review.results}
        grouping={state.grouping}
        onGroupingChange={(grouping) => setState({ grouping })}
        filters={state.filters}
        onFiltersChange={(filters) => setState({ filters })}
        selected={state.selected}
        onSelect={(selected) => setState({ selected })}
        expandAll={state.expandAll}
        onExpandAllChange={(expandAll) => setState({ expandAll })}
        view={state.view}
        onViewChange={(view) => setState({ view })}
        onIgnore={review.ignore}
        ignoreBusy={review.busy}
        onOpenFile={({ file }) =>
          onNavigate(`document:${target.repositoryId}/${file}`)
        }
        loadSource={loadSource}
      />
      {dialog && repository && (
        <LintDialog
          root={repository.root}
          path={target.path}
          page={id}
          selected={linters}
          onPrompt={runPrompt}
          onRun={async (next, scope) => {
            await lint.relint(next, scope);
            setLinters(next);
          }}
          onClose={() => setDialog(false)}
        />
      )}
    </div>
  );
}
