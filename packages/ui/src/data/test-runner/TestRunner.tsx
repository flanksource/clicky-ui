import { useMemo, type ReactNode } from "react";
import { Icon } from "../Icon";
import { SplitPane } from "../../layout/SplitPane";
import { cn } from "../../lib/utils";
import { UiArrowLeft, UiBeaker } from "../../icons";
import { useContainerWiderThan } from "../../hooks/use-container-width";
import type { RunMeta, SnapshotStatus, Test } from "./types";
import { aggregateStatusCounts, collectFrameworks } from "./status";
import { type TestFilters } from "./filterState";
import {
  createTestRunnerRegistry,
  type TestNodeAdapter,
  TestNodeAdapterRegistry,
} from "./adapter";
import { TestRunnerProvider, type TestRunnerContext } from "./context";
import { TestTree } from "./TestTree";
import { TestDetailPanel } from "./TestDetailPanel";
import { TestRunSummary } from "./TestRunSummary";
import { TestFilterBar } from "./TestFilterBar";

export type TestRunnerProps = {
  tests: Test[];
  /**
   * The full, unfiltered forest driving the filter bar's pills/counts and the
   * header summary — falls back to `tests` when omitted (every existing
   * caller pre-filters `tests` itself). Pass this explicitly when `tests` is a
   * filtered subset of a larger report, so toggling a status filter (e.g.
   * excluding the only failed node) can't make its own pill — or the whole
   * filter bar, once every pill's count reads zero — disappear.
   */
  allTests?: Test[];
  selected: Test | null;
  filters: TestFilters;
  expandAll: boolean | null;
  done: boolean;
  runMeta?: RunMeta;
  status?: SnapshotStatus;
  /** Free-form status line shown next to the title (e.g. "Running tests..."). */
  statusText?: string;
  now?: number;
  busy?: { rerun?: boolean; stop?: boolean };

  /** Controlled active detail-tab id; omit to let the detail pane own tab state. */
  activeTab?: string;
  /** Called with the picked tab id when `activeTab` is controlled. */
  onTabChange?: (tabId: string) => void;

  onSelect: (node: Test | null) => void;
  onFiltersChange: (next: TestFilters) => void;
  onExpandAllChange: (next: boolean | null) => void;
  onRerun?: (node: Test) => void;
  onStop?: (node: Test) => void;

  /** Domain node adapters, or a pre-built registry. Defaults to default-only. */
  adapters?: TestNodeAdapter[] | TestNodeAdapterRegistry;
  /**
   * Header title. Defaults (when omitted) to the "Test Results" beaker heading.
   * Pass `null` to render no title — e.g. a host that owns the title in its own
   * dialog/page header and embeds the runner below it.
   */
  title?: ReactNode;
  /**
   * Render the built-in run summary (counts + progress) in the header. Defaults
   * to true; pass false when the host shows the summary itself (e.g. in a dialog
   * header) to avoid duplicating it.
   */
  showSummary?: boolean;
  /** Run actions at the right end of the one-line header (e.g. re-run, export, copy). */
  headerSlot?: ReactNode;
  /**
   * Suppresses the built-in header bar (title, summary) and the status/tool
   * facets in the tree toolbar.
   * Defaults to false; pass true when a host renders its own combined header
   * (e.g. a dialog header that already embeds `TestRunSummary` and filters) so
   * the runner doesn't render a second bordered bar underneath it.
   */
  hideHeader?: boolean;
  /** Initial left-pane width percentage. */
  defaultSplit?: number;
  startTime?: number | null;
  endTime?: number | null;
  className?: string;
};

function toRegistry(
  adapters: TestNodeAdapter[] | TestNodeAdapterRegistry | undefined,
): TestNodeAdapterRegistry {
  if (adapters instanceof TestNodeAdapterRegistry) return adapters;
  return createTestRunnerRegistry(adapters ?? []);
}

const SPLIT_MIN_WIDTH = 640;

