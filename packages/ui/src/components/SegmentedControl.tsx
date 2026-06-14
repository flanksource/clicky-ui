import { useRef, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";

export type SegmentedSize = "sm" | "md";

export type SegmentedOption<T extends string = string> = {
  /** Stable value emitted on selection. */
  id: T;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon (imported `Ui*` component or runtime name). */
  icon?: string | StaticIconComponent;
  /** Native title attribute. */
  title?: string;
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
  /** Control size. `md` (default) matches form controls; `sm` is denser. */
  size?: SegmentedSize;
  /** Accessible group label. */
  "aria-label"?: string;
  /** Classes applied to the track. */
  className?: string;
};

const SIZE_CLASSES: Record<SegmentedSize, string> = {
  sm: "text-xs px-density-2 py-density-1 gap-1",
  md: "text-sm px-density-3 py-1.5 gap-1.5",
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
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      className={cn("inline-flex items-center rounded-md bg-muted p-0.5", className)}
    >
      {options.map((option, index) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            disabled={option.disabled}
            tabIndex={active ? 0 : -1}
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
              "inline-flex items-center whitespace-nowrap rounded-[5px] font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              SIZE_CLASSES[size],
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.icon && (
              <Icon
                {...(typeof option.icon === "string" ? { name: option.icon } : { icon: option.icon })}
              />
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
