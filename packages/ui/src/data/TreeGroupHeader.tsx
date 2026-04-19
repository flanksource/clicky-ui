import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export type TreeGroupHeaderProps = {
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  icon?: string;
  count?: number;
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
        name={open ? "codicon:chevron-down" : "codicon:chevron-right"}
        className="text-muted-foreground text-xs"
      />
      {icon && <Icon name={icon} className="text-base" />}
      <span className="font-medium text-sm flex-1 truncate">{title}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}
