import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { threadStateBadge, threadStateDot } from "../../data/diagnostics/state-styles";
import { UiDownload, UiRefresh } from "../../icons";
import { InlineError } from "../../rpc/InlineError";
import type { JvmThread, JvmThreadStack } from "../protocol/types";
import { FoldedStackTrace } from "./FoldedStackTrace";
import { ThreadFacts } from "./ThreadFacts";

export type ThreadDetailProps = {
  threadId: number;
  /** The thread's latest data: the stack's own, else the snapshot row. Absent while loading a thread already gone. */
  thread: JvmThread | undefined;
  /** The thread is in the latest snapshot; false once it has ended. */
  inSnapshot: boolean;
  cpuTimeEnabled: boolean;
  stack: JvmThreadStack | undefined;
  stackError: unknown;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectThread: (id: number) => void;
  /** Shows "Download stack". */
  onDownloadStack?: () => void;
  /** Shows "Download full dump". */
  onDownloadDump?: () => void;
  dumpPending?: boolean;
  dumpError?: unknown;
  /** Host content between the facts and the stack, e.g. an analysis of this thread. */
  extra?: ReactNode;
  /** Replaces the default folded stack trace. */
  renderStack?: (stack: JvmThreadStack) => ReactNode;
};

/** One thread's header (state, CPU, contention, lock owner) and its stack. */
export function ThreadDetail({
  threadId,
  thread,
  inSnapshot,
  cpuTimeEnabled,
  stack,
  stackError,
  refreshing,
  onRefresh,
  onSelectThread,
  onDownloadStack,
  onDownloadDump,
  dumpPending = false,
  dumpError,
  extra,
  renderStack,
}: ThreadDetailProps) {
  return (
    <div className="flex min-h-0 flex-col gap-3 p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {thread ? <span className={`h-2 w-2 shrink-0 rounded-full ${threadStateDot(thread.state)}`} /> : null}
        <h3 className="text-sm font-semibold">{thread?.name ?? `Thread ${threadId}`}</h3>
        <span className="font-mono text-muted-foreground">#{threadId}</span>
        {thread ? <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${threadStateBadge(thread.state)}`}>{thread.state}</span> : null}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <Button type="button" size="xs" variant="outline" loading={refreshing} onClick={onRefresh}>
            <UiRefresh /> Refresh
          </Button>
          {onDownloadStack ? (
            <Button type="button" size="xs" variant="outline" disabled={!stack} title="Download this thread's stack as a text file" onClick={onDownloadStack}>
              <UiDownload /> Download stack
            </Button>
          ) : null}
          {onDownloadDump ? (
            <Button type="button" size="xs" variant="outline" loading={dumpPending} title="Download every thread's stack (jstack format)" onClick={onDownloadDump}>
              <UiDownload /> Download full dump
            </Button>
          ) : null}
        </div>
      </div>
      {thread ? <ThreadFacts thread={thread} cpuTimeEnabled={cpuTimeEnabled} onSelectThread={onSelectThread} /> : null}
      {!inSnapshot && stack ? <p className="text-muted-foreground">This thread is not in the latest snapshot; it may have ended.</p> : null}
      {extra}
      {dumpError ? <InlineError title="Thread dump unavailable" error={dumpError} /> : null}
      {stackError ? (
        <InlineError title={`Stack for thread ${threadId} unavailable`} error={stackError} />
      ) : stack ? (
        renderStack ? (
          renderStack(stack)
        ) : (
          <FoldedStackTrace stack={stack} />
        )
      ) : (
        <Loading />
      )}
    </div>
  );
}
