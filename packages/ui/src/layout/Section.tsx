import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown, UiChevronRight } from "../icons";

export type SectionProps = {
  /** Header title. */
  title: ReactNode;
  /**
   * Optional right-aligned header summary. The summary is a sibling of the
   * collapse toggle, never a descendant of it — so a summary containing
   * interactive content (filter tabs, links) is valid DOM and its clicks do
   * not toggle the section. When a summary is present, only the chevron + the
   * title toggle; the summary region does not.
   */
  summary?: ReactNode;
  /**
   * Whether the section can collapse. Defaults to true. When false the body is
   * always rendered, the header has no chevron and is not clickable — use for a
   * fixed panel that should never hide its content.
   */
  collapsible?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when the section is toggled. */
  onToggle?: (open: boolean) => void;
  /** Optional leading icon. */
  icon?: string | StaticIconComponent;
  /** Semantic border accent. */
  tone?: "default" | "danger" | "warning" | "success" | "info";
  /** Classes applied to the section root. */
  className?: string;
  /** Classes applied to the clickable header. */
  headerClassName?: string;
  /** Classes applied to the content body. */
  bodyClassName?: string;
  /** Collapsible content. */
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
  collapsible = true,
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
  // A non-collapsible section is permanently open — there is no toggle to track.
  const open = !collapsible || (isControlled ? openProp : innerOpen);

  function toggle() {
    const next = !open;
    if (!isControlled) setInnerOpen(next);
    onToggle?.(next);
  }

  const leading = (
    <>
      {collapsible && (
        <Icon
          icon={open ? UiChevronDown : UiChevronRight}
          className="text-muted-foreground text-xs"
        />
      )}
      {icon && (
        <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} className="text-base" />
      )}
      <span className="font-medium text-sm flex-1 truncate">{title}</span>
    </>
  );

  return (
    <div className={cn("rounded-md border border-border bg-background", toneRing[tone], className)}>
      {/* The header is always a plain row so the summary (which may hold its own
          interactive content) is never nested inside the toggle button. Only the
          chevron + title region toggles; the summary is a sibling of it. */}
      <div
        className={cn(
          "w-full flex items-center gap-2 px-density-3 py-density-2 text-left",
          headerClassName,
        )}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex flex-1 min-w-0 items-center gap-2 text-left rounded-sm hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {leading}
          </button>
        ) : (
          <div className="flex flex-1 min-w-0 items-center gap-2">{leading}</div>
        )}
        {summary && <span className="text-xs text-muted-foreground shrink-0">{summary}</span>}
      </div>
      {open && (
        <div className={cn("px-density-3 py-density-2 border-t border-border", bodyClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

export type DetailEmptyStateProps = {
  /** Optional icon shown above the label. */
  icon?: string | StaticIconComponent;
  /** Primary empty-state text. */
  label: ReactNode;
  /** Secondary empty-state text. */
  description?: ReactNode;
  /** Classes applied to the empty-state root. */
  className?: string;
};

export function DetailEmptyState({ icon, label, description, className }: DetailEmptyStateProps) {
  return (
    <div className={cn("p-density-6 text-center text-muted-foreground", className)}>
      {icon && (
        <Icon
          {...(typeof icon === "string" ? { name: icon } : { icon })}
          className="text-3xl mb-density-2"
        />
      )}
      <p className="text-sm">{label}</p>
      {description && <p className="text-xs mt-density-1 opacity-70">{description}</p>}
    </div>
  );
}
