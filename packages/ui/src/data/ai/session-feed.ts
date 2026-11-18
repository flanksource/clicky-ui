import type { SessionUIMessage } from "./SessionViewer.unified";

// A session feed is a live source of one session's changes that the host
// supplies instead of the inspector opening its own follow EventSource — for
// example the frames a task stream multiplexes. It carries only what happens
// after it is subscribed to: the subscriber reads the transcript itself.

/** The payload of a follow stream's `state` frame. */
export interface SessionFollowState {
  revision: number;
  lifecycleStatus: string;
  activityState: string;
  /** Opaque fingerprint of non-message session facets (plan, todos, files,
   *  approval requests). Always sent by captain — see SessionInspector.remote
   *  for how it's used to decide whether to refetch. */
  facets: string;
}

export interface SessionFeedHandlers {
  /** A message was added or changed; merged by id. */
  onEntry: (entry: SessionUIMessage) => void;
  onState: (state: SessionFollowState) => void;
  /** The feed for this session failed and will deliver nothing more. */
  onError: (error: string) => void;
}

/** Starts delivering one session's frames to `handlers`; the returned function
 *  stops it. */
export type SessionFeedSubscription = (handlers: SessionFeedHandlers) => () => void;
