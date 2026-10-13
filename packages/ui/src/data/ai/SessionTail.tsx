import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiLoader, UiSparkles } from "../../icons";
import { CATEGORY_ICONS, classifyToolCategory } from "./session-categories";
import { isTerminalSessionLifecycle, useRemoteSession } from "./SessionInspector.remote";
import { normalizeMessages, type SessionEvent } from "./SessionViewer.model";
import { summarizeToolInput } from "./SessionViewer.input";

/** Messages read for the first load: enough to reach past a run of reasoning
 *  or empty messages to the latest text or tool call. */
const TAIL_PAGE_SIZE = 20;

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

/** The newest assistant text or tool call; reasoning, user, system and error
 *  rows are not part of the tail. */
function latestTailEvent(events: SessionEvent[]): SessionEvent | undefined {
  return events.findLast(
    (event) => event.kind === "tool" || (event.kind === "assistant" && Boolean(event.text)),
  );
}

function ToolLine({ event }: { event: SessionEvent }) {
  const tool = event.tool ?? "";
  const summary = summarizeToolInput(tool, event.toolInput, event.cwd);
  const category = classifyToolCategory(tool, event.toolInput);
  return (
    <span
      data-testid="session-tail-tool"
      title={summary ? `${tool} ${summary}` : tool}
      className="flex min-w-0 items-center gap-1.5"
    >
      <Icon icon={CATEGORY_ICONS[category]} className="size-3.5 shrink-0" />
      <span className="shrink-0 font-medium text-foreground">{tool}</span>
      {summary && <span className="min-w-0 truncate font-mono">{summary}</span>}
    </span>
  );
}

function TextLine({ text }: { text: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icon icon={UiSparkles} className="size-3.5 shrink-0" />
      <span data-testid="session-tail-text" title={text} className="min-w-0 truncate">
        {text}
      </span>
    </span>
  );
}

/** One line showing only the newest entry of a captain session: the latest
 *  assistant text or the latest tool call, with a spinner while following. */
export function SessionTail({ src, follow = true, className, emptyLabel }: SessionTailProps) {
  const { session, error } = useRemoteSession(src, { follow, pageSize: TAIL_PAGE_SIZE });
  const latest = useMemo(
    () => (session ? latestTailEvent(normalizeMessages(session.messages ?? [])) : undefined),
    [session],
  );
  const following = follow && !isTerminalSessionLifecycle(session?.lifecycleStatus);

  return (
    <div
      data-session-tail
      className={cn("flex min-w-0 items-center gap-2 text-xs text-muted-foreground", className)}
    >
      <div className="min-w-0 flex-1">
        {error !== undefined ? (
          <span role="alert" title={error} className="block truncate text-destructive">
            {error}
          </span>
        ) : latest?.kind === "tool" ? (
          <ToolLine event={latest} />
        ) : latest?.text ? (
          <TextLine text={latest.text} />
        ) : (
          emptyLabel !== undefined && <span className="block truncate">{emptyLabel}</span>
        )}
      </div>
      {following && (
        <span role="status" aria-label="Following session" className="shrink-0">
          <Icon icon={UiLoader} className="size-3.5 animate-spin" />
        </span>
      )}
    </div>
  );
}
