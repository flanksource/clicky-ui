import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiArrowDown, UiCheck, UiCircleX, UiCopy, UiLoader } from "../../icons";
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
  emptyState,
  className,
  ...actions
}: ConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const isWaiting = status === "submitted" || (status === "streaming" && !hasVisibleAssistantResponse(messages));
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
            {errorText && (
              <ErrorNotice
                message={errorText}
                error={error}
                sessionId={sessionId}
                model={model}
                onClear={onClearError}
              />
            )}
          </div>
        )}
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

type ErrorReport = {
  message: string;
  error?: Error | undefined;
  sessionId?: string | undefined;
  model?: string | undefined;
};

/** Assembles a support-ready plain-text report: the error, the session/model
 *  that produced it, the page, and the full stack/cause — everything needed to
 *  file or triage the failure without a back-and-forth. */
function buildErrorReport({ message, error, sessionId, model }: ErrorReport): string {
  const lines = [`Error: ${message}`];
  if (error?.name && error.name !== "Error") lines.push(`Type: ${error.name}`);
  if (sessionId) lines.push(`Session: ${sessionId}`);
  if (model) lines.push(`Model: ${model}`);
  if (typeof window !== "undefined") lines.push(`Page: ${window.location.href}`);
  if (typeof navigator !== "undefined" && navigator.userAgent) lines.push(`User agent: ${navigator.userAgent}`);
  lines.push(`Time: ${new Date().toISOString()}`);
  const cause = (error as { cause?: unknown } | undefined)?.cause;
  const detail = error?.stack ?? (cause != null ? String(cause) : "");
  if (detail.trim() && detail.trim() !== message) lines.push("", detail.trim());
  return lines.join("\n");
}

function ErrorNotice({ message, error, sessionId, model, onClear }: ErrorReport & { onClear?: (() => void) | undefined }) {
  const [copied, setCopied] = useState(false);
  const copyReport = () => {
    const clip = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    if (!clip) return;
    void clip
      .writeText(buildErrorReport({ message, error, sessionId, model }))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  return (
    <div
      role="alert"
      className="flex w-full max-w-[95%] items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <Icon icon={UiCircleX} className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 whitespace-pre-wrap break-words">{message}</div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Copy error details"
          title="Copy session id, model, page and full error"
          className="inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
          onClick={copyReport}
        >
          <Icon icon={copied ? UiCheck : UiCopy} className="size-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
        {onClear && (
          <button type="button" className="text-xs underline-offset-2 hover:underline" onClick={onClear}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
