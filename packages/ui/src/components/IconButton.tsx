import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Imported icon component to render. */
  icon: StaticIconComponent;
  /** Accessible name; drives both aria-label and the tooltip title. */
  label: string;
  /** Extra classes for the glyph (e.g. size). */
  iconClassName?: string;
};

/**
 * A borderless, background-free icon button: the hover effect is on the glyph
 * itself (color), not a surrounding chip. Distinct from `Button` (which is a
 * box-shaped control). Icons render with `currentColor`, so `hover:text-*`
 * recolors the glyph.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, iconClassName, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon icon={icon} className={cn("text-sm", iconClassName)} />
    </button>
  ),
);
IconButton.displayName = "IconButton";
