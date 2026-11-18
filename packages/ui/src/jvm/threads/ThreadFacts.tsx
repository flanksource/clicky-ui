import { KeyValueList, type KeyValueListItem } from "../../data/KeyValueList";
import { formatContention, formatThreadCpu } from "../model/threads";
import type { JvmThread } from "../protocol/types";
import { LockOwnerButton } from "./LockOwnerButton";

export type ThreadFactsProps = {
  thread: JvmThread;
  cpuTimeEnabled: boolean;
  onSelectThread: (id: number) => void;
};

/** CPU, contention, priority and the lock a thread waits on. */
export function ThreadFacts({ thread, cpuTimeEnabled, onSelectThread }: ThreadFactsProps) {
  const cpu = formatThreadCpu(thread, cpuTimeEnabled);
  const flags = [thread.daemon ? "daemon" : null, thread.inNative ? "in native" : null, thread.suspended ? "suspended" : null].filter(Boolean).join(" · ");
  const items: KeyValueListItem[] = [
    {
      key: "cpu",
      label: "CPU",
      value: (
        <>
          <span title={cpu.title}>{cpu.text}</span>
          {thread.cpuTimeMs !== null ? <span className="text-muted-foreground"> · {thread.cpuTimeMs} ms total</span> : null}
        </>
      ),
    },
    { key: "blocked", label: "Blocked", hidden: thread.blockedCount === undefined, value: formatContention(thread.blockedCount ?? 0, thread.blockedTimeMs) },
    { key: "waited", label: "Waited", hidden: thread.waitedCount === undefined, value: formatContention(thread.waitedCount ?? 0, thread.waitedTimeMs) },
    {
      key: "priority",
      label: "Priority",
      hidden: thread.priority === undefined && flags === "",
      value: (
        <>
          {thread.priority}
          {flags ? <span className="text-muted-foreground"> · {flags}</span> : null}
        </>
      ),
    },
    {
      key: "lock",
      label: "Waiting on",
      hidden: thread.lockName === null,
      value: (
        <>
          <span className="break-all font-mono">{thread.lockName}</span>
          {thread.lockOwnerId !== null ? (
            <>
              {" owned by "}
              <LockOwnerButton thread={thread} onSelect={onSelectThread} />
            </>
          ) : null}
        </>
      ),
    },
  ];
  return <KeyValueList items={items} className="text-xs" valueClassName="text-xs" />;
}