/**
 * Top-level, pure-presentational test runner: a summary/filter header over a
 * resizable tree + detail split. All data and handlers flow in via props and
 * are exposed to sub-components through a single `TestRunnerContext`. Domain
 * rendering is pluggable via node adapters; no fetch/SSE/routing lives here.
 */
export function TestRunner({
  tests,
  allTests,
  selected,
  filters,
  expandAll,
  done,
  runMeta,
  status,
  statusText,
  now,
  busy,
  activeTab,
  onTabChange,
  onSelect,
  onFiltersChange,
  onExpandAllChange,
  onRerun,
  onStop,
  adapters,
  title,
  showSummary = true,
  headerSlot,
  hideHeader = false,
  defaultSplit = 45,
  startTime,
  endTime,
  className,
}: TestRunnerProps) {
  const registry = useMemo(() => toRegistry(adapters), [adapters]);

  const ctx: TestRunnerContext = useMemo(
    () => ({
      tests,
      selected,
      runMeta,
      status,
      done,
      now,
      filters,
      expandAll,
      busy: busy ?? {},
      activeTab,
      onTabChange,
      onSelect,
      onFiltersChange,
      onExpandAllChange,
      onRerun,
      onStop,
      adapters: registry,
    }),
    [
      tests,
      selected,
      runMeta,
      status,
      done,
      now,
      filters,
      expandAll,
      busy,
      activeTab,
      onTabChange,
      onSelect,
      onFiltersChange,
      onExpandAllChange,
      onRerun,
      onStop,
      registry,
    ],
  );

  const summaryTests = allTests ?? tests;
  const frameworks = useMemo(() => collectFrameworks(summaryTests), [summaryTests]);
  const filterCounts = useMemo(() => aggregateStatusCounts(summaryTests), [summaryTests]);
  // A host that hides the header renders its own filters (see hideHeader).
  const filterBar =
    !hideHeader && summaryTests.length > 0 ? (
      <TestFilterBar
        filters={filters}
        onChange={onFiltersChange}
        counts={filterCounts}
        frameworks={frameworks}
      />
    ) : null;
  // Below this the split leaves both panes too narrow to read, so the runner
  // goes master/detail: the tree, then the selected test with a way back.
  const { ref, wider: roomy } = useContainerWiderThan(SPLIT_MIN_WIDTH);

  return (
    <TestRunnerProvider value={ctx}>
      <div ref={ref} className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
        {!hideHeader && (
          <div
            className="flex min-w-0 items-center gap-3 border-b border-border bg-card px-density-4 py-density-2"
            data-runner-header=""
          >
            <div className="flex min-w-0 items-center gap-3">
              {title === undefined ? (
                <h1 className="inline-flex shrink-0 items-center gap-1.5 text-base font-bold">
                  <Icon icon={UiBeaker} className="text-primary" />
                  Test Results
                </h1>
              ) : (
                title
              )}
              {statusText && (
                <span className="truncate text-sm text-muted-foreground">{statusText}</span>
              )}
            </div>
            {showSummary && (
              <TestRunSummary
                tests={summaryTests}
                startTime={startTime}
                endTime={endTime}
                done={done}
                now={now}
                runMeta={runMeta}
                compact
                className="ml-auto flex-nowrap"
              />
            )}
            {headerSlot && (
              <div className={cn("flex shrink-0 items-center gap-1", !showSummary && "ml-auto")}>
                {headerSlot}
              </div>
            )}
          </div>
        )}

        {roomy ? (
          <SplitPane
            className="min-h-0 flex-1"
            defaultSplit={defaultSplit}
            minLeft={25}
            minRight={30}
            leftClass="border-r-2 border-border bg-muted/30"
            left={<TestTree actions={filterBar} />}
            right={<TestDetailPanel />}
          />
        ) : selected ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="inline-flex items-center gap-1.5 border-b border-border px-density-3 py-density-2 text-left text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon icon={UiArrowLeft} />
              Back to results
            </button>
            <div className="min-h-0 flex-1 overflow-hidden">
              <TestDetailPanel />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TestTree actions={filterBar} />
          </div>
        )}
      </div>
    </TestRunnerProvider>
  );
}
