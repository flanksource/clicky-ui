import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiFile, UiGitBranch } from "../../icons";
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
  type ToolResultRenderer,
} from "./types";
import { forkSeedProvenance, isForkSeedMessage } from "./fork-seed";

/** Callbacks the conversation threads down to each message. */
export type MessageActionHandlers = {
  /** Re-generate the assistant message with the given id. */
  onRegenerate?: ((messageId: string) => void) | undefined;
  /** Respond to a tool approval request. */
  onApprove?:
    | ((approvalId: string, approved: boolean, reason?: string) => void)
    | undefined;
  /** Optional host renderer for recognized completed tool outputs. */
  renderToolResult?: ToolResultRenderer;
};

export type MessageProps = MessageActionHandlers & {
  message: UIMessage;
  className?: string;
};

/** Renders one chat message. User messages are right-aligned bubbles; assistant
 *  messages render text as markdown, reasoning and tool parts inline, file parts
 *  as thumbnails/chips, and a hover action row (copy / regenerate). */
export function Message({
  message,
  className,
  onRegenerate,
  onApprove,
  renderToolResult,
}: MessageProps) {
  if (isForkSeedMessage(message)) {
    return <ForkSeedMessage message={message} className={className} />;
  }
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
          isUser &&
            "rounded-lg bg-secondary px-4 py-3 text-secondary-foreground",
        )}
      >
        {message.parts.map((part, i) => (
          <MessagePart
            key={`${message.id}-${i}`}
            part={part}
            isUser={isUser}
            onApprove={onApprove}
            renderToolResult={renderToolResult}
          />
        ))}
      </div>

      {!isUser && text && (
        <MessageActions
          text={text}
          onRegenerate={
            onRegenerate ? () => onRegenerate(message.id) : undefined
          }
        />
      )}
    </div>
  );
}

function ForkSeedMessage({
  message,
  className,
}: {
  message: UIMessage;
  className?: string | undefined;
}) {
  const provenance = forkSeedProvenance(message);
  const transcript = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
  const label = provenance.title
    ? `Forked from ${provenance.title}`
    : "Forked from another conversation";
  return (
    <details
      className={cn(
        "group/fork max-w-full self-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground open:w-full open:rounded-lg",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 font-medium text-foreground/80">
        <Icon icon={UiGitBranch} className="size-3.5" />
        <span>{label}</span>
      </summary>
      {transcript && (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap border-t border-border pt-2 font-mono text-[11px] text-muted-foreground">
          {transcript}
        </pre>
      )}
    </details>
  );
}

function MessagePart({
  part,
  isUser,
  onApprove,
  renderToolResult,
}: {
  part: UIMessage["parts"][number];
  isUser: boolean;
  onApprove: MessageActionHandlers["onApprove"];
  renderToolResult: MessageActionHandlers["renderToolResult"];
}) {
  if (part.type === "text") {
    if (isUser) {
      return (
        <span className="whitespace-pre-wrap break-words">{part.text}</span>
      );
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
    return (
      <ToolCall
        part={part as AnyToolPart}
        onApprove={onApprove}
        {...(renderToolResult ? { renderToolResult } : {})}
      />
    );
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
      <span className="truncate">
        {part.filename ?? part.mediaType ?? "file"}
      </span>
    </a>
  );
}
