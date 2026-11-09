import { ActionError } from "../diagnostics/ActionError";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiArrowDown, UiLoader } from "../../icons";
import { Message, type MessageActionHandlers } from "./Message";
import type { ChatStatus, UIMessage } from "./types";

export type ConversationProps = MessageActionHandlers & {
  messages: UIMessage[];
  /** Current chat status; used for transient pending/error affordances. */
  status?: ChatStatus | undefined;
  /** Last request error from the chat transport, if any. */
  error?: Error | undefined;
  /** Clears the visible transport error. */
  onClearError?: (() => void) | undefined;
  /** Conversation/thread id, surfaced in the copyable error report. */
  sessionId?: string | undefined;
  /** Selected model id, surfaced in the copyable error report. */
  model?: string | undefined;
  /** Hide the waiting indicator because another control (e.g. an approval
   *  button) is already showing progress. */
  suppressWaiting?: boolean | undefined;
  /** Shown when there are no messages yet. */
  emptyState?: React.ReactNode;
  className?: string;
};

/** A scrollable message log that sticks to the bottom as new content streams
 *  in, unless the user has scrolled up — in which case a jump-to-bottom button
 *  appears. */
export function Conversation({
  messages,
  status,
  error,
  onClearError,
  sessionId,
  model,
  suppressWaiting,
  emptyState,
  className,
  ...actions
}: ConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const isWaiting =
    !suppressWaiting &&
    (status === "submitted" || (status === "streaming" && !hasVisibleAssistantResponse(messages)));
  const errorText = error?.message || (status === "error" ? "The assistant request failed." : undefined);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(distance < 32);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinned) {
      el.scrollTop = el.scrollHeight;
    }
  });

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        className={cn("flex-1 overflow-y-auto", className)}
      >
        {messages.length === 0 && emptyState ? (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
            {emptyState}
          </div>
        ) : (
          <div className="flex flex-col gap-8 p-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} {...actions} />
            ))}
            {isWaiting && <LoadingIndicator />}

          </div>
        )}

        {errorText && <ActionError
          error={error ?? errorText}
          context={[
            ...(sessionId ? [["Session", sessionId] as [string, string]] : []),
            ...(model ? [["Model", model] as [string, string]] : []),
          ]}
          actions={onClearError && <button type="button" onClick={onClearError}>Dismiss</button>}
          className="m-4"
        />}
      </div>

      {!pinned && messages.length > 0 && (
        <button
          type="button"
          aria-label="Scroll to latest"
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:text-foreground"
        >
          <Icon icon={UiArrowDown} className="size-4" />
        </button>
      )}
    </div>
  );
}

function hasVisibleAssistantResponse(messages: UIMessage[]) {
  const last = messages[messages.length - 1];
  if (last?.role !== "assistant") return false;
  return last.parts.some((part) => {
    if (part.type === "step-start") return false;
    if (part.type === "text" || part.type === "reasoning") return part.text.length > 0;
    return true;
  });
}

function LoadingIndicator() {
  return (
    <div className="flex w-full max-w-[95%] items-center gap-2 text-sm text-muted-foreground">
      <Icon icon={UiLoader} className="size-4 shrink-0 animate-spin" />
      <span>Waiting for response...</span>
    </div>
  );
}
