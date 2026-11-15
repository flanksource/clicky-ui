import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Tree } from "../../data/Tree";
import { threadStateDot } from "../../data/diagnostics/state-styles";
import { ThreadStateFilterChips } from "../../data/diagnostics/ThreadStateFilterChips";
import { buildThreadTree, countThreadStates, isDiagnosticsAgentThread, visibleThreads, type ThreadSort, type ThreadTreeNode } from "../model/threads";
import type { JvmThread } from "../protocol/types";
import { ThreadGroupRow, ThreadRow } from "./ThreadRow";

type Node = ThreadTreeNode<JvmThread>;

export type ThreadTreeProps = {
  threads: JvmThread[];
  cpuTimeEnabled: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Tree filter text, matched against each thread's id, name, state and `getSearchText`. */
  query: string;
  onQueryChange: (query: string) => void;
  sort: ThreadSort;
  onSortChange: (sort: ThreadSort) => void;
  /** States to show; empty shows all. */
  states: ReadonlySet<string>;
  onToggleState: (state: string) => void;
  /** Resets the filter text and the state selection. */
  onClear: () => void;
  /** Host content under a thread's own lines. */
  rowExtra?: (thread: JvmThread) => ReactNode;
  /** Host text the filter also matches for a thread. */
  getSearchText?: (thread: JvmThread) => string;
};

/** Threads grouped by name family, with sort, state chips, a text filter and an agent-thread toggle. */
export function ThreadTree({
  threads,
  cpuTimeEnabled,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  sort,
  onSortChange,
  states,
  onToggleState,
  onClear,
  rowExtra,
  getSearchText,
}: ThreadTreeProps) {
  const [showAgent, setShowAgent] = useState(false);
  const own = useMemo(() => (showAgent ? threads : threads.filter((thread) => !isDiagnosticsAgentThread(thread.name))), [threads, showAgent]);
  const stateCounts = useMemo(() => countThreadStates(own), [own]);
  const tree = useMemo(() => buildThreadTree(visibleThreads(threads, { states, sort, showAgent })), [threads, states, sort, showAgent]);
  const selectedNode = useMemo<Node | null>(
    () => tree.flatMap((node) => [node, ...(node.children ?? [])]).find((node) => node.thread?.id === selectedId) ?? null,
    [tree, selectedId],
  );
  const hiddenAgentThreads = threads.length - own.length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex flex-wrap items-center gap-1">
        <SegmentedControl<ThreadSort>
          value={sort}
          onChange={onSortChange}
          size="sm"
          aria-label="Sort threads"
          options={[
            { id: "cpu", label: "CPU" },
            { id: "name", label: "Name" },
          ]}
        />
        <ThreadStateFilterChips counts={stateCounts} selected={states} dot={threadStateDot} onToggle={onToggleState} className="contents" />
        {query || states.size > 0 ? (
          <Button type="button" size="xs" variant="ghost" className="text-muted-foreground" onClick={onClear}>
            Clear
          </Button>
        ) : null}
        <label className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground" title="Show threads a diagnostics agent (Arthas, the attach listener) spawned for itself">
          <input type="checkbox" checked={showAgent} onChange={(event) => setShowAgent(event.target.checked)} className="h-3 w-3" />
          Show agent threads
          {hiddenAgentThreads > 0 && !showAgent ? <span className="opacity-70">({hiddenAgentThreads} hidden)</span> : null}
        </label>
      </div>
      <Tree<Node>
        className="min-h-0 flex-1 overflow-auto rounded-md border border-border"
        ariaLabel="Threads"
        roots={tree}
        getKey={(node) => node.id}
        getChildren={(node) => node.children}
        getSearchText={(node) => (node.thread ? `${node.thread.id} ${node.thread.name} ${node.thread.state} ${getSearchText?.(node.thread) ?? ""}` : node.label)}
        showSearch
        searchLabel="Filter threads"
        searchQuery={query}
        onSearchQueryChange={onQueryChange}
        selected={selectedNode}
        revealSelected
        onSelect={(node) => {
          if (node.thread) onSelect(node.thread.id);
        }}
        defaultOpen={(_node, depth) => depth < 1}
        empty={<p className="p-2 text-xs text-muted-foreground">No threads match the selected filters.</p>}
        renderRow={({ node }) =>
          node.thread ? (
            <ThreadRow thread={node.thread} cpuTimeEnabled={cpuTimeEnabled} onSelect={onSelect} extra={rowExtra?.(node.thread)} />
          ) : (
            <ThreadGroupRow node={node} />
          )
        }
      />
    </div>
  );
}
