import { formatRelativeTime } from "../cells/timestamp-format";

/** One agent session a picker can choose. Only `id` is required. */
export interface SessionPickerSession {
  id: string;
  title?: string;
  provider?: string;
  model?: string;
  /** Working directory; its last segment is shown. */
  cwd?: string;
  /** Live status such as `active`, `sleeping` or `ended`. */
  status?: string;
  /** ISO timestamp of the last activity. */
  updatedAt?: string;
  costUsd?: number;
  /** How much of the model's context window the session fills. */
  context?: { usedTokens: number; windowTokens: number };
}

export type SessionPickerLoader = (request: { signal: AbortSignal }) => Promise<readonly SessionPickerSession[]>;

export const sessionPickerTitle = (session: SessionPickerSession) => session.title?.trim() || session.id.slice(0, 12);

/** The metadata line under a session: status, folder, context use, cost and age. */
export function sessionPickerDescription(session: SessionPickerSession, now: Date = new Date()): string {
  const folder = session.cwd?.split("/").filter(Boolean).at(-1);
  const context = session.context && session.context.windowTokens > 0
    ? `${Math.round((session.context.usedTokens / session.context.windowTokens) * 100)}% context`
    : undefined;
  const cost = session.costUsd !== undefined && session.costUsd > 0 ? `$${session.costUsd.toFixed(2)}` : undefined;
  const updated = session.updatedAt ? formatRelativeTime(new Date(session.updatedAt), now) : undefined;
  return [session.status, folder, context, cost, updated].filter(Boolean).join(" · ");
}
