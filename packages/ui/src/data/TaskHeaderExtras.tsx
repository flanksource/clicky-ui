import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import { isTaskProcessDetails } from "./task-process-details";
import { metadataEntries } from "./task-metadata";
import type { TaskSnapshot } from "./TaskSnapshot";

/**
 * Contributes host-owned content into a task's header row — the line carrying
 * its name, beside the duration and controls. It exists for the same reason
 * `TaskExtraTabs` does: what is worth knowing about a task at a glance is often
 * something only the host can say. An agent row wants its turn state and the
 * thread it is working; a build row wants neither.
 *
 * Return `null` for tasks it has nothing to add for, and the default renderer
 * takes over — so a host can enrich one kind of task without having to
 * re-implement the default for every other kind.
 */
export type TaskHeaderExtra = (task: TaskSnapshot, group: TaskSnapshot) => ReactNode;

/** One metadata value, sized and coloured to sit on a header row. */
function MetadataChip({ label, value, tone }: { label: string; value: string; tone?: "active" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-1 rounded-full px-1.5 py-px text-[10px] leading-4",
        tone === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
      title={`${label}: ${value}`}
    >
      <span className="opacity-70">{label}</span>
      <span className="max-w-32 truncate font-medium">{value}</span>
    </span>
  );
}

/**
 * States that read as "this is doing something right now", and so earn the
 * accent that makes a busy row findable in a long list. Matched case-insensitively
 * against a `state`/`status`/`phase` value, because the producer names its own
 * states and this only decides how loud to render them.
 */
const ACTIVE_STATES = new Set(["running", "active", "busy", "working", "in-progress", "starting"]);
const STATE_KEYS = new Set(["state", "status", "phase"]);

function chipTone(key: string, value: string): "active" | undefined {
  return STATE_KEYS.has(key) && ACTIVE_STATES.has(value.toLowerCase()) ? "active" : undefined;
}

/**
 * The default header content: the scalar values of a process's metadata, as
 * chips. Structured values are deliberately left out — they are shown in full,
 * with their structure, in the expanded process details, and a header row is not
 * the place to flatten them.
 *
 * A task with no process details, or none worth a chip, renders nothing, so a
 * plain task row looks exactly as it did before.
 */
export function TaskMetadataChips({ task }: { task: TaskSnapshot }) {
  const details = isTaskProcessDetails(task.details) ? task.details : undefined;
  const entries = metadataEntries(details?.metadata);
  if (entries.length === 0) return null;
  return (
    <div className="flex min-w-0 shrink items-center gap-1 overflow-hidden">
      {entries.map(({ key, text }) => (
        <MetadataChip key={key} label={key} value={text} {...(chipTone(key, text) ? { tone: "active" as const } : {})} />
      ))}
    </div>
  );
}
