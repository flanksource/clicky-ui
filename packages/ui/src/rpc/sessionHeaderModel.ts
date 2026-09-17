import {
  isSessionTerminal,
  type SessionInfo,
  type SessionState,
  type SessionStoreLocation,
} from "./sessionTypes";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const DEFAULT_SESSION_DURATION_PRESETS_MS: readonly number[] = [5 * MINUTE, 15 * MINUTE, HOUR];

export type SessionControls = {
  stop: { visible: boolean; disabled: boolean };
  extend: { visible: boolean; disabled: boolean };
  restart: { visible: boolean };
};

/**
 * sessionControls decides which control actions a header offers.
 *
 * Stop and Extend act on the live session, so they need `controllable` (this
 * process's registry holds it) and an active state; a session already
 * `stopping` keeps them on screen but disabled so the reader sees the stop in
 * flight. Restart replays the start record through the host's RestartFunc and
 * never touches the old session, so it follows the API's `restartable` alone
 * — an interrupted run whose owner is gone is exactly the one worth
 * restarting, and no registry holds it.
 */
export function sessionControls(session: SessionInfo): SessionControls {
  const active = !isSessionTerminal(session.state);
  const live = session.controllable && active;
  const stopping = session.state === "stopping";
  return {
    stop: { visible: live, disabled: stopping },
    extend: { visible: live, disabled: stopping },
    restart: { visible: session.restartable && !active },
  };
}

/**
 * Where a store is, from only the parts the server sent: "in <file> on
 * <host>", "on <host>", "in <file>", or "on the <backend> store" when the
 * backend has neither (a kv store).
 */
export function formatSessionStoreLocation(store: SessionStoreLocation): string {
  const parts = [store.file && `in ${store.file}`, store.host && `on ${store.host}`].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : `on the ${store.backend} store`;
}

export function formatSessionDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / SECOND));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

/** "Stops in 5m 12s" before the deadline, "Deadline passed 30s ago" after it. */
export function formatSessionCountdown(stopAt: string, now: number): string {
  const deadline = Date.parse(stopAt);
  if (Number.isNaN(deadline)) throw new Error(`session stopAt is not a timestamp: ${stopAt}`);
  const remaining = deadline - now;
  return remaining >= 0
    ? `Stops in ${formatSessionDuration(remaining)}`
    : `Deadline passed ${formatSessionDuration(-remaining)} ago`;
}

export type SessionStateTone = "neutral" | "success" | "danger" | "warning" | "info";

export const SESSION_STATE_TONES: Record<SessionState, SessionStateTone> = {
  starting: "info",
  running: "info",
  stopping: "warning",
  completed: "success",
  stopped: "neutral",
  failed: "danger",
  interrupted: "warning",
};
