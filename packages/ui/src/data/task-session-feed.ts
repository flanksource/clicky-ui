import type { SessionFeedHandlers, SessionFollowState } from "./ai/session-feed";
import type { SessionUIMessage } from "./ai/SessionViewer.unified";

// A task stream multiplexes the live changes of the sessions its tasks drive:
// `session` (one transcript message), `session-state` and `session-error`
// frames, each keyed by the session's `{type, id}`. This module is the fan-out
// between that one connection and whoever is looking at a session.
//
// The feed is live-only and holds nothing: a frame that arrives while nobody
// is subscribed is gone, because a subscriber reads the transcript itself over
// HTTP and uses the feed only for what happens afterwards. The polling
// transport carries no session frames, so it has no feed.

/** Identifies a session on the wire (Go `task.SessionRef` without the href). */
export interface TaskSessionFeedRef {
  type: string;
  id: string;
}

export interface TaskSessionFeed {
  /** Delivers the frames of one session to `handlers`; the returned function
   *  stops delivery. */
  subscribe: (ref: TaskSessionFeedRef, handlers: SessionFeedHandlers) => () => void;
}

export const TASK_SESSION_FRAME_EVENTS = ["session", "session-state", "session-error"] as const;
export type TaskSessionFrameEvent = (typeof TASK_SESSION_FRAME_EVENTS)[number];

export interface TaskSessionFeedSource {
  feed: TaskSessionFeed;
  /** Validates a parsed frame of `event` and delivers it to the subscribers of
   *  its session. Throws on a malformed frame, delivering nothing. */
  dispatch: (event: TaskSessionFrameEvent, data: unknown) => void;
}

const refKey = ({ type, id }: TaskSessionFeedRef) => JSON.stringify([type, id]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function frameRef(frame: Record<string, unknown>): TaskSessionFeedRef {
  const { session } = frame;
  if (
    !isRecord(session) ||
    typeof session.type !== "string" ||
    !session.type ||
    typeof session.id !== "string" ||
    !session.id
  ) {
    throw new Error("it has no session {type, id}");
  }
  return { type: session.type, id: session.id };
}

export function createTaskSessionFeed(): TaskSessionFeedSource {
  const subscribers = new Map<string, Set<SessionFeedHandlers>>();

  const feed: TaskSessionFeed = {
    subscribe: (ref, handlers) => {
      const key = refKey(ref);
      const set = subscribers.get(key) ?? new Set<SessionFeedHandlers>();
      set.add(handlers);
      subscribers.set(key, set);
      return () => {
        set.delete(handlers);
        if (set.size === 0 && subscribers.get(key) === set) subscribers.delete(key);
      };
    },
  };

  const deliver = (ref: TaskSessionFeedRef, send: (handlers: SessionFeedHandlers) => void) => {
    for (const handlers of Array.from(subscribers.get(refKey(ref)) ?? [])) send(handlers);
  };

  const dispatch = (event: TaskSessionFrameEvent, data: unknown) => {
    const describe = (reason: string): never => {
      throw new Error(`Malformed ${event} frame: ${reason}: ${JSON.stringify(data)}`);
    };
    if (!isRecord(data)) return describe("it is not an object");
    let ref: TaskSessionFeedRef;
    try {
      ref = frameRef(data);
    } catch (cause) {
      return describe((cause as Error).message);
    }

    if (event === "session") {
      const { entry } = data;
      if (!isRecord(entry) || typeof entry.id !== "string" || !entry.id) {
        return describe("its entry has no message id");
      }
      return deliver(ref, (handlers) => handlers.onEntry(entry as unknown as SessionUIMessage));
    }
    if (event === "session-state") {
      const { state } = data;
      if (
        !isRecord(state) ||
        typeof state.revision !== "number" ||
        typeof state.lifecycleStatus !== "string" ||
        typeof state.facets !== "string"
      ) {
        return describe("its state lacks a numeric revision, a lifecycleStatus and facets");
      }
      return deliver(ref, (handlers) => handlers.onState(state as unknown as SessionFollowState));
    }
    const { error } = data;
    if (typeof error !== "string") return describe("its error is not a string");
    return deliver(ref, (handlers) => handlers.onError(error));
  };

  return { feed, dispatch };
}
