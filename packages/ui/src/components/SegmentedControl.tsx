import { useId, useRef, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";

export type SegmentedSize = "sm" | "md" | "lg";

export type SegmentedOption<T extends string = string> = {
  /** Stable value emitted on selection. */
  id: T;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon (imported `Ui*` component or runtime name). */
  icon?: string | StaticIconComponent;
  /** Classes applied to the leading icon. */
  iconClassName?: string;
  /** Classes applied to this segment only while selected. */
  activeClassName?: string;
  /** Optional secondary line, used by larger card-like segmented controls. */
  description?: ReactNode;
  /** Native title attribute. */
  title?: string;
  /**
   * Short muted tag rendered after the label (e.g. "default"). It is exposed to
   * assistive tech as the segment's accessible description, not its name.
   */
  marker?: string;
  /**
   * Render this segment as the implied choice while no option is selected (e.g.
   * a schema default the value has not been set to). It is outlined, not
   * filled, and stays `aria-checked=false` because nothing is selected.
   */
  implied?: boolean;
  /** Disable this segment. */
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string = string> = {
  /** Currently selected option id. */
  value: T;
  /** Mutually-exclusive options rendered left to right. */
  options: SegmentedOption<T>[];
  /** Called with the newly selected id. */
  onChange: (id: T) => void;
  /** Control size. `md` (default) matches form controls; `sm` is denser and `lg` is card-like. */
  size?: SegmentedSize;
  /** Allows segments to wrap instead of overflowing horizontally. */
  wrap?: boolean;
  /** Accessible group label. */
  "aria-label"?: string;
  /** Classes applied to the track. */
  className?: string;
};

const SIZE_CLASSES: Record<SegmentedSize, string> = {
  sm: "text-xs px-density-2 py-density-1 gap-1",
  md: "h-full px-control-px text-sm gap-1.5",
  lg: "min-h-[4.25rem] min-w-44 flex-1 px-density-3 py-density-3 gap-density-2 text-sm",
};

/**
 * Single-select toggle group (the Gavel `Segmented` "Mine / All / Bots"
 * pattern). A muted track holds mutually-exclusive segments; the active
 * segment lifts onto the card surface. Built on clicky tokens so it inherits
 * dark-mode and density. Use for small, flat choice sets — reach for `Select`
 * when the option count grows.
 */
export function SegmentedControl<T extends string = string>({
  value,
  options,
  onChange,
  size = "md",
  wrap = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const markerIdBase = useId();
  const hasSelection = options.some((option) => option.id === value);

  const move = (from: number, dir: 1 | -1) => {
    const n = options.length;
    let i = from;
    for (let step = 0; step < n; step++) {
      i = (i + dir + n) % n;
      const opt = options[i];
      if (opt && !opt.disabled) {
        onChange(opt.id);
        btnRefs.current[i]?.focus();
        return;
      }
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-md bg-muted p-0.5",
        size === "md" && "h-control-h",
        size === "lg" && "gap-density-2 bg-transparent p-0",
        wrap && "flex-wrap",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.id === value;
        const implied = !hasSelection && option.implied === true;
        const markerId = option.marker ? `${markerIdBase}-marker-${index}` : undefined;
        return (
          <button
            key={option.id}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-describedby={markerId}
            data-implied={implied ? "true" : undefined}
            title={option.title}
            disabled={option.disabled}
            tabIndex={active || implied ? 0 : -1}
            onClick={() => !option.disabled && onChange(option.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(index, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(index, -1);
              }
            }}
            className={cn(
              "inline-flex items-center rounded-[5px] border border-transparent font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              size === "lg" && "rounded-lg text-left",
              option.description ? "whitespace-normal" : "whitespace-nowrap",
              SIZE_CLASSES[size],
              active
                ? size === "lg"
                  ? "border-primary/70 bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/25"
                  : "border-border bg-card text-foreground shadow-sm"
                : implied
                  ? size === "lg"
                    ? "border-dashed border-primary/60 bg-card text-foreground hover:shadow-sm"
                    : "border-dashed border-primary/60 text-foreground hover:bg-background/60"
                  : size === "lg"
                    ? "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:bg-card hover:text-foreground hover:shadow-sm"
                    : "text-muted-foreground hover:border-border hover:bg-background/60 hover:text-foreground",
              active && option.activeClassName,
            )}
          >
            {option.icon && (
              <Icon
                {...(typeof option.icon === "string"
                  ? { name: option.icon }
                  : { icon: option.icon })}
                className={cn(
                  size === "lg" ? "size-4 shrink-0" : "size-3.5 shrink-0",
                  size === "lg" &&
                    (active ? "text-primary" : "text-muted-foreground"),
                  option.iconClassName,
                )}
              />
            )}
            <span
              className={cn(
                "min-w-0",
                size === "lg" &&
                  "flex flex-col items-start text-left leading-tight",
              )}
            >
              {option.marker ? (
                <span className="inline-flex min-w-0 max-w-full items-baseline gap-1">
                  <span className="min-w-0 truncate">{option.label}</span>
                  <span
                    id={markerId}
                    aria-hidden="true"
                    className="shrink-0 text-[11px] font-normal opacity-70"
                  >
                    {option.marker}
                  </span>
                </span>
              ) : (
                <span className="min-w-0 truncate">{option.label}</span>
              )}
              {option.description && (
                <span
                  className={cn(
                    "mt-0.5 max-w-56 whitespace-normal break-words text-[11px] font-normal leading-snug",
                    active
                      ? "text-muted-foreground"
                      : "text-muted-foreground/80",
                  )}
                >
                  {option.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
