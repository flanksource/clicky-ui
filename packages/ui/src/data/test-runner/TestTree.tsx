import type { ReactNode } from "react";
import { Tree } from "../Tree";
import { cn } from "../../lib/utils";
import type { Test } from "./types";
import { useTestRunner } from "./context";
import { hasFailed, testStatus } from "./status";
import { TestTreeNode } from "./TestTreeNode";

const nodeKey = (() => {
  // Tests carry no guaranteed id; derive a stable per-render key from route_path
  // when present, else the node's name path. A WeakMap keeps keys stable across
  // re-renders for the same object identity.
  const cache = new WeakMap<Test, string>();
  let counter = 0;
  return (node: Test): string => {
    if (node.route_path) return node.route_path;
    let key = cache.get(node);
    if (!key) {
      key = `tn-${counter++}-${node.name}`;
      cache.set(node, key);
    }
    return key;
  };
})();

/**
 * The left pane: the test forest rendered through the clicky `Tree`. Selection,
 * handlers and adapters all come from the runner context; failing branches and
 * the top level open by default. A name filter is always shown, and `actions`
 * sit in the tree toolbar beside it and Expand all / Collapse all.
 */
export function TestTree({ className, actions }: { className?: string; actions?: ReactNode }) {
  const runner = useTestRunner();
  return (
    <Tree<Test>
      className={cn("min-h-0", className)}
      roots={runner.tests}
      getKey={nodeKey}
      getChildren={(node) => node.children}
      selected={runner.selected}
      onSelect={(node) => runner.onSelect(node === runner.selected ? null : node)}
      expandAll={runner.expandAll}
      onExpandAllChange={runner.onExpandAllChange}
      defaultOpen={(node, depth) => depth < 1 || hasFailed(node)}
      showSearch
      searchLabel="Filter tests"
      getSearchText={(node) => `${node.name} ${node.framework ?? ""}`}
      renderRow={({ node, selected }) => <TestTreeNode node={node} selected={selected} />}
      rowClass={(node, selected) => cn(
        "hover:bg-accent",
        testStatus(node) === "running" && "border-l-2 border-primary bg-primary/10 font-semibold hover:bg-primary/15",
        selected && "border-l-2 border-primary bg-primary/20",
      )}
      actions={actions}
    />
  );
}
