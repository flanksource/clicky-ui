import { UiQuestion } from "../icons";
import { cn } from "../lib/utils";
import { HoverCard, type HoverCardPlacement } from "./HoverCard";

export type HelpTipProps = {
  /** Name of the thing explained; the button is announced as "Help for {label}". */
  label: string;
  /** Explanation shown on hover or focus. */
  help: string;
  placement?: HoverCardPlacement;
  className?: string;
};

/** A (?) button that explains a field or value in a hover card. */
export function HelpTip({ label, help, placement = "top", className }: HelpTipProps) {
  return (
    <HoverCard
      placement={placement}
      delay={250}
      className={cn("inline-flex", className)}
      cardClassName="max-w-xs whitespace-normal text-xs leading-relaxed"
      trigger={
        <button
          type="button"
          aria-label={`Help for ${label}`}
          className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UiQuestion size="0.75rem" />
        </button>
      }
    >
      {help}
    </HoverCard>
  );
}
