import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiFile } from "../../icons";
import { Markdown } from "../Markdown";
import { ToolCall } from "./ToolCall";
import { MessageActions } from "./MessageActions";
import { Reasoning } from "./Reasoning";
import type { UIMessage, FileUIPart } from "./types";
import {
  isDynamicToolPart,
  isTypedToolPart,
  isReasoningPart,
  isFilePart,
  type AnyToolPart,
} from "./types";

/** Callbacks the conversation threads down to each message. */
export type MessageActionHandlers = {
  /** Re-generate the assistant message with the given id. */
  onRegenerate?: ((messageId: string) => void) | undefined;
  /** Respond to a tool approval request. */
  onApprove?: ((approvalId: string, approved: boolean, reason?: string) => void) | undefined;
};

export type MessageProps = MessageActionHandlers & {
  message: UIMessage;
  className?: string;
};

/** Renders one chat message. User messages are right-aligned bubbles; assistant
 *  messages render text as markdown, reasoning and tool parts inline, file parts
 *  as thumbnails/chips, and a hover action row (copy / regenerate). */
export function Message({ message, className, onRegenerate, onApprove }: MessageProps) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("");

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
          <MessagePart
            key={`${message.id}-${i}`}
            part={part}
            isUser={isUser}
            onApprove={onApprove}
          />
        ))}
      </div>

      {!isUser && text && (
        <MessageActions
          text={text}
          onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
        />
      )}
    </div>
  );
}

function MessagePart({
  part,
  isUser,
  onApprove,
}: {
  part: UIMessage["parts"][number];
  isUser: boolean;
  onApprove: MessageActionHandlers["onApprove"];
}) {
  if (part.type === "text") {
    if (isUser) {
      return <span className="whitespace-pre-wrap break-words">{part.text}</span>;
    }
    return <Markdown text={part.text} />;
  }
  if (isReasoningPart(part)) {
    return <Reasoning text={part.text} />;
  }
  if (isFilePart(part)) {
    return <FilePart part={part} />;
  }
  if (isDynamicToolPart(part) || isTypedToolPart(part)) {
    return <ToolCall part={part as AnyToolPart} onApprove={onApprove} />;
  }
  return null;
}

/** Renders an attachment: images inline as a thumbnail, everything else as a
 *  labelled file chip. */
function FilePart({ part }: { part: FileUIPart }) {
  const isImage = part.mediaType?.startsWith("image/");
  if (isImage && part.url) {
    return (
      <img
        src={part.url}
        alt={part.filename ?? "attachment"}
        className="max-h-48 max-w-full rounded-md border border-border"
      />
    );
  }
  return (
    <a
      href={part.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
    >
      <Icon icon={UiFile} className="size-3.5 shrink-0" />
      <span className="truncate">{part.filename ?? part.mediaType ?? "file"}</span>
    </a>
  );
}
