import { useState, type ReactNode } from "react";
import { Icon } from "../../Icon";
import { UiChevronDown, UiChevronRight } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Disclosure } from "./fields";
import type { SpecSectionMeta } from "./types";

// Numbered scroll-target section (design .sec): a collapsible header with icon,
// title and hint, body, then an optional Advanced disclosure. The heading itself
// is the toggle (WAI-ARIA accordion pattern: heading > button).
export function SectionCard({
  meta,
  number,
  domId,
  sectionRef,
  advanced,
  advancedHint,
  defaultCollapsed = false,
  children,
  className,
}: {
  meta: SpecSectionMeta;
  number: string;
  domId: string;
  sectionRef: (element: HTMLElement | null) => void;
  advanced?: ReactNode | undefined;
  advancedHint?: string | undefined;
  defaultCollapsed?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyId = `${domId}-body`;
  return (
    <section
      id={domId}
      ref={sectionRef}
      aria-label={meta.label}
      className={cn(
        "scroll-mt-4 border-t border-border py-density-4 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <header>
        <h3 className="text-base font-bold tracking-tight">
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            onClick={() => setCollapsed((current) => !current)}
            className="group block w-full text-left"
          >
            <span className="flex w-full items-center gap-density-2">
              <Icon
                icon={meta.icon}
                className={cn(
                  "size-5",
                  meta.iconClassName ?? "text-muted-foreground",
                )}
              />
              <span>{meta.label}</span>
              <span className="text-[10px] font-bold tabular-nums text-muted-foreground/70">
                {number}
              </span>
              <Icon
                icon={collapsed ? UiChevronRight : UiChevronDown}
                className="ml-auto size-4 shrink-0 text-muted-foreground/70 group-hover:text-foreground"
              />
            </span>
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {meta.hint}
            </span>
          </button>
        </h3>
      </header>
      {!collapsed && (
        <div id={bodyId} className="mt-density-3">
          {children}
          {advanced && <Disclosure hint={advancedHint}>{advanced}</Disclosure>}
        </div>
      )}
    </section>
  );
}
