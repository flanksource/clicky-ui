import type { ReactNode } from "react";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { PanelFrame, type PanelTone } from "./PanelFrame";

export type { PanelTone } from "./PanelFrame";

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
  const hasHeader =
    title !== undefined || icon !== undefined || actions !== undefined;
  return (
    <PanelFrame
      {...(hasHeader
        ? {
            header: (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {icon && (
                    <Icon
                      {...(typeof icon === "string"
                        ? { name: icon }
                        : { icon })}
                      className="text-base text-muted-foreground"
                    />
                  )}
                  {title !== undefined && (
                    <span className="truncate text-sm font-medium text-card-foreground">
                      {title}
                    </span>
                  )}
                  {count !== undefined && (
                    <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                      {count}
                    </span>
                  )}
                </div>
                {actions && (
                  <div className="flex shrink-0 items-center gap-1">
                    {actions}
                  </div>
                )}
              </>
            ),
          }
        : {})}
      {...(footer !== undefined ? { footer } : {})}
      tone={tone}
      padded={padded}
      {...(className !== undefined ? { className } : {})}
      {...(headerClassName !== undefined ? { headerClassName } : {})}
      {...(bodyClassName !== undefined ? { bodyClassName } : {})}
    >
      {children}
    </PanelFrame>
  );
}
