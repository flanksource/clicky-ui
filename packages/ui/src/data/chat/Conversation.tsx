import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Message } from "./Message";
import type { UIMessage } from "./types";

export type ConversationProps = {
  messages: UIMessage[];
  /** Shown when there are no messages yet. */
  emptyState?: React.ReactNode;
  className?: string;
};

/** A scrollable message log that sticks to the bottom as new content streams
 *  in, unless the user has scrolled up. */
export function Conversation({ messages, emptyState, className }: ConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedRef.current = distance < 32;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinnedRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  });

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      role="log"
      className={cn("relative flex-1 overflow-y-auto", className)}
    >
      {messages.length === 0 && emptyState ? (
        <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
          {emptyState}
        </div>
      ) : (
        <div className="flex flex-col gap-8 p-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
