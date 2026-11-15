import type { ReactNode } from "react";
import { threadStateDot } from "../../data/diagnostics/state-styles";
import { formatThreadCpu, type ThreadTreeNode } from "../model/threads";
import type { JvmThread } from "../protocol/types";
import { LockOwnerButton } from "./LockOwnerButton";

export type ThreadRowProps = {
  thread: JvmThread;
  cpuTimeEnabled: boolean;
  onSelect: (id: number) => void;
  /** Host content under the thread's own lines, e.g. a finding summary. */
  extra?: ReactNode;
};

/** One thread in the tree: state dot, id, name, CPU and, when blocked, the lock and its owner. */
export function ThreadRow({ thread, cpuTimeEnabled, onSelect, extra }: ThreadRowProps) {
  const cpu = formatThreadCpu(thread, cpuTimeEnabled);
  return (
    <div data-thread-row={thread.id} className="flex min-w-0 flex-1 flex-col text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${threadStateDot(thread.state)}`} />
        <span className="font-mono text-[11px] text-muted-foreground">{thread.id}</span>
        <span className="flex-1 truncate">{thread.name}</span>
        <span data-thread-cpu className="font-mono text-[11px] text-muted-foreground" title={cpu.title}>
          {cpu.text}
        </span>
      </div>
      {thread.lockName !== null ? (
        <div className="truncate pl-4 text-[11px] text-muted-foreground" title={thread.lockName}>
          on <span className="font-mono">{thread.lockName}</span>
          {thread.lockOwnerId !== null ? (
            <>
              {" owned by "}
              <LockOwnerButton thread={thread} onSelect={onSelect} />
            </>
          ) : null}
        </div>
      ) : null}
      {extra ? <div className="pl-4 text-[11px] text-muted-foreground">{extra}</div> : null}
    </div>
  );
}

/** A group node of the tree: the family name, its dominant state and the member count. */
export function ThreadGroupRow({ node }: { node: ThreadTreeNode<JvmThread> }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
      <span className={`h-2 w-2 shrink-0 rounded-full ${threadStateDot(node.state ?? "")}`} />
      <span className="flex-1 truncate">{node.label}</span>
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{node.count}</span>
    </div>
  );
}
