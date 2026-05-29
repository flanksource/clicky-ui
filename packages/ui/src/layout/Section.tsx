import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown, UiChevronRight } from "@flanksource/icons/ui";

export type SectionProps = {
  title: ReactNode;
  summary?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  icon?: string | StaticIconComponent;
  tone?: "default" | "danger" | "warning" | "success" | "info";
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
};

const toneRing: Record<NonNullable<SectionProps["tone"]>, string> = {
  default: "",
  danger: "border-l-2 border-red-500",
  warning: "border-l-2 border-yellow-500",
  success: "border-l-2 border-green-500",
  info: "border-l-2 border-blue-500",
};

export function Section({
  title,
  summary,
  defaultOpen = false,
  open: openProp,
  onToggle,
  icon,
  tone = "default",
  className,
  headerClassName,
  bodyClassName,
  children,
}: SectionProps) {
  const isControlled = openProp !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : innerOpen;

  function toggle() {
    const next = !open;
    if (!isControlled) setInnerOpen(next);
    onToggle?.(next);
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background",
        toneRing[tone],
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-2 px-density-3 py-density-2 text-left",
          "hover:bg-accent/50 transition-colors",
          headerClassName,
        )}
      >
        <Icon
          icon={open ? UiChevronDown : UiChevronRight}
          className="text-muted-foreground text-xs"
        />
        {icon && (
          <Icon
            {...(typeof icon === "string" ? { name: icon } : { icon })}
            className="text-base"
          />
        )}
        <span className="font-medium text-sm flex-1 truncate">{title}</span>
        {summary && (
          <span className="text-xs text-muted-foreground">{summary}</span>
        )}
      </button>
      {open && (
        <div
          className={cn(
            "px-density-3 py-density-2 border-t border-border",
            bodyClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export type DetailEmptyStateProps = {
  icon?: string | StaticIconComponent;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function DetailEmptyState({
  icon,
  label,
  description,
  className,
}: DetailEmptyStateProps) {
  return (
    <div
      className={cn("p-density-6 text-center text-muted-foreground", className)}
    >
      {icon && (
        <Icon
          {...(typeof icon === "string" ? { name: icon } : { icon })}
          className="text-3xl mb-density-2"
        />
      )}
      <p className="text-sm">{label}</p>
      {description && (
        <p className="text-xs mt-density-1 opacity-70">{description}</p>
      )}
    </div>
  );
}
