import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loading } from "../../components/loading";
import { SplitPane } from "../../layout/SplitPane";
import { cn } from "../../lib/utils";
import { InlineError } from "../../rpc/InlineError";
import {
  parseStateSet,
  parseThreadId,
  parseThreadSort,
  serializeStateSet,
  threadStackFileName,
  withViewParam,
  type ThreadSort,
  type ThreadsViewState,
} from "../model/threads";
import type { JvmThread, JvmThreadStack } from "../protocol/types";
import { DeadlockCallout } from "../threads/DeadlockCallout";
import { downloadText } from "../threads/download-text";
import { ThreadDetail } from "../threads/ThreadDetail";
import { ThreadTree } from "../threads/ThreadTree";
import { ThreadsToolbar } from "../threads/ThreadsToolbar";
import { useJvm } from "./jvm-context";

/** URL-shaped selection the host persists (search params, router state, …). */
export type ThreadsSurfaceState = ThreadsViewState;

export type ThreadsSurfaceProps = {
  state: ThreadsSurfaceState;
  onStateChange: (next: ThreadsSurfaceState) => void;
  /** The host lets this operator download stacks and the full dump. Default true. */
  canDownload?: boolean;
  /** Time between snapshot refreshes while not paused. Default 5000. */
  pollMs?: number;
  /** Host content under a thread's own lines in the tree, e.g. a finding summary. */
  rowExtra?: (thread: JvmThread) => ReactNode;
  /** Host text the tree filter also matches for a thread. */
  getSearchText?: (thread: JvmThread) => string;
  /** Host content between the selected thread's facts and its stack. */
  renderDetailExtra?: (stack: JvmThreadStack) => ReactNode;
  /** Host buttons in the toolbar, before Pause and Refresh. */
  toolbarActions?: ReactNode;
  /** Replaces the default folded stack trace. */
  renderStack?: (stack: JvmThreadStack) => ReactNode;
  className?: string;
};

// CPU % is the delta of two thread CPU-time reads this far apart in the JVM.
const SAMPLE_MS = 200;
const DEFAULT_POLL_MS = 5_000;

type DetailProps = Pick<ThreadsSurfaceProps, "canDownload" | "renderDetailExtra" | "renderStack"> & {
  threadId: number;
  snapshotThread: JvmThread | undefined;
  cpuTimeEnabled: boolean;
  onSelectThread: (id: number) => void;
};

function ThreadDetailPanel({ threadId, snapshotThread, cpuTimeEnabled, onSelectThread, canDownload = true, renderDetailExtra, renderStack }: DetailProps) {
  const { client, keys, scope } = useJvm();
  const stack = useQuery({ queryKey: keys.threadStack(threadId), queryFn: ({ signal }) => client.threadStack(threadId, { signal }) });
  const dump = useMutation({
    mutationFn: () => client.threadDump(),
    onSuccess: (text) => downloadText(`jvm-threads-${scope.replace(/[^\w.-]+/g, "_")}.txt`, text),
  });
  const loaded = stack.data;

  return (
    <ThreadDetail
      threadId={threadId}
      thread={loaded?.thread ?? snapshotThread}
      inSnapshot={snapshotThread !== undefined}
      cpuTimeEnabled={cpuTimeEnabled}
      stack={loaded}
      stackError={stack.error}
      refreshing={stack.isFetching}
      onRefresh={() => void stack.refetch()}
      onSelectThread={onSelectThread}
      dumpPending={dump.isPending}
      dumpError={dump.error}
      {...(canDownload && loaded ? { onDownloadStack: () => downloadText(threadStackFileName(loaded.thread), loaded.text) } : {})}
      {...(canDownload ? { onDownloadDump: () => dump.mutate() } : {})}
      {...(loaded && renderDetailExtra ? { extra: renderDetailExtra(loaded) } : {})}
      {...(renderStack ? { renderStack } : {})}
    />
  );
}

/**
 * Every live thread of the JVM in scope, grouped by name family with CPU, state
 * and lock contention; polls a fresh snapshot (pausable), flags deadlocks, and
 * shows the selected thread's stack with repeated recursion folded.
 */
export function ThreadsSurface({
  state,
  onStateChange,
  canDownload,
  pollMs = DEFAULT_POLL_MS,
  rowExtra,
  getSearchText,
  renderDetailExtra,
  renderStack,
  toolbarActions,
  className,
}: ThreadsSurfaceProps) {
  const { client, keys } = useJvm();
  const [paused, setPaused] = useState(false);
  const snapshot = useQuery({
    queryKey: keys.threads,
    queryFn: ({ signal }) => client.threads({ sampleMs: SAMPLE_MS }, { signal }),
    refetchInterval: paused ? false : pollMs,
    refetchIntervalInBackground: false,
  });
  const selectedId = parseThreadId(state.thread);
  const states = useMemo(() => parseStateSet(state.states), [state.states]);
  const select = (id: number) => onStateChange({ ...state, thread: String(id) });
  const toggleState = (name: string) => {
    const next = new Set(states);
    if (!next.delete(name)) next.add(name);
    onStateChange(withViewParam(state, "states", serializeStateSet(next)));
  };

  if (snapshot.isPending) return <Loading />;
  if (!snapshot.data) return <InlineError title="Threads unavailable" error={snapshot.error} />;
  const { threads, deadlocked, cpuTimeEnabled, sampledMs } = snapshot.data;

  return (
    <section className={cn("flex h-full min-h-0 flex-col gap-2 p-3", className)}>
      <DeadlockCallout deadlocked={deadlocked} threads={threads} onSelect={select} />
      <ThreadsToolbar
        threadCount={threads.length}
        sampledMs={sampledMs}
        updatedAt={snapshot.dataUpdatedAt}
        paused={paused}
        onTogglePause={() => setPaused(!paused)}
        refreshing={snapshot.isFetching}
        onRefresh={() => void snapshot.refetch()}
        actions={toolbarActions}
      />
      {snapshot.error ? <InlineError title="Thread snapshot refresh failed" error={snapshot.error} /> : null}
      <SplitPane
        className="flex min-h-0 flex-1 rounded-md border border-border"
        defaultSplit={38}
        minLeft={22}
        minRight={30}
        left={
          <ThreadTree
            threads={threads}
            cpuTimeEnabled={cpuTimeEnabled}
            selectedId={selectedId}
            onSelect={select}
            query={state.q ?? ""}
            onQueryChange={(q) => onStateChange(withViewParam(state, "q", q))}
            sort={parseThreadSort(state.sort)}
            onSortChange={(sort: ThreadSort) => onStateChange(withViewParam(state, "sort", sort === "cpu" ? "" : sort))}
            states={states}
            onToggleState={toggleState}
            onClear={() => onStateChange(withViewParam(withViewParam(state, "q", ""), "states", ""))}
            {...(rowExtra ? { rowExtra } : {})}
            {...(getSearchText ? { getSearchText } : {})}
          />
        }
        right={
          <div className="h-full min-h-0 overflow-auto bg-muted/10">
            {selectedId === null ? (
              <p className="p-4 text-xs text-muted-foreground">Select a thread to read its stack.</p>
            ) : (
              <ThreadDetailPanel
                key={selectedId}
                threadId={selectedId}
                snapshotThread={threads.find((thread) => thread.id === selectedId)}
                cpuTimeEnabled={cpuTimeEnabled}
                onSelectThread={select}
                {...(canDownload !== undefined ? { canDownload } : {})}
                {...(renderDetailExtra ? { renderDetailExtra } : {})}
                {...(renderStack ? { renderStack } : {})}
              />
            )}
          </div>
        }
      />
    </section>
  );
}
