import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export type FilterMode = "active" | "neutral" | "include" | "exclude";

export type FilterPillProps = {
  mode?: FilterMode;
  label: ReactNode;
  count?: number;
  icon?: string;
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
  title?: string;
  togglePosition?: "left" | "right";
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
    slot === "exclude"
      ? "bg-red-500/80"
      : slot === "include"
        ? "bg-green-500/80"
        : "bg-muted";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(nextTriStateMode(mode));
      }}
      className={cn(
        "relative inline-flex h-5 w-[52px] shrink-0 overflow-hidden rounded-full transition-colors duration-200",
        bg,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 z-20 flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150",
          SLOT_TRANSLATE[slot],
        )}
      >
        {slot !== "neutral" && (
          <Icon
            name={slot === "exclude" ? "codicon:close" : "codicon:check"}
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
      {icon && <Icon name={icon} className="text-sm" />}
      <span className="truncate">{label}</span>
    </>
  );

  if (triState) {
    const labelTone =
      mode === "include"
        ? "text-green-700 dark:text-green-400"
        : mode === "exclude"
          ? "text-red-700 dark:text-red-400"
          : "text-foreground";
    const control = <TristateSwitch mode={mode} onChange={onModeChange!} ariaLabel={title} />;
    const labelContent = (
      <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs", labelTone)}>
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
  if (mode === "include") return <Icon name="codicon:add" className="text-xs" />;
  if (mode === "exclude") return <Icon name="codicon:remove" className="text-xs" />;
  if (mode === "active") return <span className="w-2 h-2 rounded-full bg-current" />;
  return <span className="w-2 h-2 rounded-full bg-current opacity-30" />;
}

function nextTriStateMode(mode: FilterMode): FilterMode {
  if (mode === "include") return "exclude";
  if (mode === "exclude") return "neutral";
  return "include";
}

export type FilterPillGroupProps = {
  children: ReactNode;
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
