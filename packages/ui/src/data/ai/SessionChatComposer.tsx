import type { ReactNode } from "react";
import { PromptInput } from "../chat/PromptInput";

export type SessionChatCapabilities = {
  interrupt: boolean;
  steer: boolean;
  followUp: boolean;
  resume: boolean;
};

export type SessionChatQueuedMessage = {
  messageId: string;
  text: string;
};

export type SessionChatComposerProps = {
  status: "starting" | "running" | "interrupting" | "idle" | "stopping";
  capabilities: SessionChatCapabilities;
  queued?: SessionChatQueuedMessage[];
  error?: string;
  onSubmit: (text: string) => void;
  onInterrupt?: () => void;
  toolbar?: ReactNode;
  inputAccessory?: ReactNode;
  className?: string;
};

export function SessionChatComposer({
  status,
  capabilities,
  queued = [],
  error,
  onSubmit,
  onInterrupt,
  toolbar,
  inputAccessory,
  className,
}: SessionChatComposerProps) {
  const active = status === "running" || status === "interrupting";
  const canSubmitWhileActive = capabilities.steer || capabilities.followUp;
  const disabled =
    status === "starting" ||
    status === "interrupting" ||
    status === "stopping" ||
    (status === "running" && !canSubmitWhileActive);

  return (
    <div className={className}>
      {queued.length > 0 && (
        <div
          className="mb-density-2 flex flex-wrap gap-density-1"
          aria-label="Queued messages"
        >
          {queued.map((message) => (
            <span
              key={message.messageId}
              className="max-w-full truncate rounded-full border border-border bg-muted px-density-2 py-1 text-xs text-muted-foreground"
            >
              Queued: {message.text}
            </span>
          ))}
        </div>
      )}
      {error && (
        <div className="mb-density-2 text-xs text-destructive">{error}</div>
      )}
      <PromptInput
        status={active ? "streaming" : "ready"}
        disabled={disabled}
        allowSubmitWhileStreaming={canSubmitWhileActive}
        stopLabel="Interrupt"
        placeholder={
          status === "idle" ? "Continue this session…" : "Add a follow-up…"
        }
        onSubmit={(text) => onSubmit(text)}
        {...(inputAccessory ? { inputAccessory } : {})}
        {...(toolbar ? { toolbar } : {})}
        {...(capabilities.interrupt && status === "running" && onInterrupt
          ? { onStop: onInterrupt }
          : {})}
      />
    </div>
  );
}
