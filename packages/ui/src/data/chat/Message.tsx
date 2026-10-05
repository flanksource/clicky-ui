import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiGitBranch } from "../../icons";
import { Markdown } from "../Markdown";
import { ToolCall } from "./ToolCall";
import { MessageActions } from "./MessageActions";
import { Reasoning } from "./Reasoning";
import type { UIMessage } from "./types";
import {
  isDynamicToolPart,
  isTypedToolPart,
  isReasoningPart,
  isFilePart,
  toolPartParentId,
  type AnyToolPart,
  type ToolResultRenderer,
} from "./types";
import { forkSeedProvenance, isForkSeedMessage } from "./fork-seed";
import { MessageFilePart } from "./MessageFilePart";

/** Callbacks the conversation threads down to each message. */
export type MessageActionHandlers = {
  /** Re-generate the assistant message with the given id. */
  onRegenerate?: ((messageId: string) => void) | undefined;
  /** Respond to a tool approval request. */
  onApprove?:
    | ((approvalId: string, approved: boolean, reason?: string) => void | Promise<unknown>)
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
  const { subcalls, nested } = groupSubagentCalls(message.parts);

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
        {message.parts.map((part, i) =>
          nested.has(part) ? null : (
            <MessagePart
              key={`${message.id}-${i}`}
              part={part}
              isUser={isUser}
              onApprove={onApprove}
              renderToolResult={renderToolResult}
              subcalls={isToolPart(part) ? subcalls.get(part.toolCallId) : undefined}
              subcallsByParent={subcalls}
            />
          ),
        )}
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

type MessagePartValue = UIMessage["parts"][number];

function isToolPart(part: MessagePartValue): part is AnyToolPart {
  return isDynamicToolPart(part) || isTypedToolPart(part);
}

/** Groups a subagent's tool calls under the call that spawned it. A call whose
 *  parent is not in this message (e.g. a resumed turn) stays top-level. */
function groupSubagentCalls(parts: UIMessage["parts"]) {
  const callIds = new Set(
    parts.filter(isToolPart).map((part) => part.toolCallId),
  );
  const subcalls = new Map<string, AnyToolPart[]>();
  const nested = new Set<MessagePartValue>();
  for (const part of parts) {
    if (!isToolPart(part)) continue;
    const parent = toolPartParentId(part);
    if (!parent || !callIds.has(parent)) continue;
    subcalls.set(parent, [...(subcalls.get(parent) ?? []), part]);
    nested.add(part);
  }
  return { subcalls, nested };
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
  subcalls,
  subcallsByParent,
}: {
  part: MessagePartValue;
  isUser: boolean;
  onApprove: MessageActionHandlers["onApprove"];
  renderToolResult: MessageActionHandlers["renderToolResult"];
  subcalls: AnyToolPart[] | undefined;
  subcallsByParent: ReadonlyMap<string, AnyToolPart[]>;
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
    return <MessageFilePart part={part} />;
  }
  if (isToolPart(part)) {
    return (
      <ToolCall
        part={part}
        onApprove={onApprove}
        subcalls={subcalls}
        subcallsByParent={subcallsByParent}
        {...(renderToolResult ? { renderToolResult } : {})}
      />
    );
  }
  return null;
}
