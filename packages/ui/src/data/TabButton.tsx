import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  label: ReactNode;
  icon?: string;
  count?: number;
  countColor?: string;
  className?: string;
};

export function TabButton({
  active,
  onClick,
  label,
  icon,
  count,
  countColor = "bg-muted-foreground",
  className,
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-density-3 py-density-1.5 text-sm rounded-md transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {icon && <Icon name={icon} />}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white",
            countColor,
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
