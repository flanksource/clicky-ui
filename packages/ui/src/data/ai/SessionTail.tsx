import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiLoader } from "../../icons";
import { isTerminalSessionLifecycle, useRemoteSession } from "./SessionInspector.remote";
import { SessionTailLine } from "./SessionTail.line";
import { TAIL_PAGE_SIZE, useSessionTail } from "./SessionTail.model";

export interface SessionTailProps {
  /** Captain session URL, e.g. `/api/captain/sessions/{id}`. */
  src: string;
  /** Follow the live stream (default true). When false the session is read
   *  once and no spinner is shown. */
  follow?: boolean;
  className?: string;
  /** Shown until the session has a text message or tool call. */
  emptyLabel?: string;
}

/** One line showing only the newest entry of a captain session: the latest
 *  assistant text or the latest tool call, with a spinner while following. */
export function SessionTail({ src, follow = true, className, emptyLabel }: SessionTailProps) {
  const { session, error } = useRemoteSession(src, { follow, pageSize: TAIL_PAGE_SIZE });
  const latest = useSessionTail(session);
  const following = follow && !isTerminalSessionLifecycle(session?.lifecycleStatus);

  return (
    <div
      data-session-tail
      className={cn("flex min-w-0 items-center gap-2 text-xs text-muted-foreground", className)}
    >
      <div className="min-w-0 flex-1">
        <SessionTailLine latest={latest} error={error} emptyLabel={emptyLabel} />
      </div>
      {following && (
        <span role="status" aria-label="Following session" className="shrink-0">
          <Icon icon={UiLoader} className="size-3.5 animate-spin" />
        </span>
      )}
    </div>
  );
}
