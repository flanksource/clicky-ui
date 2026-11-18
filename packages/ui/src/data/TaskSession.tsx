import type { ReactNode } from "react";
import { SessionInspector } from "./ai/SessionInspector";
import { isTerminalStatus, type TaskSessionRef, type TaskSnapshot } from "./TaskSnapshot";
import type { TaskStreamTab } from "./TaskStreamTabs";
import { TaskSessionChip } from "./TaskSession.chip";
import { SessionSummaryLine } from "./TaskSession.summary";
import type { TaskSessionFeed } from "./task-session-feed";

// A task names the session it drives with a typed reference; this module turns
// that reference into UI. Each session `type` has a renderer — a one-line
// summary for the task row and a detail pane for its expansion — so a host can
// add types without this module learning about them. Neither opens a
// connection of its own: the summary is drawn from the reference, and the
// detail follows its session through the feed of the task stream it came from.

/** What a renderer may use beyond the reference and its task. */
export interface TaskSessionContext {
  /** The live changes of the sessions on the task stream the task came from.
   *  Absent when that stream carries none (the polling transport, or a
   *  snapshot not read from a stream): the session can only be read. */
  feed?: TaskSessionFeed | undefined;
}

export interface TaskSessionRenderer {
  /** The always-visible line below a task's name. */
  summary: (ref: TaskSessionRef, task: TaskSnapshot, ctx: TaskSessionContext) => ReactNode;
  /** The expanded pane; null when the reference has nothing more to show. */
  detail: (ref: TaskSessionRef, task: TaskSnapshot, ctx: TaskSessionContext) => ReactNode;
}

/** Renderers keyed by `TaskSessionRef.type`. */
export type TaskSessionRenderers = Record<string, TaskSessionRenderer>;

/** The tab id the session detail takes in a task's stream tabs. */
export const TASK_SESSION_TAB_ID = "session";

/** A captain session shows the summary the server computed; it can be opened
 *  only where it is served, so without an href there is no detail. The detail
 *  follows the session only while its task runs and a feed delivers it. */
const captainSessionRenderer: TaskSessionRenderer = {
  summary: (ref) => (ref.summary ? <SessionSummaryLine summary={ref.summary} /> : null),
  detail: (ref, task, { feed }) =>
    ref.href ? (
      <div data-testid="task-session-detail" className="h-96 min-h-0 overflow-hidden">
        <SessionInspector
          src={ref.href}
          follow={feed !== undefined && !isTerminalStatus(task.status)}
          layout="compact"
          {...(feed ? { feed: (handlers) => feed.subscribe(ref, handlers) } : {})}
        />
      </div>
    ) : null,
};

export const defaultTaskSessionRenderers: TaskSessionRenderers = {
  captain: captainSessionRenderer,
};

/**
 * The summary line and the detail tab for a task's session. A type with no
 * renderer shows as a chip with no detail rather than being dropped. Host
 * renderers are layered over the defaults.
 */
export function resolveTaskSession({
  session,
  task,
  renderers,
  feed,
}: {
  session: TaskSessionRef;
  task: TaskSnapshot;
  renderers?: TaskSessionRenderers | undefined;
  feed?: TaskSessionFeed | undefined;
}): { summary: ReactNode; tab?: TaskStreamTab } {
  const all = renderers ? { ...defaultTaskSessionRenderers, ...renderers } : defaultTaskSessionRenderers;
  const renderer = Object.hasOwn(all, session.type) ? all[session.type] : undefined;
  if (!renderer) return { summary: <TaskSessionChip session={session} /> };
  const ctx = { feed };
  const detail = renderer.detail(session, task, ctx);
  return {
    summary: renderer.summary(session, task, ctx),
    ...(detail == null
      ? {}
      : {
          tab: {
            id: TASK_SESSION_TAB_ID,
            label: "Session",
            surface: "plain" as const,
            render: () => detail,
          },
        }),
  };
}
