import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import { UiChevronDown, UiChevronRight } from "../icons";

export type TreeGroupHeaderProps = {
  /** Header title. */
  title: ReactNode;
  /** Current expanded state. */
  open: boolean;
  /** Called when the header is clicked. */
  onToggle: () => void;
  /** Optional leading icon. */
  icon?: string | StaticIconComponent;
  /** Optional trailing count. */
  count?: number;
  /** Classes applied to the button. */
  className?: string;
};

export function TreeGroupHeader({
  title,
  open,
  onToggle,
  icon,
  count,
  className,
}: TreeGroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 border-b border-border select-none",
        "hover:bg-accent transition-colors text-left",
        className,
      )}
    >
      <Icon
        icon={open ? UiChevronDown : UiChevronRight}
        className="text-muted-foreground text-xs"
      />
      {icon && (
        <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} className="text-base" />
      )}
      <span className="font-medium text-sm flex-1 truncate">{title}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}
