import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";

export function ToolDirectoryHeader({
  label,
  count,
  open,
  variant,
  onToggle,
  onAdd,
}: {
  label: string;
  count: number;
  open: boolean;
  variant: "section" | "child";
  onToggle: () => void;
  onAdd?: (() => void) | undefined;
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
        <Icon
          icon={open ? UiChevronDown : UiChevronRight}
          className="size-3"
        />
      </button>
      <button
        type="button"
        aria-label={`${label} ${count}${onAdd ? " · Add strategy" : ""}`}
        title={onAdd ? `Add an Ask strategy for ${label}` : undefined}
        onClick={onAdd ?? onToggle}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1 pr-2 text-left text-muted-foreground hover:bg-muted",
          variant === "section"
            ? "py-1 text-[10px] font-semibold uppercase tracking-wider"
            : "py-1 text-[11px] font-medium text-foreground/80 hover:bg-accent/50",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {onAdd && (
          <span className="text-[9px] font-semibold normal-case tracking-normal text-muted-foreground/70">
            Add
          </span>
        )}
        <span className="tabular-nums text-[10px] text-muted-foreground/70">
          {count}
        </span>
      </button>
    </div>
  );
}
