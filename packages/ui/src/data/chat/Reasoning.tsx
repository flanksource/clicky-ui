import { useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiBrain, UiChevronDown } from "../../icons";

export type ReasoningProps = {
  /** The model's reasoning / "thinking" text. */
  text: string;
  /** Whether the block starts expanded. Defaults to false. */
  defaultOpen?: boolean;
  className?: string;
};

/** A collapsible block that shows the model's reasoning ("thinking") trace,
 *  kept out of the way of the answer by default. */
export function Reasoning({ text, defaultOpen = false, className }: ReasoningProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (!text) return null;

  return (
    <div className={cn("not-prose w-full", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Icon icon={UiBrain} className="size-3 shrink-0" />
        <span>Reasoning</span>
        <Icon
          icon={UiChevronDown}
          className={cn("size-3 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="mt-1 border-l-2 border-border pl-3 text-xs italic text-muted-foreground">
          <p className="whitespace-pre-wrap break-words">{text}</p>
        </div>
      )}
    </div>
  );
}
