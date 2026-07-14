import type { SessionEvent } from "./SessionViewer.model";

export interface SessionEventGroup {
  kind: "wait-group";
  id: string;
  count: number;
  representative: SessionEvent;
  events: SessionEvent[];
}

export type SessionDisplayItem = SessionEvent | SessionEventGroup;

export function isSessionEventGroup(item: SessionDisplayItem): item is SessionEventGroup {
  return item.kind === "wait-group";
}

function isWait(event: SessionEvent): boolean {
  return event.kind === "tool" && event.tool === "Wait";
}

function hasSameWaitContext(left: SessionEvent, right: SessionEvent): boolean {
  return (
    left.sessionId === right.sessionId &&
    left.source === right.source &&
    left.turnId === right.turnId &&
    left.agentId === right.agentId &&
    left.model === right.model &&
    left.reasoningEffort === right.reasoningEffort
  );
}

/**
 * Collapse only uninterrupted runs of Wait calls from the same transcript
 * context. This runs before filtering so a hidden intervening event still
 * remains a grouping boundary.
 */
export function collapseWaitRuns(events: readonly SessionEvent[]): SessionDisplayItem[] {
  const items: SessionDisplayItem[] = [];

  for (let index = 0; index < events.length; ) {
    const first = events[index]!;
    if (!isWait(first)) {
      items.push(first);
      index += 1;
      continue;
    }

    let end = index + 1;
    while (
      end < events.length &&
      isWait(events[end]!) &&
      hasSameWaitContext(first, events[end]!)
    ) {
      end += 1;
    }

    const run = events.slice(index, end);
    if (run.length === 1) {
      items.push(first);
    } else {
      const last = run[run.length - 1]!;
      items.push({
        kind: "wait-group",
        id: `wait-group:${first.id}:${last.id}`,
        count: run.length,
        representative: first,
        events: run,
      });
    }
    index = end;
  }

  return items;
}
