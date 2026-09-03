// Props-only VerificationResults: renders a captain VerifyReport through the
// shared TestRunner, so both the captain webapp and gavel pr/ui can drop it in
// without forking a data-fetching or routing dependency. Ported from gavel's
// VerificationFixtureResults.tsx.

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  emptyTestFilters,
  filterTests,
  TestRunner,
  type Test,
  type TestFilters,
  type TestNodeAdapterRegistry,
} from "../test-runner";
import { verificationAdapters } from "./adapters";
import { verifyReportTests } from "./verifyReportTests";
import type { VerifyReport } from "./verify-report";

export type VerificationResultsProps = {
  report: VerifyReport | null;
  /** Overrides the run-complete state. Defaults to `report.state !== "running"`. */
  done?: boolean;
  /** Header title, passed through to TestRunner. Defaults to no title. */
  title?: ReactNode | null;
  className?: string;
  adapters?: TestNodeAdapterRegistry;
  emptyText?: string;
  /**
   * Controlled selection — omit to let the component own selection state
   * (keyed by a stable task_id/name so the same row stays selected across a
   * re-created report of the same shape, e.g. after a live-update refresh).
   * Pass both this and `onSelect` for a host that persists selection at the
   * route level.
   */
  selected?: Test | null;
  onSelect?: (node: Test | null) => void;
  /** Controlled status/framework filters — omit to let the component own filter state. */
  filters?: TestFilters;
  onFiltersChange?: (next: TestFilters) => void;
};

const DEFAULT_ADAPTERS = verificationAdapters();

/**
 * A node's identity across a re-created forest: its own `task_id` when
 * present, else its name. Object identity can't be used — `verifyReportTests`
 * builds a brand-new `Test[]` from every report, so the previously-selected
 * object never appears in a fresh forest even when the underlying node is
 * unchanged.
 */
function selectionKey(node: Test): string {
  return node.task_id ?? node.name;
}

function findBySelectionKey(nodes: Test[], key: string): Test | null {
  for (const node of nodes) {
    if (selectionKey(node) === key) return node;
    if (node.children) {
      const found = findBySelectionKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

export function VerificationResults({
  report,
  done,
  title = null,
  className,
  adapters = DEFAULT_ADAPTERS,
  emptyText = "No verification has run yet",
  selected: controlledSelected,
  onSelect: controlledOnSelect,
  filters: controlledFilters,
  onFiltersChange: controlledOnFiltersChange,
}: VerificationResultsProps) {
  const tests = useMemo(() => (report ? verifyReportTests(report) : []), [report]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [internalFilters, setInternalFilters] = useState<TestFilters>(() => emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  const filtersControlled = controlledFilters !== undefined;
  const filters = filtersControlled ? controlledFilters : internalFilters;
  const setFilters = (next: TestFilters) => {
    if (filtersControlled) controlledOnFiltersChange?.(next);
    else setInternalFilters(next);
  };

  const selectionControlled = controlledSelected !== undefined;
  const uncontrolledSelected = useMemo(
    () => (selectedKey ? findBySelectionKey(tests, selectedKey) : null),
    [tests, selectedKey],
  );
  const selected = selectionControlled ? controlledSelected : uncontrolledSelected;
  const setSelected = (node: Test | null) => {
    if (selectionControlled) controlledOnSelect?.(node);
    else setSelectedKey(node ? selectionKey(node) : null);
  };

  const visible = useMemo(
    () => filterTests(tests, filters.status, filters.framework),
    [tests, filters],
  );

  const startTime = report?.started_at ? Date.parse(report.started_at) : undefined;
  const endTime = report?.finished_at ? Date.parse(report.finished_at) : undefined;

  // A cmd/AI verifier's reason and feedback are the only place its verdict
  // survives once its nodes are empty (e.g. an error before any check ran), so
  // they're shown above the runner whenever present — not only in that empty
  // case — since a partial pass can carry a reason alongside real test nodes.
  const verdict =
    report && (report.reason || report.feedback) ? (
      <div className="shrink-0 space-y-2 border-b border-border px-3 py-2">
        {report.reason && <p className="text-xs text-foreground">{report.reason}</p>}
        {report.feedback && (
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[11px]">
            {report.feedback}
          </pre>
        )}
      </div>
    ) : null;

  if (!report || tests.length === 0) {
    return (
      <div className={cn("flex flex-col", className)}>
        {verdict}
        {!verdict && <p className="px-3 py-4 text-xs text-muted-foreground">{emptyText}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex h-[30rem] min-h-80 flex-col", className)}>
      {verdict}
      <TestRunner
        className="min-h-0 flex-1"
        tests={visible}
        allTests={tests}
        selected={selected}
        filters={filters}
        expandAll={expandAll}
        done={done ?? report.state !== "running"}
        status={{ running: report.state === "running" }}
        {...(report.state === "running" ? { statusText: "Running verification…" } : {})}
        {...(startTime !== undefined ? { startTime } : {})}
        {...(endTime !== undefined ? { endTime } : {})}
        title={title}
        adapters={adapters}
        onSelect={setSelected}
        onFiltersChange={setFilters}
        onExpandAllChange={setExpandAll}
      />
    </div>
  );
}
