// Node adapters let a host plug domain-specific rendering into the test runner
// without forking it. An adapter claims nodes via `match` and contributes how
// they render in each surface (tree row, detail body, detail tabs, header
// actions). The registry resolves the first matching adapter per surface;
// surfaces with no match fall back to the runner's built-in default rendering.
//
// This formalizes the wrapper-with-an-if-chain pattern hosts use today (e.g.
// a ResultDetailPane fall-through over domain panels + tab providers + per-step
// actions) into a registered, composable contract.

import type { ReactNode } from "react";
import type { Test } from "./types";
import type { TestRunnerContext } from "./context";

export type AdapterContext = {
  node: Test;
  runner: TestRunnerContext;
};

export type DetailTab = {
  id: string;
  label: string;
  render: () => ReactNode;
};

export type TestNodeAdapter = {
  /** Stable identifier, used as a React key and for debugging. */
  id: string;
  /** Claim the node. The first registered adapter to return true wins per surface. */
  match: (node: Test, runner: TestRunnerContext) => boolean;
  /**
   * Replace the framework icon for the node — return any node (e.g. a brand
   * logo via the host's own icon provider) or null to fall back to the built-in
   * `frameworkIcon`. Lets hosts restore devicon/logos glyphs without clicky
   * depending on a runtime icon provider.
   */
  renderFrameworkIcon?: (c: AdapterContext) => ReactNode;
  /** Extra decoration rendered between the framework icon and the node name. */
  renderRowLeading?: (c: AdapterContext) => ReactNode;
  /** Primary detail body for the node, replacing the default panel body. */
  renderDetail?: (c: AdapterContext) => ReactNode;
  /** Extra detail tabs, merged (in registration order) across all matching adapters. */
  detailTabs?: (c: AdapterContext) => DetailTab[];
  /** Node-scoped action buttons rendered in the detail header. */
  nodeActions?: (c: AdapterContext) => ReactNode;
  /**
   * Whether `renderDetail` owns its own full-height scroll container. When
   * false (the default for custom bodies), the panel wraps it in a scroll
   * region. The built-in default body owns its scroll.
   */
  ownsScroll?: (c: AdapterContext) => boolean;
};

/**
 * Ordered set of node adapters. First match wins per surface; `detailTabs` are
 * the exception — they merge across every matching adapter so independent
 * adapters can each contribute a tab.
 */
export class TestNodeAdapterRegistry {
  readonly adapters: TestNodeAdapter[];

  constructor(adapters: TestNodeAdapter[] = []) {
    this.adapters = adapters;
  }

  private firstWith(
    node: Test,
    runner: TestRunnerContext,
    has: (a: TestNodeAdapter) => boolean,
  ): TestNodeAdapter | null {
    for (const a of this.adapters) {
      if (has(a) && a.match(node, runner)) return a;
    }
    return null;
  }

  /** Adapter whose `renderDetail` should drive the body, or null for the default. */
  resolveDetail(node: Test, runner: TestRunnerContext): TestNodeAdapter | null {
    return this.firstWith(node, runner, (a) => !!a.renderDetail);
  }

  resolveRowLeading(node: Test, runner: TestRunnerContext): TestNodeAdapter | null {
    return this.firstWith(node, runner, (a) => !!a.renderRowLeading);
  }

  resolveFrameworkIcon(node: Test, runner: TestRunnerContext): TestNodeAdapter | null {
    return this.firstWith(node, runner, (a) => !!a.renderFrameworkIcon);
  }

  resolveActions(node: Test, runner: TestRunnerContext): TestNodeAdapter | null {
    return this.firstWith(node, runner, (a) => !!a.nodeActions);
  }

  /** Merge `detailTabs` from every matching adapter, de-duplicated by tab id. */
  resolveTabs(node: Test, runner: TestRunnerContext): DetailTab[] {
    const ctx: AdapterContext = { node, runner };
    const seen = new Set<string>();
    const tabs: DetailTab[] = [];
    for (const a of this.adapters) {
      if (!a.detailTabs || !a.match(node, runner)) continue;
      for (const tab of a.detailTabs(ctx)) {
        if (seen.has(tab.id)) continue;
        seen.add(tab.id);
        tabs.push(tab);
      }
    }
    return tabs;
  }

  /** True when the resolved detail adapter owns its own scroll region. */
  ownsScroll(node: Test, runner: TestRunnerContext): boolean {
    const a = this.resolveDetail(node, runner);
    if (!a?.ownsScroll) return false;
    return a.ownsScroll({ node, runner });
  }
}

export function createTestRunnerRegistry(
  adapters: TestNodeAdapter[] = [],
): TestNodeAdapterRegistry {
  return new TestNodeAdapterRegistry(adapters);
}
