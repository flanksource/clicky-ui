import { type ReactNode, useState } from "react";

import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";
import type { TaskSnapshot } from "./TaskSnapshot";

/**
 * A pane of output for a task, contributed by the host. It exists because the
 * raw stdout of a process is not always the output worth reading: an agent's
 * stdout is its JSON-RPC transport, and the readable account of what it did
 * lives somewhere only the host knows how to fetch.
 */
export interface TaskStreamTab {
  /** Stable across renders; also the tab's label when no `label` is given. */
  id: string;
  label?: string;
  render: () => ReactNode;
}

/**
 * Contributes host-owned panes for one task. Return [] for tasks it cannot
 * serve. The group is passed alongside because identity — kind, labels, href —
 * lives on the group snapshot, not on the child task row.
 */
export type TaskExtraTabs = (task: TaskSnapshot, group: TaskSnapshot) => TaskStreamTab[];

function TaskStreamPane({ text, truncated, error }: { text: string; truncated?: boolean; error?: boolean }) {
  return (
    <>
      {truncated && <div className="px-2 pt-1 text-[10px] text-gray-400">showing latest 1 MiB</div>}
      <AnsiHtml
        text={text}
        className={cn("max-h-64 overflow-auto whitespace-pre-wrap p-2 text-xs text-gray-100", error && "text-red-300")}
      />
    </>
  );
}

/**
 * TaskStreamTabs puts every account of what a task is doing behind one tab
 * strip: whatever the host contributes first, then the process's own streams.
 * A single stream still renders as one labelled pane, so the common case does
 * not grow a tab strip it has no use for.
 */
export function TaskStreamTabs({ task, extraTabs }: { task: TaskSnapshot; extraTabs?: TaskStreamTab[] }) {
  const tabs: TaskStreamTab[] = [...(extraTabs ?? [])];
  const stdout = task.stdout;
  const stderr = task.stderr;
  if (stdout) {
    tabs.push({
      id: "stdout",
      render: () => <TaskStreamPane text={stdout} {...(task.stdoutTruncated ? { truncated: true } : {})} />,
    });
  }
  if (stderr) {
    tabs.push({
      id: "stderr",
      render: () => <TaskStreamPane text={stderr} {...(task.stderrTruncated ? { truncated: true } : {})} error />,
    });
  }

  const [selected, setSelected] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === selected) ?? tabs[0];
  if (!active) return null;

  return (
    <div className="mt-2 overflow-hidden rounded border bg-black" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-1 border-b border-white/10 px-1 py-1 text-[10px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={tab.id === active.id}
            className={cn(
              "rounded px-2 py-0.5",
              tab.id === active.id ? "bg-white/10 text-gray-100" : "text-gray-400 hover:text-gray-200",
            )}
            onClick={() => setSelected(tab.id)}
          >
            {tab.label ?? tab.id}
          </button>
        ))}
      </div>
      {active.render()}
    </div>
  );
}
