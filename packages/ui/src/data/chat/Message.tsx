import { cn } from "../../lib/utils";
import { Markdown } from "../Markdown";
import { ToolCall } from "./ToolCall";
import type { UIMessage } from "./types";
import { isDynamicToolPart, isTypedToolPart, type AnyToolPart } from "./types";

export type MessageProps = {
  message: UIMessage;
  className?: string;
};

/** Renders one chat message. User messages are right-aligned bubbles; assistant
 *  messages render text parts as markdown and tool parts as collapsible tool
 *  calls, in document order. */
export function Message({ message, className }: MessageProps) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "group flex w-full max-w-[95%] flex-col gap-2",
        isUser ? "ml-auto items-end" : "items-start",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm",
          isUser && "rounded-lg bg-secondary px-4 py-3 text-secondary-foreground",
        )}
      >
        {message.parts.map((part, i) => (
          <MessagePart key={`${message.id}-${i}`} part={part} isUser={isUser} />
        ))}
      </div>
    </div>
  );
}

function MessagePart({ part, isUser }: { part: UIMessage["parts"][number]; isUser: boolean }) {
  if (part.type === "text") {
    if (isUser) {
      return <span className="whitespace-pre-wrap break-words">{part.text}</span>;
    }
    return <Markdown text={part.text} />;
  }
  if (isDynamicToolPart(part) || isTypedToolPart(part)) {
    return <ToolCall part={part as AnyToolPart} />;
  }
  return null;
}
