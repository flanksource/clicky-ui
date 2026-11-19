import { useMemo } from "react";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiChevronDown, UiChevronRight } from "../../icons";
import type { Test } from "./types";
import { useTestRunner } from "./context";
import { outcomeFor, testLeaves } from "./status";
import { OutcomeIcon } from "./MarkIcons";
import { TestDetailPanel } from "./TestDetailPanel";

function sameTest(a: Test, b: Test | null): boolean {
  if (!b) return false;
  if (a.route_path && b.route_path) return a.route_path === b.route_path;
  return a === b;
}

function TestListRow({ test }: { test: Test }) {
  const runner = useTestRunner();
  const open = sameTest(test, runner.selected);
  const outcome = outcomeFor(test);
  const where = [test.package, ...(test.suite ?? [])].filter(Boolean).join(" › ");
  const firstLine = test.message?.split("\n").find((line) => line.trim()) ?? "";
  return (
    <li className="border-b border-border last:border-b-0" data-test-list-row="">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => runner.onSelect(open ? null : test)}
        className={cn(
          "flex w-full min-w-0 items-start gap-2 px-density-3 py-density-2 text-left hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-accent/40",
        )}
      >
        <Icon icon={open ? UiChevronDown : UiChevronRight} className="mt-1 shrink-0 text-xs text-muted-foreground" />
        {outcome && <OutcomeIcon outcome={outcome} className="mt-0.5 shrink-0" />}
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 truncate text-sm font-medium" title={test.name}>{test.name}</span>
            {where && <span className="min-w-0 shrink-[100] truncate text-xs text-muted-foreground" title={where}>{where}</span>}
          </span>
          {firstLine && (
            <span className="block truncate font-mono text-xs text-muted-foreground" title={firstLine}>{firstLine}</span>
          )}
        </span>
      </button>
      {open && (
        <div className="h-96 border-t border-border" data-test-list-detail="">
          <TestDetailPanel header="actions" />
        </div>
      )}
    </li>
  );
}

/**
 * Every test in the (host-filtered) forest as one row: outcome, name, where it
 * lives and the first line of its message. Opening a row selects the test and
 * shows the same detail the tree's pane does, beneath the row.
 */
export function TestList({ className }: { className?: string }) {
  const runner = useTestRunner();
  const leaves = useMemo(() => testLeaves(runner.tests), [runner.tests]);
  if (leaves.length === 0) {
    return <div className="p-8 text-center text-sm text-muted-foreground">No tests match the current filters</div>;
  }
  return (
    <ul className={cn("m-0 list-none p-0", className)} data-test-list="">
      {leaves.map((test, index) => <TestListRow key={test.route_path ?? `${index}:${test.name}`} test={test} />)}
    </ul>
  );
}
