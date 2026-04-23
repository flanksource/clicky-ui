import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { TreeNode, type TreeNodeProps } from "./TreeNode";

export type TreeProps<T> = Omit<TreeNodeProps<T>, "node" | "depth" | "expandAll" | "forcedOpenKeys"> & {
  roots: T[];
  empty?: ReactNode;
  className?: string;
  /**
   * Render the Expand all / Collapse all toolbar above the tree. Enabled by
   * default. Set to false to suppress when the tree is tiny or the controls
   * are owned externally.
   */
  showControls?: boolean;
  /**
   * Externally controlled expand-all state. When provided together with
   * `onExpandAllChange`, the tree is controlled; otherwise it manages the
   * toolbar state internally.
   */
  expandAll?: boolean | null;
  onExpandAllChange?: (next: boolean | null) => void;
  toolbarClassName?: string;
  /**
   * Override the text the filter matches against for a given node.
   * Defaults to a recursive walk of the node's own fields (excluding
   * its `children` and any secondary children), which works for
   * plain-shape trees but leaks text from nested domain objects —
   * e.g. a SQL Table's Field rows are marked secondary, yet the
   * parent record still carries `record.fields[].field` strings that
   * the default walker would collect. Callers that need precise
   * control over search behaviour should return only the text they
   * want surfaced (the node's own display label / id / type).
   */
  getSearchText?: (node: T) => string;
};

function countTreeEdges<T>(
  roots: T[],
  getChildren: TreeProps<T>["getChildren"],
) {
  let total = 0;
  const stack = [...roots];

  while (stack.length > 0) {
    const node = stack.pop()!;
    const children = getChildren(node) ?? [];
    total += children.length;
    stack.push(...children);
  }

  return total;
}

function collectTreeSearchText(
  value: unknown,
  excluded = new Set<unknown>(),
  seen = new Set<unknown>(),
): string {
  if (value == null || excluded.has(value)) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (typeof value !== "object") return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((entry) => collectTreeSearchText(entry, excluded, seen))
      .filter(Boolean)
      .join(" ");
  }

  const preferredKeys = ["label", "name", "title", "text", "plain", "id", "content"];
  const record = value as Record<string, unknown>;
  const chunks: string[] = [];

  for (const key of preferredKeys) {
    if (!(key in record)) continue;
    const text = collectTreeSearchText(record[key], excluded, seen);
    if (text) chunks.push(text);
  }

  for (const [key, entry] of Object.entries(record)) {
    if (key === "children" || preferredKeys.includes(key)) continue;
    const text = collectTreeSearchText(entry, excluded, seen);
    if (text) chunks.push(text);
  }

  return chunks.join(" ");
}

function nodeSearchText<T>(node: T, children: ReturnType<TreeProps<T>["getChildren"]>) {
  const excluded = new Set<unknown>();
  if (children) excluded.add(children);
  return collectTreeSearchText(node, excluded).trim().toLowerCase();
}

function filterTreeRoots<T>(
  roots: T[],
  getChildren: TreeProps<T>["getChildren"],
  getKey: TreeProps<T>["getKey"],
  query: string,
  isSecondary?: (node: T) => boolean,
  getSearchText?: (node: T) => string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return {
      roots,
      filteredChildren: null as Map<string | number, T[]> | null,
      forcedOpenKeys: null as Set<string | number> | null,
    };
  }

  const filteredChildren = new Map<string | number, T[]>();
  const forcedOpenKeys = new Set<string | number>();

  function matchText(node: T, children: T[]): string {
    // Honour the caller-supplied text extractor first — it's the
    // only way to get precise control over what the filter sees when
    // the node carries domain data whose fields would otherwise leak
    // into the default walker.
    if (getSearchText) return getSearchText(node).trim().toLowerCase();
    // Match-text skips secondary children so e.g. a Table's search
    // text only draws from the Table itself, not from its Field
    // rows. The Table is primary, so its own text still counts.
    const searchChildren = children.filter((c) => !isSecondary?.(c));
    return nodeSearchText(node, searchChildren);
  }

  function visit(node: T): boolean {
    // A secondary node never drives a filter match — it's
    // effectively invisible to search. Still rendered when the
    // caller opens the parent manually. This is what lets a 28k-row
    // field tree stay searchable at the record level without "field
    // name contains 'x'" matches spamming the results.
    if (isSecondary?.(node)) return false;

    const key = getKey(node);
    const children = getChildren(node) ?? [];
    const matches = matchText(node, children).includes(normalizedQuery);
    const visibleChildren: T[] = [];

    for (const child of children) {
      if (visit(child)) visibleChildren.push(child);
    }

    if (matches) {
      if (children.length > 0) {
        filteredChildren.set(key, children);
        forcedOpenKeys.add(key);
      }
      return true;
    }

    if (visibleChildren.length > 0) {
      filteredChildren.set(key, visibleChildren);
      forcedOpenKeys.add(key);
      return true;
    }

    return false;
  }

  return {
    roots: roots.filter((root) => visit(root)),
    filteredChildren,
    forcedOpenKeys,
  };
}

