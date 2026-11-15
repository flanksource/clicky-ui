import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { Checkbox } from "../../components/Checkbox";
import { InputField } from "../../components/InputField";
import { Loading } from "../../components/loading";
import { Select } from "../../components/select";
import { Tree } from "../../data/Tree";
import { UiFileCode, UiFolder } from "../../icons";
import { buildClassTree, findClassNode, type ClassTreeNode } from "../model/class-tree";
import type { JvmClassLoader, JvmClassRef } from "../protocol/types";

export type ClassBrowserProps = {
  loaders: JvmClassLoader[];
  /** Hash of the loader whose classes are listed; "" lists every loader. */
  loader: string;
  onLoaderChange: (loader: string) => void;
  /** Server-side name filter. Packages open while it is non-empty. */
  query: string;
  onQueryChange: (query: string) => void;
  includePlatform: boolean;
  onIncludePlatformChange: (includePlatform: boolean) => void;
  /** Every class loaded so far, across pages. */
  classes: JvmClassRef[];
  /** Classes the JVM has for this loader and filter, loaded or not. */
  total: number;
  /** Present while more classes remain; loads the next page. */
  onLoadMore?: (() => void) | undefined;
  loadingMore?: boolean | undefined;
  /** The first page is loading. */
  loading?: boolean | undefined;
  /** Rendered in place of the tree, e.g. an `InlineError` for a failed listing. */
  error?: ReactNode;
  selected?: JvmClassRef | undefined;
  onSelectClass: (ref: JvmClassRef) => void;
  /** Host decoration after a class's name, e.g. a "generated" badge. */
  renderClassBadge?: ((ref: JvmClassRef) => ReactNode) | undefined;
  /** Wait this long after typing before reporting the filter. Default 250. */
  debounceMs?: number | undefined;
  className?: string | undefined;
};

function loaderOptionLabel(loader: JvmClassLoader): string {
  return `${loader.label} · ${loader.classCount} classes${loader.virtual ? " · group" : ""}`;
}

function ClassRow({ node, showLoader, renderClassBadge }: { node: ClassTreeNode; showLoader: boolean; renderClassBadge: ClassBrowserProps["renderClassBadge"] }) {
  const { ref } = node;
  if (!ref) {
    return (
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
        <UiFolder className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
        <span className="font-normal text-muted-foreground">({node.count})</span>
      </span>
    );
  }
  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs" title={ref.name}>
      <UiFileCode className="size-3.5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate font-mono">{node.name}</span>
      {renderClassBadge?.(ref)}
      {showLoader ? <span className="max-w-24 shrink-0 truncate font-mono text-[10px] text-muted-foreground">{ref.loader}</span> : null}
    </span>
  );
}

/**
 * Loader picker, name filter and package tree over the loaded classes. The
 * filter is applied by the JVM, so the tree only shows the pages loaded so far.
 */
export function ClassBrowser({
  loaders,
  loader,
  onLoaderChange,
  query,
  onQueryChange,
  includePlatform,
  onIncludePlatformChange,
  classes,
  total,
  onLoadMore,
  loadingMore = false,
  loading = false,
  error,
  selected,
  onSelectClass,
  renderClassBadge,
  debounceMs = 250,
  className,
}: ClassBrowserProps) {
  const [draft, setDraft] = useState(query);
  const commit = useRef(onQueryChange);
  commit.current = onQueryChange;
  useEffect(() => setDraft(query), [query]);
  useEffect(() => {
    if (draft === query) return;
    const timer = setTimeout(() => commit.current(draft), debounceMs);
    return () => clearTimeout(timer);
  }, [draft, query, debounceMs]);

  const roots = useMemo(() => buildClassTree(classes), [classes]);
  const selectedNode = useMemo(() => (selected ? findClassNode(roots, selected) : null), [roots, selected]);
  const filtering = query !== "";

  let body: ReactNode;
  if (error) body = error;
  else if (loading) body = <Loading />;
  else if (roots.length === 0) body = <p className="p-2 text-xs text-muted-foreground">No loaded classes match.</p>;
  else {
    body = (
      <Tree<ClassTreeNode>
        key={filtering ? "filtered" : "all"}
        ariaLabel="Loaded classes"
        roots={roots}
        getKey={(node) => node.key}
        getChildren={(node) => (node.children.length > 0 ? node.children : undefined)}
        getAriaLabel={(node) => node.ref?.name ?? node.key}
        getSearchText={(node) => node.ref?.name ?? node.key}
        defaultOpen={(_node, depth) => depth === 0 || filtering}
        selected={selectedNode}
        revealSelected
        onSelect={(node) => {
          if (node.ref) onSelectClass(node.ref);
        }}
        renderRow={({ node }) => <ClassRow node={node} showLoader={loader === ""} renderClassBadge={renderClassBadge} />}
        showControls={false}
        showSearch={false}
      />
    );
  }

  return (
    <div className={["flex min-h-0 flex-col gap-2", className].filter(Boolean).join(" ")}>
      <Select aria-label="Class loader" value={loader} onChange={(event) => onLoaderChange(event.target.value)}>
        <option value="">All loaders</option>
        {loaders.map((candidate) => (
          <option key={candidate.hash} value={candidate.hash}>
            {loaderOptionLabel(candidate)}
          </option>
        ))}
      </Select>
      <InputField aria-label="Filter classes" placeholder="Filter classes" value={draft} onChange={setDraft} clearable onClear={() => setDraft("")} />
      <Checkbox className="text-xs" checked={includePlatform} onChange={onIncludePlatformChange} label="Include platform classes" />
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/10">{body}</div>
      <div className="flex shrink-0 items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {classes.length} of {total} classes
        </span>
        {onLoadMore ? (
          <Button size="sm" variant="outline" loading={loadingMore} onClick={onLoadMore}>
            Load more
          </Button>
        ) : null}
      </div>
    </div>
  );
}
