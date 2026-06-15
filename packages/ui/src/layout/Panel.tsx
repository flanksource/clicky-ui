import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";

export type PanelTone = "default" | "danger" | "warning" | "success" | "info";

export type PanelProps = {
  /** Header title. Omit (with no icon/count/actions) to render a headerless card. */
  title?: ReactNode;
  /** Optional leading icon. */
  icon?: string | StaticIconComponent;
  /** Optional count pill shown after the title. */
  count?: number;
  /** Right-aligned header content (copy buttons, summaries, links). */
  actions?: ReactNode;
  /** Optional footer row below the body. */
  footer?: ReactNode;
  /** Semantic left-border accent. */
  tone?: PanelTone;
  /** Pad the body. Defaults to true; pass false for flush row lists. */
  padded?: boolean;
  /** Classes applied to the panel root. */
  className?: string;
  /** Classes applied to the header row. */
  headerClassName?: string;
  /** Classes applied to the body. */
  bodyClassName?: string;
  /** Panel content. */
  children: ReactNode;
};

const toneRing: Record<PanelTone, string> = {
  default: "",
  danger: "border-l-2 border-l-red-500",
  warning: "border-l-2 border-l-yellow-500",
  success: "border-l-2 border-l-green-500",
  info: "border-l-2 border-l-blue-500",
};

/**
 * A non-collapsible carded surface with an optional header. Use for content
 * panels (checks, results, comments) where {@link Section}'s disclosure
 * behaviour isn't wanted. Sits on `bg-card` with a border and rounded corners.
 */
export function Panel({
  title,
  icon,
  count,
  actions,
  footer,
  tone = "default",
  padded = true,
  className,
  headerClassName,
  bodyClassName,
  children,
}: PanelProps) {
  const hasHeader = title !== undefined || icon !== undefined || actions !== undefined;
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card overflow-hidden",
        toneRing[tone],
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-center gap-2 px-density-3 py-density-2 border-b border-border",
            headerClassName,
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {icon && (
              <Icon
                {...(typeof icon === "string" ? { name: icon } : { icon })}
                className="text-base text-muted-foreground"
              />
            )}
            {title !== undefined && (
              <span className="font-medium text-sm truncate text-card-foreground">{title}</span>
            )}
            {count !== undefined && (
              <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className={cn(padded && "px-density-3 py-density-2", bodyClassName)}>{children}</div>
      {footer && <div className="px-density-3 py-density-2 border-t border-border">{footer}</div>}
    </div>
  );
}