export function Tree<T>({
  roots,
  empty,
  className,
  showControls = true,
  expandAll: controlledExpandAll,
  onExpandAllChange,
  toolbarClassName,
  getSearchText,
  ...nodeProps
}: TreeProps<T>) {
  const [internalExpandAll, setInternalExpandAll] = useState<boolean | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const basePaddingPx = nodeProps.basePaddingPx ?? 8;
  const isControlled = onExpandAllChange !== undefined;
  const expandAll = isControlled ? (controlledExpandAll ?? null) : internalExpandAll;
  const totalEdges = useMemo(() => countTreeEdges(roots, nodeProps.getChildren), [
    roots,
    nodeProps.getChildren,
  ]);
  const showFilter = totalEdges > 20;
  const activeFilter = showFilter ? filterQuery : "";
  const filteredTree = useMemo(
    () =>
      filterTreeRoots(
        roots,
        nodeProps.getChildren,
        nodeProps.getKey,
        activeFilter,
        nodeProps.isSecondary,
        getSearchText,
      ),
    [
      roots,
      nodeProps.getChildren,
      nodeProps.getKey,
      activeFilter,
      nodeProps.isSecondary,
      getSearchText,
    ],
  );
  const treeRoots = filteredTree.roots;
  const filteredChildren = filteredTree.filteredChildren;
  const forcedOpenKeys = filteredTree.forcedOpenKeys;
  const effectiveGetChildren = filteredChildren
    ? (node: T) => filteredChildren.get(nodeProps.getKey(node)) ?? []
    : nodeProps.getChildren;
  const effectiveExpandAll = expandAll;
  const effectiveEmpty = activeFilter.trim() ? (
    <div className="px-3 py-4 text-sm text-muted-foreground">No matching tree nodes.</div>
  ) : (
    empty
  );
  const showControlButtons = showControls && roots.length > 0;
  const showVirtualRow = showFilter || showControlButtons;
  const setExpandAll = (next: boolean | null) => {
    if (isControlled) onExpandAllChange?.(next);
    else setInternalExpandAll(next);
  };

  if (treeRoots.length === 0 && !showVirtualRow) return <>{effectiveEmpty ?? null}</>;

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <div role="tree" className="min-h-0 flex-1 overflow-auto">
        {showVirtualRow && (
          <div
            role="presentation"
            className={cn(
              "sticky top-0 z-10 flex items-center gap-1.5 border-b border-border/70 bg-background/95 py-1 pr-2 text-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
              toolbarClassName,
            )}
            style={{ paddingLeft: `${basePaddingPx}px` }}
          >
            {showFilter ? (
              <Icon name="codicon:search" className="w-3 shrink-0 text-xs text-muted-foreground" />
            ) : (
              <span className="w-3 shrink-0" aria-hidden />
            )}

            {showFilter ? (
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm">
                <input
                  type="search"
                  value={filterQuery}
                  onChange={(event) => setFilterQuery(event.target.value)}
                  placeholder="Filter tree"
                  className="h-5 w-full border-0 bg-transparent p-0 text-xs outline-none placeholder:text-muted-foreground"
                  aria-label="Filter tree nodes"
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery("")}
                    className="inline-flex items-center rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Clear tree filter"
                    title="Clear tree filter"
                  >
                    <Icon name="codicon:close" className="text-xs" />
                  </button>
                )}
              </label>
            ) : (
              <span className="flex-1" />
            )}

            {showControlButtons && (
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpandAll(true)}
                  aria-pressed={effectiveExpandAll === true}
                  aria-label="Expand all"
                  title="Expand all"
                  disabled={activeFilter.trim().length > 0}
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    effectiveExpandAll === true && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon name="codicon:expand-all" className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpandAll(false)}
                  aria-pressed={effectiveExpandAll === false}
                  aria-label="Collapse all"
                  title="Collapse all"
                  disabled={activeFilter.trim().length > 0}
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    effectiveExpandAll === false && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon name="codicon:collapse-all" className="text-sm" />
                </button>
              </div>
            )}
          </div>
        )}

        {treeRoots.length === 0 ? (
          effectiveEmpty ?? null
        ) : (
          <>
            {treeRoots.map((root) => (
              <TreeNode<T>
                {...nodeProps}
                key={nodeProps.getKey(root)}
                node={root}
                expandAll={effectiveExpandAll}
                forcedOpenKeys={forcedOpenKeys}
                getChildren={effectiveGetChildren}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
