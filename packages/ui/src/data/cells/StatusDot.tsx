import { cn } from "../../lib/utils";
import type { BadgeStatus } from "../Badge";

export type StatusDotSize = "xs" | "sm" | "md";

const DOT_COLOR: Record<BadgeStatus, string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

const DOT_SIZE: Record<StatusDotSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
};

export type StatusDotProps = {
  status: BadgeStatus;
  size?: StatusDotSize;
  label?: string;
  title?: string;
  className?: string;
};

export function StatusDot({ status, size = "sm", label, title, className }: StatusDotProps) {
  const tooltip = title ?? label ?? status;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 align-middle", className)}
      title={tooltip}
    >
      <span
        role="img"
        aria-label={label ?? status}
        className={cn("inline-block shrink-0 rounded-full", DOT_COLOR[status], DOT_SIZE[size])}
      />
      {label && <span className="truncate text-xs">{label}</span>}
    </span>
  );
}
