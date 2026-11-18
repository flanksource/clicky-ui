import { useMemo, type ReactNode } from "react";
import { InputField } from "../../components/InputField";
import { Loading } from "../../components/loading";
import { Tree } from "../../data/Tree";
import { buildMBeanBrowserTree } from "../model/mbean-tree";
import { findMBeanNode, mbeanBrowserNodes, type MBeanBrowserNode } from "./mbean-browser-nodes";

export type MBeanBrowserProps = {
  /** Canonical ObjectNames to browse. */
  names: string[];
  /** Substring filter on the full ObjectName (case-insensitive). */
  filter: string;
  onFilterChange: (filter: string) => void;
  /** Selected ObjectName, or "" for none. */
  selected: string;
  onSelect: (objectName: string) => void;
  loading?: boolean;
  /** Rendered in place of the tree, e.g. an `InlineError` for a failed search. */
  error?: ReactNode;
};

function BrowserRow({ node }: { node: MBeanBrowserNode }) {
  if (node.kind !== "mbean") {
    return (
      <span className={node.kind === "domain" ? "truncate text-xs font-semibold" : "truncate text-xs font-medium"}>
        {node.label} <span className="font-normal text-muted-foreground">({node.count})</span>
      </span>
    );
  }
  return (
    <span className="min-w-0" title={node.key}>
      <span className="block truncate font-mono text-xs font-medium">{node.label}</span>
      {node.metadata ? <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{node.metadata}</span> : null}
    </span>
  );
}

/**
 * Filterable domain → type → MBean tree. Domains start open; type groups open
 * while a filter is active. The selection is revealed when set from outside.
 */
export function MBeanBrowser({ names, filter, onFilterChange, selected, onSelect, loading = false, error }: MBeanBrowserProps) {
  const query = filter.trim().toLowerCase();
  const roots = useMemo(
    () => mbeanBrowserNodes(buildMBeanBrowserTree(query ? names.filter((name) => name.toLowerCase().includes(query)) : names)),
    [names, query],
  );
  const visible = roots.reduce((total, node) => total + (node.kind === "mbean" ? 1 : node.count), 0);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <InputField aria-label="Filter MBeans" placeholder="Filter MBeans" value={filter} onChange={(value) => onFilterChange(value)} clearable onClear={() => onFilterChange("")} />
      <p className="text-xs text-muted-foreground">
        {visible} of {names.length} MBeans
      </p>
      <div className="min-h-0 flex-1 overflow-auto">
        {error ??
          (loading ? (
            <Loading />
          ) : (
            <Tree<MBeanBrowserNode>
              key={query ? "filtered" : "all"}
              ariaLabel="MBeans"
              roots={roots}
              getKey={(node) => node.key}
              getChildren={(node) => (node.kind === "mbean" ? undefined : node.children)}
              getAriaLabel={(node) => (node.kind === "mbean" ? node.key : node.label)}
              getSearchText={(node) => node.key}
              defaultOpen={(_node, depth) => depth === 0 || query !== ""}
              selected={selected ? findMBeanNode(roots, selected) : null}
              revealSelected
              onSelect={(node) => {
                if (node.kind === "mbean") onSelect(node.key);
              }}
              renderRow={({ node }) => <BrowserRow node={node} />}
              showControls={false}
              showSearch={false}
              empty={<p className="p-2 text-xs text-muted-foreground">No matches.</p>}
            />
          ))}
      </div>
    </div>
  );
}
