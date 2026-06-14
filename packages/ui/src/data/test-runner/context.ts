// A single context object carries all runner state + handlers, provided once
// and read by every sub-component via useTestRunner() — instead of threading
// onRerun/onStop/selected/runMeta/... through each component's props. Matches
// clicky's existing Provider idiom (ClickyRuntimeProvider / TagActionsProvider).

import { createContext, useContext } from "react";
import type { RunMeta, SnapshotStatus, Test } from "./types";
import type { TestFilters } from "./filterState";
import type { TestNodeAdapterRegistry } from "./adapter";

export type TestRunnerContext = {
  /** The (already filtered, host-owned) test forest to render. */
  tests: Test[];
  /** Currently selected node, or null. */
  selected: Test | null;
  runMeta?: RunMeta | undefined;
  /** Run status flags (data only — no transport lives here). */
  status?: SnapshotStatus | undefined;
  /** Whether the run has finished. */
  done: boolean;
  /**
   * Injected wall-clock epoch ms for elapsed-time display. Kept as data so the
   * summary stays pure and testable; hosts pass `Date.now()`.
   */
  now?: number | undefined;
  /** Active status/framework filters. */
  filters: TestFilters;
  /** Tri-state expand-all: true (all open), false (all closed), null (default). */
  expandAll: boolean | null;
  /** In-flight action flags driving button disabled/spinner states. */
  busy: { rerun?: boolean; stop?: boolean };

  /**
   * Active detail-tab id. When provided, TestDetailPanel renders this tab
   * (controlled); when omitted it keeps its own internal tab state.
   */
  activeTab?: string | undefined;
  /** Called with the picked tab id when the detail tab is controlled. */
  onTabChange?: ((tabId: string) => void) | undefined;

  onSelect: (node: Test | null) => void;
  onFiltersChange: (next: TestFilters) => void;
  onExpandAllChange: (next: boolean | null) => void;
  /** Optional — when absent, the rerun affordance is hidden. */
  onRerun?: ((node: Test) => void) | undefined;
  /** Optional — when absent, the stop affordance is hidden. */
  onStop?: ((node: Test) => void) | undefined;

  /** Node adapters driving domain-specific rendering. */
  adapters: TestNodeAdapterRegistry;
};

const Context = createContext<TestRunnerContext | null>(null);

export const TestRunnerProvider = Context.Provider;

export function useTestRunner(): TestRunnerContext {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useTestRunner must be used within a <TestRunner> / TestRunnerProvider");
  }
  return ctx;
}
