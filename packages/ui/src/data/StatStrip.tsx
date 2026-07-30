import { type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import type { BadgeTone } from "./Badge";

/**
 * Tone applied to the value only — the label and sub-label stay muted so the
 * strip reads as one block of chrome with the numbers carrying the signal.
 */
const TONE_VALUE_CLASSES: Record<BadgeTone, string> = {
  neutral: "text-foreground",
  success: "text-emerald-600 [[data-theme=dark]_&]:text-emerald-400",
  danger: "text-rose-600 [[data-theme=dark]_&]:text-rose-400",
  warning: "text-amber-600 [[data-theme=dark]_&]:text-amber-400",
  info: "text-sky-600 [[data-theme=dark]_&]:text-sky-400",
};

export type StatStripItem = {
  /** Short caption above the value. */
  label: ReactNode;
  /** The headline figure. Rendered monospace with tabular figures. */
  value: ReactNode;
  /** Optional qualifier below the value (units, scope, caveat). */
  sub?: ReactNode;
  tone?: BadgeTone;
  icon?: string | StaticIconComponent;
  /** Renders the cell as a link. */
  href?: string;
  /** Renders the cell as a button. Ignored when `href` is set. */
  onClick?: () => void;
};

/** Per-slot class overrides, for callers matching an existing type scale. */
export type StatStripClassNames = {
  cell?: string;
  label?: string;
  value?: string;
  sub?: string;
};

export type StatStripProps = {
  items: StatStripItem[];
  /** Cells per row on md+ screens. Defaults to the item count. */
  columns?: number;
  className?: string;
  classNames?: StatStripClassNames;
};

function StatStripCell({
  item,
  classNames,
}: {
  item: StatStripItem;
  classNames: StatStripClassNames;
}) {
  const body = (
    <>
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
          classNames.label,
        )}
      >
        {item.icon && (
          <Icon
            {...(typeof item.icon === "string"
              ? { name: item.icon }
              : { icon: item.icon })}
            className="text-sm"
          />
        )}
        <span className="truncate">{item.label}</span>
      </div>
      <div
        className={cn(
          "font-mono text-lg leading-tight tabular-nums",
          TONE_VALUE_CLASSES[item.tone ?? "neutral"],
          classNames.value,
        )}
      >
        {item.value}
      </div>
      {item.sub !== undefined && (
        <div className={cn("text-xs text-muted-foreground", classNames.sub)}>
          {item.sub}
        </div>
      )}
    </>
  );

  const cellClasses = cn(
    "flex flex-col gap-0.5 bg-card px-density-3 py-density-2 text-left",
    classNames.cell,
  );

  if (item.href) {
    return (
      <a href={item.href} className={cn(cellClasses, "hover:bg-accent/40")}>
        {body}
      </a>
    );
  }
  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={cn(cellClasses, "hover:bg-accent/40")}
      >
        {body}
      </button>
    );
  }
  return <div className={cellClasses}>{body}</div>;
}

/**
 * A row of headline figures — the summary strip that sits above a table or
 * detail page. Purely presentational: it derives nothing, the caller supplies
 * already-formatted values.
 *
 * Cell separators come from a 1px grid gap over the container background, so
 * they stay correct however the grid wraps.
 */
export function StatStrip({
  items,
  columns,
  className,
  classNames = {},
}: StatStripProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-border",
        className,
      )}
      data-testid="stat-strip"
    >
      <div
        className="grid grid-cols-2 gap-px md:grid-cols-[repeat(var(--stat-cols,4),minmax(0,1fr))]"
        style={
          {
            "--stat-cols": columns ?? Math.max(items.length, 1),
          } as CSSProperties
        }
      >
        {items.map((item, index) => (
          <StatStripCell key={index} item={item} classNames={classNames} />
        ))}
      </div>
    </div>
  );
}
