import { useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiCopy, UiCheck, UiRefresh } from "../../icons";

export type MessageActionsProps = {
  /** Plain-text content of the message, copied to the clipboard. */
  text: string;
  /** Called to re-generate this assistant message. Omit to hide the control. */
  onRegenerate?: (() => void) | undefined;
  className?: string;
};

/** Hover actions for an assistant message: copy its text and (optionally)
 *  regenerate it. */
export function MessageActions({ text, onRegenerate, className }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("clicky-ui: copy to clipboard failed", err);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
        className,
      )}
    >
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy message"}
        onClick={copy}
        className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
      >
        <Icon icon={copied ? UiCheck : UiCopy} className={cn("size-3.5", copied && "text-emerald-600")} />
      </button>
      {onRegenerate && (
        <button
          type="button"
          aria-label="Regenerate response"
          onClick={onRegenerate}
          className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
        >
          <Icon icon={UiRefresh} className="size-3.5" />
        </button>
      )}
    </div>
  );
}
