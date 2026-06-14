import { useMemo, type ReactNode } from "react";
import { Icon } from "../Icon";
import { SplitPane } from "../../layout/SplitPane";
import { cn } from "../../lib/utils";
import { UiBeaker } from "../../icons";
import type { RunMeta, SnapshotStatus, Test } from "./types";
import { collectFrameworks, sumNonTaskTests, type StatusCounts } from "./status";
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
  /** Extra header content (e.g. export/download controls owned by the host). */
  headerSlot?: ReactNode;
  /** Initial left-pane width percentage. */
  defaultSplit?: number;
  startTime?: number | null;
  endTime?: number | null;
  className?: string;
};

function counts(tests: Test[]): StatusCounts {
  return tests.reduce(
    (acc, t) => {
      const s = sumNonTaskTests(t);
      (Object.keys(acc) as (keyof StatusCounts)[]).forEach((k) => (acc[k] += s[k]));
      return acc;
    },
    { total: 0, passed: 0, failed: 0, warned: 0, skipped: 0, pending: 0, running: 0, timedout: 0 },
  );
}

function toRegistry(
  adapters: TestNodeAdapter[] | TestNodeAdapterRegistry | undefined,
): TestNodeAdapterRegistry {
  if (adapters instanceof TestNodeAdapterRegistry) return adapters;
  return createTestRunnerRegistry(adapters ?? []);
}

/**
 * Top-level, pure-presentational test runner: a summary/filter header over a
 * resizable tree + detail split. All data and handlers flow in via props and
 * are exposed to sub-components through a single `TestRunnerContext`. Domain
 * rendering is pluggable via node adapters; no fetch/SSE/routing lives here.
 */
export function TestRunner({
  tests,
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
  headerSlot,
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

  const frameworks = useMemo(() => collectFrameworks(tests), [tests]);
  const filterCounts = useMemo(() => counts(tests), [tests]);
  const hasContent = tests.length > 0;

  return (
    <TestRunnerProvider value={ctx}>
      <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
        <div className="border-b border-border bg-card px-density-4 py-density-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="inline-flex items-center gap-1.5 text-lg font-bold">
                <Icon icon={UiBeaker} className="text-primary" />
                Test Results
              </h1>
              {statusText && <span className="text-sm text-muted-foreground">{statusText}</span>}
            </div>
            <div className="flex items-center gap-3">
              {headerSlot}
              <TestRunSummary
                tests={tests}
                startTime={startTime}
                endTime={endTime}
                done={done}
                now={now}
                runMeta={runMeta}
              />
            </div>
          </div>
          {hasContent && (
            <div className="mt-2">
              <TestFilterBar
                filters={filters}
                onChange={onFiltersChange}
                counts={filterCounts}
                frameworks={frameworks}
              />
            </div>
          )}
        </div>

        <SplitPane
          className="min-h-0 flex-1"
          defaultSplit={defaultSplit}
          minLeft={25}
          minRight={30}
          leftClass="border-r-2 border-border bg-muted/30"
          left={<TestTree />}
          right={<TestDetailPanel />}
        />
      </div>
    </TestRunnerProvider>
  );
}
