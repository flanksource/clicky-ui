import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import { CodiconChevronDownIcon, CodiconChevronRightIcon } from "./static-icons";

export type TreeGroupHeaderProps = {
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  icon?: string | StaticIconComponent;
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
        icon={open ? CodiconChevronDownIcon : CodiconChevronRightIcon}
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
