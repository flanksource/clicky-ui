import { useMemo, type ReactNode } from "react";
import { ProblemRow } from "../data/diagnostics/ProblemRow";
import { Icon } from "../data/Icon";
import { UiFileCode, UiListChecks } from "../icons";
import { Tabs, type TabItem } from "../layout/Tabs";
import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { bySeverityThenLine } from "./file-review/marks";
import { matchesProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import { ProblemFilterBar } from "./file-review/ProblemsList";
import { FOLDER_PROBLEMS_VIEW } from "./file-review/views";
import { NodeActions } from "./NodeActions";
import { SeverityCounts } from "./SeverityCounts";
import { fileRefKey, type FileFinding, type FileRef } from "./types";

export type FolderTabContext = {
  folder: FileRef;
  /** Every finding in the files beneath the folder. */
  findings: readonly FileFinding[];
};

/** A host-defined tab after the folder's Problems; its body fills the pane. */
export type FolderTab = Omit<TabItem, "disabled" | "countColor"> & {
  render: (ctx: FolderTabContext) => ReactNode;
};

export type FolderFindingsProps = {
  folder: FileRef;
  /** The folder's row label in the tree. */
  name: string;
  /** Shows `name` in the header; off when the host shows the path elsewhere. Default true. */
  showPath?: boolean | undefined;
  findings: readonly FileFinding[];
  /** `FOLDER_PROBLEMS_VIEW` or the id of one of `tabs`. */
  view: string;
  onViewChange: (view: string) => void;
  problemFilters: ProblemFilters;
  onProblemFiltersChange: (filters: ProblemFilters) => void;
  /** Opens a file, at a finding's line when one is given. */
  onOpenFile: (file: FileRef, line?: number) => void;
  getFindingActions?: ((finding: FileFinding) => DropdownMenuItem[]) | undefined;
  actions?: DropdownMenuItem[] | undefined;
  tabs?: readonly FolderTab[] | undefined;
};

type FileGroup = { ref: FileRef; findings: FileFinding[] };

/** Findings grouped by file in the order they arrive (the tree's order), each group worst first. */
function groupByFile(findings: readonly FileFinding[]): FileGroup[] {
  const groups = new Map<string, FileGroup>();
  for (const finding of findings) {
    const ref = { workDir: finding.workDir, file: finding.file };
    const key = fileRefKey(ref);
    const group = groups.get(key) ?? { ref, findings: [] };
    group.findings.push(finding);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({ ...group, findings: group.findings.sort(bySeverityThenLine) }));
}

function FolderProblems({
  findings,
  problemFilters,
  onProblemFiltersChange,
  onOpenFile,
  getFindingActions,
}: Pick<FolderFindingsProps, "findings" | "problemFilters" | "onProblemFiltersChange" | "onOpenFile" | "getFindingActions">) {
  const shown = useMemo(() => findings.filter((f) => matchesProblemFilters(f, problemFilters)), [findings, problemFilters]);
  const groups = useMemo(() => groupByFile(shown), [shown]);
  return (
    <>
      <ProblemFilterBar findings={findings} shown={shown.length} filters={problemFilters} onFiltersChange={onProblemFiltersChange} />
      {groups.length === 0 ? (
        <p className="p-6 text-center text-xs text-muted-foreground">No problems match the current filters.</p>
      ) : (
        groups.map(({ ref, findings: group }) => (
          <section key={fileRefKey(ref)} data-folder-file={ref.file}>
            <button
              type="button"
              onClick={() => onOpenFile(ref)}
              title={`Open ${ref.file}`}
              className="flex w-full min-w-0 items-center gap-2 border-b border-border bg-muted/30 px-2 py-1 text-left text-xs font-medium hover:bg-muted"
            >
              <Icon icon={UiFileCode} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-mono">{ref.file}</span>
              <SeverityCounts findings={group} />
            </button>
            <ul>
              {group.map((f, index) => (
                <li key={`${f.line}:${f.column ?? 0}:${index}`} data-problem-line={f.line}>
                  <ProblemRow
                    message={f.message}
                    severity={f.severity}
                    metadata={`${f.source} ${f.rule ?? ""}`}
                    location={`${f.line}${f.column ? `:${f.column}` : ""}`}
                    actions={[
                      { label: "Open in file", onSelect: () => onOpenFile(ref, f.line) },
                      { label: "Copy description", onSelect: () => void navigator.clipboard.writeText(f.message) },
                      ...(getFindingActions?.(f) ?? []),
                    ]}
                  >
                    {null}
                  </ProblemRow>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

/**
 * A folder in the findings tree: every finding beneath it on a Problems tab,
 * grouped by file, plus the host's folder tabs. Nothing is loaded: problems
 * are listed without source context, and picking one opens its file.
 */
export function FolderFindings({ folder, name, showPath = true, findings, view, onViewChange, actions, tabs = [], ...problems }: FolderFindingsProps) {
  const hostTab = tabs.find((tab) => tab.id === view);
  if (!hostTab && view !== FOLDER_PROBLEMS_VIEW)
    throw new Error(`FolderFindings: view ${JSON.stringify(view)} is neither "${FOLDER_PROBLEMS_VIEW}" nor one of \`tabs\` (${tabs.map((t) => t.id).join(", ") || "none"})`);
  return (
    <div className="flex h-full min-h-0 flex-col" data-folder-findings={folder.file}>
      <div className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2" data-file-header="">
        {showPath && (
          <span className="min-w-0 truncate font-mono text-sm" title={folder.workDir ? `${folder.workDir}/${folder.file}` : folder.file}>
            {name}
          </span>
        )}
        <SeverityCounts findings={findings} />
        <span className="flex-1" />
        <NodeActions items={actions ?? []} label="Folder actions" />
      </div>
      <Tabs
        className="shrink-0 px-density-2"
        value={view}
        onChange={onViewChange}
        tabs={[
          { id: FOLDER_PROBLEMS_VIEW, label: "Problems", icon: UiListChecks, count: findings.length },
          ...tabs.map(({ render: _render, ...tab }) => tab),
        ]}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {hostTab ? hostTab.render({ folder, findings }) : <FolderProblems findings={findings} {...problems} />}
      </div>
    </div>
  );
}
