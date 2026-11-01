import { useEffect, useRef, useState } from "react";
import { Tree } from "../data/Tree";
import { Button } from "./button";
import type { LocalPathEntry, LocalPathLoader } from "./local-path";

export function LocalPathTree({
  entries,
  load,
  selected,
  onSelect,
  onRetry,
}: {
  entries: LocalPathEntry[];
  load: LocalPathLoader;
  selected: string;
  onSelect: (path: string) => void;
  onRetry: (path: string) => void;
}) {
  const [children, setChildren] = useState<Record<string, LocalPathEntry[]>>(
    {},
  );
  const [query, setQuery] = useState("");
  const requests = useRef(new Set<AbortController>());
  useEffect(
    () => () => {
      for (const request of requests.current) request.abort();
    },
    [],
  );
  const select = (node: LocalPathEntry) => {
    if (!node.directory && !node.problem) onSelect(node.path);
  };
  return (
    <Tree<LocalPathEntry>
      roots={entries}
      defaultOpen={() => false}
      getKey={(node) => `${node.path}\u0000${query}`}
      getChildren={(node) => children[node.path]}
      hasMoreChildren={(node) =>
        node.directory && !node.problem && children[node.path] === undefined
      }
      loadChildren={async (node) => {
        const controller = new AbortController();
        requests.current.add(controller);
        try {
          const result = await load(node.path, controller.signal);
          controller.signal.throwIfAborted();
          setChildren((previous) => ({
            ...previous,
            [node.path]: result.entries,
          }));
          return result.entries;
        } finally {
          requests.current.delete(controller);
        }
      }}
      getAriaLabel={(node) => node.name}
      getSearchText={(node) => node.name}
      showSearch
      searchLabel="Filter filenames"
      searchQuery={query}
      onSearchQueryChange={setQuery}
      showControls={false}
      empty="No matching files in this folder."
      selected={
        selected ? { path: selected, name: "", directory: false } : null
      }
      onSelect={select}
      renderRow={({ node, loading, error }) => (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button
            type="button"
            className="min-w-0 truncate text-left"
            disabled={!!node.problem}
            title={node.problem}
            onClick={
              node.directory
                ? undefined
                : (event) => {
                    event.stopPropagation();
                    select(node);
                  }
            }
          >
            {node.name}
            {node.directory ? "/" : ""}
          </button>
          {loading && <span role="status">Loading…</span>}
          {(error != null || node.problem) && (
            <span role="alert" className="text-destructive">
              {error instanceof Error
                ? error.message
                : String(error ?? node.problem)}
            </span>
          )}
          {error != null && (
            <Button
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                onRetry(node.path);
              }}
            >
              Retry folder
            </Button>
          )}
        </div>
      )}
    />
  );
}
