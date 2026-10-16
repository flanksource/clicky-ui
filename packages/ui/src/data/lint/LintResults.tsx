import { useMemo, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Tree } from "../Tree";
import { SplitPane } from "../../layout/SplitPane";
import { useContainerWiderThan } from "../../hooks/use-container-width";
import { cn } from "../../lib/utils";
import { UiArrowLeft, UiListChecks } from "../../icons";
import { LintSeverityIcon } from "../test-runner/MarkIcons";
import { LintDetailPanel } from "./LintDetail";
import { LintFilterBar } from "./LintFilterBar";
import { LintTreeNode } from "./LintTreeNode";
import { buildLintTree, findLintNode } from "./grouping";
import { countLintBySeverity, isLinterErrored } from "./stats";
import type { LintAction, LintFilters, LintGrouping, LintNode, LinterResult, LintSeverity } from "./types";

export type LintResultsProps = {
  results: readonly LinterResult[];
  grouping: LintGrouping;
  onGroupingChange: (next: LintGrouping) => void;
  /** Tri-state severity and linter filters; the host owns them (typically in the URL). */
  filters: LintFilters;
  onFiltersChange: (next: LintFilters) => void;
  /** The selected node's `route_path`, or null. Paths are stable across rebuilds, so they can live in a URL. */
  selected: string | null;
  onSelect: (routePath: string | null) => void;
  /** Tri-state expand-all: true (all open), false (all closed), null (default). */
  expandAll: boolean | null;
  onExpandAllChange: (next: boolean | null) => void;
  /**
   * Called with the chosen ignore action; `action.req` is the entry to add to
   * `.gavel.yaml`. Omit to hide every ignore button.
   */
  onIgnore?: (action: LintAction) => void | Promise<void>;
  /** Disables the ignore buttons while the host applies an action. */
  ignoreBusy?: boolean;
  /** Actions at the right end of the header bar (e.g. re-run, export). */
  headerSlot?: ReactNode;
  /** Header title. Defaults to a "Lint Results" heading; pass `null` for none. */
  title?: ReactNode;
  /** Initial left-pane width percentage. */
  defaultSplit?: number;
  className?: string;
};

const SPLIT_MIN_WIDTH = 640;
const SEVERITIES: readonly LintSeverity[] = ["error", "warning", "info"];

function Summary({ results }: { results: readonly LinterResult[] }) {
  const counts = countLintBySeverity(results, new Map());
  const failedToRun = results.filter(isLinterErrored).length;
  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 text-xs text-muted-foreground" data-lint-summary="">
      {SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
        <span key={s} className="inline-flex items-center gap-1">
          <LintSeverityIcon severity={s} />
          <span className="tabular-nums">{counts[s]}</span>
        </span>
      ))}
      {failedToRun > 0 && (
        <span className="text-red-600 dark:text-red-400">
          {failedToRun} linter{failedToRun === 1 ? "" : "s"} failed to run
        </span>
      )}
    </div>
  );
}

function emptyMessage(results: readonly LinterResult[], filters: LintFilters): string {
  if (results.length === 0) return "No lint results";
  if (filters.severity.size > 0 || filters.linter.size > 0) return "No violations match the current filters";
  return "No lint violations";
}

/**
 * Lint results as a filterable, groupable tree beside a detail pane, with
 * optional ignore actions. Pure presentation: results, grouping, filters,
 * selection and expand state all flow in through props, so the host can keep
 * them in its URL. A linter that failed to run is shown under its name rather
 * than dropped.
 */
export function LintResults({
  results,
  grouping,
  onGroupingChange,
  filters,
  onFiltersChange,
  selected,
  onSelect,
  expandAll,
  onExpandAllChange,
  onIgnore,
  ignoreBusy,
  headerSlot,
  title,
  defaultSplit = 45,
  className,
}: LintResultsProps) {
  const tree = useMemo(() => buildLintTree({ results, grouping, filters }), [results, grouping, filters]);
  const selectedNode = useMemo(() => (selected ? findLintNode(tree, selected) : null), [tree, selected]);
  const { ref, wider: roomy } = useContainerWiderThan(SPLIT_MIN_WIDTH);

  const filterBar =
    results.length > 0 ? (
      <LintFilterBar
        results={results}
        grouping={grouping}
        onGroupingChange={onGroupingChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        className="border-b border-border bg-card px-density-4 py-density-2"
      />
    ) : null;

  const treePane = (
    <Tree<LintNode>
      className="min-h-0"
      roots={tree}
      getKey={(node) => node.route_path}
      getChildren={(node) => node.children}
      selected={selectedNode}
      onSelect={(node) => onSelect(node.route_path === selected ? null : node.route_path)}
      expandAll={expandAll}
      onExpandAllChange={onExpandAllChange}
      defaultOpen={(node, depth) => depth < 1 || node.failed}
      showSearch
      searchLabel="Filter findings"
      getSearchText={(node) => `${node.name} ${node.linterName ?? ""} ${node.ruleName ?? ""}`}
      empty={<div className="p-8 text-center text-sm text-muted-foreground">{emptyMessage(results, filters)}</div>}
      renderRow={({ node, selected: isSelected }) => <LintTreeNode node={node} selected={isSelected} />}
    />
  );
  const detailPane = (
    <LintDetailPanel node={selectedNode} results={results} onIgnore={onIgnore} ignoreBusy={ignoreBusy} />
  );
  const showHeader = title !== null || results.length > 0 || headerSlot != null;

  return (
    <div ref={ref} className={cn("flex h-full min-h-0 flex-col bg-background", className)} data-lint-results="">
      {showHeader && (
        <div
          className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-card px-density-4 py-density-2"
          data-lint-header=""
        >
          {title === undefined ? (
            <h1 className="inline-flex shrink-0 items-center gap-1.5 text-base font-bold">
              <Icon icon={UiListChecks} className="text-primary" />
              Lint Results
            </h1>
          ) : (
            title
          )}
          <Summary results={results} />
          {headerSlot && <div className="flex shrink-0 items-center gap-1">{headerSlot}</div>}
        </div>
      )}

      {roomy ? (
        <>
          {filterBar}
          <SplitPane
            className="min-h-0 flex-1"
            defaultSplit={defaultSplit}
            minLeft={25}
            minRight={30}
            leftClass="border-r-2 border-border bg-muted/30"
            left={treePane}
            right={detailPane}
          />
        </>
      ) : selectedNode ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex items-center gap-1.5 border-b border-border px-density-3 py-density-2 text-left text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={UiArrowLeft} />
            Back to results
          </button>
          <div className="min-h-0 flex-1 overflow-hidden">{detailPane}</div>
        </div>
      ) : (
        <>
          {filterBar}
          <div className="min-h-0 flex-1 overflow-y-auto">{treePane}</div>
        </>
      )}
    </div>
  );
}
