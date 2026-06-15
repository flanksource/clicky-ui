import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { TabButton, type TabButtonVariant } from "../data/TabButton";
import type { StaticIconComponent } from "../data/Icon";

export type TabItem = {
  /** Stable id; also the value compared against the selected `value`. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon (icon name or component). */
  icon?: string | StaticIconComponent;
  /** Optional count badge; hidden when zero. */
  count?: number;
  /** Classes for the count badge background. */
  countColor?: string;
  /** Disables selecting this tab. */
  disabled?: boolean;
};

export type TabsProps = {
  /** Tabs to render, in order. */
  tabs: TabItem[];
  /** Currently selected tab id. */
  value: string;
  /** Called with the next tab id when a tab is clicked. */
  onChange: (id: string) => void;
  /** Visual style. Defaults to `underline`. */
  variant?: TabButtonVariant;
  /** Classes applied to the tablist row. */
  className?: string;
};

/**
 * A controlled tab strip built on {@link TabButton}. Defaults to the
 * `underline` variant — the row carries a bottom border and the active tab's
 * underline overlaps it. Render the matching panel yourself based on `value`.
 */
export function Tabs({ tabs, value, onChange, variant = "underline", className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-density-1",
        variant === "underline" && "border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          active={tab.id === value}
          onClick={() => {
            if (!tab.disabled) onChange(tab.id);
          }}
          label={tab.label}
          variant={variant}
          {...(tab.icon !== undefined ? { icon: tab.icon } : {})}
          {...(tab.count !== undefined ? { count: tab.count } : {})}
          {...(tab.countColor !== undefined ? { countColor: tab.countColor } : {})}
          {...(tab.disabled ? { className: "opacity-50 pointer-events-none" } : {})}
        />
      ))}
    </div>
  );
}
