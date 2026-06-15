import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";

/** Visual style: a filled `pill` (default) or an `underline` tab. */
export type TabButtonVariant = "pill" | "underline";

export type TabButtonProps = {
  /** Current selected state. */
  active: boolean;
  /** Called when the tab is clicked. */
  onClick: () => void;
  /** Visible tab label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: string | StaticIconComponent;
  /** Optional count badge. Hidden when zero. */
  count?: number;
  /** Classes for the count badge background. */
  countColor?: string;
  /** Visual style. Defaults to `pill`. */
  variant?: TabButtonVariant;
  /** Classes applied to the button. */
  className?: string;
};

const variantClasses: Record<TabButtonVariant, { base: string; active: string; inactive: string }> =
  {
    pill: {
      base: "rounded-md",
      active: "bg-primary text-primary-foreground",
      inactive: "text-muted-foreground hover:bg-accent hover:text-foreground",
    },
    underline: {
      base: "rounded-none border-b-2 -mb-px",
      active: "border-primary text-foreground font-medium",
      inactive: "border-transparent text-muted-foreground hover:text-foreground",
    },
  };

export function TabButton({
  active,
  onClick,
  label,
  icon,
  count,
  countColor = "bg-muted-foreground",
  variant = "pill",
  className,
}: TabButtonProps) {
  const v = variantClasses[variant];
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-density-3 py-density-1.5 text-sm transition-colors",
        v.base,
        active ? v.active : v.inactive,
        className,
      )}
    >
      {icon && <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />}
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
