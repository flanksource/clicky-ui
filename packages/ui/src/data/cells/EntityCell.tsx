import { type MouseEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import type { BadgeTone } from "../Badge";

/** Soft chip fill + matching foreground, one entry per Badge tone. */
const CHIP_TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-500/12 text-emerald-700 [[data-theme=dark]_&]:text-emerald-400",
  danger: "bg-rose-500/12 text-rose-700 [[data-theme=dark]_&]:text-rose-400",
  warning: "bg-amber-400/15 text-amber-700 [[data-theme=dark]_&]:text-amber-400",
  info: "bg-sky-500/12 text-sky-700 [[data-theme=dark]_&]:text-sky-400",
};

export type EntityCellSize = "sm" | "md";

const CHIP_SIZE: Record<EntityCellSize, string> = {
  sm: "size-6 text-sm",
  md: "size-7 text-base",
};

export type EntityCellProps = {
  /** Primary line. Rendered as a link when `href` is set. */
  title: ReactNode;
  /** Secondary muted line — type, id, qualifier. */
  subtitle?: ReactNode;
  icon?: string | StaticIconComponent;
  /** Tints the icon chip. Defaults to `neutral`. */
  iconTone?: BadgeTone;
  size?: EntityCellSize;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Rendered at the end of the row (copy button, external link, badge). */
  trailing?: ReactNode;
  className?: string;
};

/**
 * A two-line table cell for an entity: tinted icon chip, a title, and a muted
 * subtitle. The shape most "which thing is this row about?" columns want, and
 * the same shape inline references (account, document, connector) use in detail
 * views.
 */
export function EntityCell({
  title,
  subtitle,
  icon,
  iconTone = "neutral",
  size = "md",
  href,
  onClick,
  trailing,
  className,
}: EntityCellProps) {
  const titleClasses = "truncate font-medium text-foreground";
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {icon && (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md",
            CHIP_SIZE[size],
            CHIP_TONE_CLASSES[iconTone],
          )}
        >
          <Icon
            {...(typeof icon === "string" ? { name: icon } : { icon })}
            className="text-[0.85em]"
          />
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-tight">
        {href || onClick ? (
          <a
            href={href ?? "#"}
            {...(onClick ? { onClick } : {})}
            className={cn(titleClasses, "hover:underline")}
          >
            {title}
          </a>
        ) : (
          <span className={titleClasses}>{title}</span>
        )}
        {subtitle !== undefined && (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </div>
  );
}
