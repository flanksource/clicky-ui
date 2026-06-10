import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import { UiAdd, UiCheck, UiClose, UiRemove } from "../icons";

export type FilterMode = "active" | "neutral" | "include" | "exclude";

export type FilterPillProps = {
  /** Visual and semantic state for the pill. */
  mode?: FilterMode;
  /** Primary visible label. */
  label: ReactNode;
  /** Optional count badge rendered before the label. */
  count?: number;
  /** Iconify name or imported icon component. */
  icon?: string | StaticIconComponent;
  /** Classes for the count badge background. */
  badge?: string;
  /**
   * Tri-state handler. When provided the pill renders as a toggle with a left
   * minus (exclude) and right plus (include) region. Clicking a side toggles
   * that state against "neutral"; clicking the label cycles neutral → include
   * → exclude → neutral.
   */
  onModeChange?: (next: FilterMode) => void;
  /** Legacy single-click handler, used when onModeChange is not provided. */
  onClick?: () => void;
  /** Browser tooltip and accessible label for tri-state controls. */
  title?: string;
  /** Places the tri-state toggle before or after the label. */
  togglePosition?: "left" | "right";
  /** Classes applied to the pill root. */
  className?: string;
};

function bodyClasses(mode: FilterMode): string {
  switch (mode) {
    case "active":
      return "bg-primary/10 border-primary/40 text-primary font-medium";
    case "include":
      return "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 font-medium";
    case "exclude":
      return "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 font-medium";
    case "neutral":
    default:
      return "border-border text-muted-foreground hover:bg-accent";
  }
}

type SlotMode = "exclude" | "neutral" | "include";

const SLOT_TRANSLATE: Record<SlotMode, string> = {
  exclude: "translate-x-0",
  neutral: "translate-x-4",
  include: "translate-x-8",
};

function TristateSwitch({
  mode,
  onChange,
  ariaLabel,
}: {
  mode: FilterMode;
  onChange: (next: FilterMode) => void;
  ariaLabel?: string;
}) {
  const slot: SlotMode =
    mode === "exclude" ? "exclude" : mode === "include" ? "include" : "neutral";
  const bg =
    slot === "exclude" ? "bg-red-500/80" : slot === "include" ? "bg-green-500/80" : "bg-muted";

  // The three regions are aria-hidden click targets layered over the toggle
  // track: clicking the left edge toggles exclude, the right edge toggles
  // include, and the middle rotates. They are NOT focusable buttons — the
  // whole switch is a single <button> so it exposes one accessible name and
  // does not pollute the accessible name of any FilterBar wrapper that hosts
  // it (e.g. the multi-filter option row, which is itself a role="button").
  const region = (next: FilterMode, regionMode: SlotMode) => (
    <span
      aria-hidden
      data-tristate-region={regionMode}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(next);
      }}
      className="relative z-10 h-full flex-1 cursor-pointer"
    />
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={(event) => {
        // Keyboard activation (Enter/Space) lands here without a region —
        // cycle, matching the middle-region rotation.
        event.preventDefault();
        event.stopPropagation();
        onChange(nextTriStateMode(mode));
      }}
      className={cn(
        "relative inline-flex h-5 w-[52px] shrink-0 overflow-hidden rounded-full transition-colors duration-200",
        bg,
      )}
    >
      {region(mode === "exclude" ? "neutral" : "exclude", "exclude")}
      {region(nextTriStateMode(mode), "neutral")}
      {region(mode === "include" ? "neutral" : "include", "include")}
      <span
        aria-hidden
        className={cn(
          // The knob stays white in BOTH themes (standard switch look): on the
          // dark-mode muted/red/green tracks white is the high-contrast choice,
          // while bg-background would vanish against the track.
          "pointer-events-none absolute left-0.5 top-0.5 z-20 flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150",
          SLOT_TRANSLATE[slot],
        )}
      >
        {slot !== "neutral" && (
          <Icon
            icon={slot === "exclude" ? UiClose : UiCheck}
            className={cn(
              "text-[10px]",
              slot === "exclude" && "text-red-600",
              slot === "include" && "text-green-600",
            )}
          />
        )}
      </span>
    </button>
  );
}

export function FilterPill({
  mode = "neutral",
  label,
  count,
  icon,
  badge,
  onModeChange,
  onClick,
  title,
  togglePosition = "left",
  className,
}: FilterPillProps) {
  const triState = !!onModeChange;
  const content = (
    <>
      {count !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold text-white",
            badge ?? "bg-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
      {icon && (
        <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} className="text-sm" />
      )}
      <span className="truncate">{label}</span>
    </>
  );

  if (triState) {
    const control = (
      <TristateSwitch
        mode={mode}
        onChange={onModeChange!}
        {...(title ? { ariaLabel: title } : {})}
      />
    );
    const labelContent = (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-foreground">
        {content}
      </span>
    );

    return (
      <span className={cn("inline-flex items-center gap-1.5 select-none", className)} title={title}>
        {togglePosition === "right" ? (
          <>
            {labelContent}
            {control}
          </>
        ) : (
          <>
            {control}
            {labelContent}
          </>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border transition-colors",
        bodyClasses(mode),
        className,
      )}
    >
      <LegacyMarker mode={mode} />
      {content}
    </button>
  );
}

function LegacyMarker({ mode }: { mode: FilterMode }) {
  if (mode === "include") return <Icon icon={UiAdd} className="text-xs" />;
  if (mode === "exclude") return <Icon icon={UiRemove} className="text-xs" />;
  if (mode === "active") return <span className="w-2 h-2 rounded-full bg-current" />;
  return <span className="w-2 h-2 rounded-full bg-current opacity-30" />;
}

function nextTriStateMode(mode: FilterMode): FilterMode {
  if (mode === "include") return "exclude";
  if (mode === "exclude") return "neutral";
  return "include";
}

export type FilterPillGroupProps = {
  /** Filter pills or separators to lay out. */
  children: ReactNode;
  /** Classes applied to the wrapping row. */
  className?: string;
};

export function FilterPillGroup({ children, className }: FilterPillGroupProps) {
  return <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>{children}</div>;
}

export function FilterSeparator() {
  return (
    <span aria-hidden className="text-border mx-0.5">
      |
    </span>
  );
}
