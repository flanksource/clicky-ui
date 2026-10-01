import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import type { BadgePolicy } from "./ToolPreferences.model";
import { ModeBadge } from "./ToolPreferencesList";

export function ToolDirectoryHeader({
  label,
  count,
  open,
  variant,
  mode,
  onToggle,
  onCycle,
}: {
  label: string;
  count: number;
  open: boolean;
  variant: "section" | "child";
  mode?: BadgePolicy | undefined;
  onToggle: () => void;
  /** Click-to-toggle policy for every tool under this directory. */
  onCycle?: (() => void) | undefined;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch">
      <button
        type="button"
        aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
        onClick={onToggle}
        className={cn(
          "flex shrink-0 items-center pl-2 text-muted-foreground hover:bg-muted",
          variant === "child" && "text-foreground/80 hover:bg-accent/50",
        )}
      >
        <Icon icon={open ? UiChevronDown : UiChevronRight} className="size-3" />
      </button>
      <button
        type="button"
        aria-label={onCycle ? `Toggle ${label} group` : `${label} ${count}`}
        title={onCycle ? `Cycle all ${count} tools in ${label}` : undefined}
        onClick={onCycle ?? onToggle}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1 pr-2 text-left text-muted-foreground hover:bg-muted",
          variant === "section"
            ? "py-1 text-[10px] font-semibold uppercase tracking-wider"
            : "py-1 text-[11px] font-medium text-foreground/80 hover:bg-accent/50",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="tabular-nums text-[10px] text-muted-foreground/70">
          {count}
        </span>
        {mode && <ModeBadge mode={mode} />}
      </button>
    </div>
  );
}
