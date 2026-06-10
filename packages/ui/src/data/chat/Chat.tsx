import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatTransport, type UIMessage } from "ai";
import { cn } from "../../lib/utils";
import { Conversation } from "./Conversation";
import { PromptInput } from "./PromptInput";

export type ChatProps = {
  /** Endpoint that speaks the AI SDK v6 UI Message Stream protocol.
   *  Ignored when `transport` is supplied. Defaults to "/api/chat". */
  api?: string;
  /** Selected `provider/model` id, forwarded in the request body. */
  model?: string;
  /** Reasoning effort (`low` | `medium` | `high`), forwarded in the request body. */
  reasoningEffort?: string;
  /** Extra fields merged into every request body (e.g. tool scoping). */
  body?: Record<string, unknown>;
  /** Pre-built transport. Supply a mock in stories/tests; otherwise a
   *  DefaultChatTransport is constructed from `api`/`body`. */
  transport?: ChatTransport<UIMessage>;
  /** Initial messages to seed the conversation. */
  initialMessages?: UIMessage[];
  placeholder?: string;
  emptyState?: React.ReactNode;
  className?: string;
};

/** Self-contained AI chat: a streaming conversation log over a prompt input,
 *  driven by the AI SDK `useChat` hook against a v6-compatible `/api/chat`. The
 *  backend owns model selection and tool execution; `model`, `reasoningEffort`
 *  and `body` are forwarded in the request body for it to honor. */
export function Chat({
  api = "/api/chat",
  model,
  reasoningEffort,
  body,
  transport,
  initialMessages,
  placeholder,
  emptyState,
  className,
}: ChatProps) {
  const resolvedTransport = useMemo<ChatTransport<UIMessage>>(() => {
    if (transport) {
      return transport;
    }
    return new DefaultChatTransport({
      api,
      body: { ...body, ...(model ? { model } : {}), ...(reasoningEffort ? { reasoningEffort } : {}) },
    });
  }, [transport, api, body, model, reasoningEffort]);

  const { messages, sendMessage, status, stop } = useChat<UIMessage>({
    transport: resolvedTransport,
    ...(initialMessages ? { messages: initialMessages } : {}),
  });

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <Conversation messages={messages} emptyState={emptyState} />
      <div className="p-4 pt-0">
        <PromptInput
          status={status}
          onStop={() => void stop()}
          placeholder={placeholder}
          onSubmit={(text) => void sendMessage({ text })}
        />
      </div>
    </div>
  );
}
