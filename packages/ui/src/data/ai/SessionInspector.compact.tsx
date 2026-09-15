import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { UiEllipsis } from "../../icons";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { TabButton } from "../TabButton";
import type { StaticIconComponent } from "../Icon";
import { SessionContextMeter } from "./SessionViewer.header";
import type { SessionMetadataSummary } from "./SessionViewer.model";

export interface CompactSessionTab {
  id: string;
  label: ReactNode;
  icon: StaticIconComponent;
  count?: number;
  countColor?: string;
}

export function CompactSessionInspectorToolbar({
  tabs,
  activeTab,
  metadata,
  toolbarActions,
  onSelect,
  onMenuHost,
}: {
  tabs: CompactSessionTab[];
  activeTab: string;
  metadata?: SessionMetadataSummary;
  toolbarActions?: ReactNode;
  onSelect: (tab: string) => void;
  onMenuHost: (element: HTMLSpanElement | null) => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Session detail controls"
      className="flex h-10 min-w-0 shrink-0 items-stretch overflow-hidden border-b border-border bg-card"
    >
      <div
        role="tablist"
        aria-label="Session detail view"
        className="flex min-w-0 flex-1 items-stretch overflow-hidden px-0.5 @min-[48rem]:px-2"
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onSelect(tab.id)}
            label={tab.label}
            icon={tab.icon}
            variant="underline"
            {...(tab.count === undefined ? {} : { count: tab.count })}
            {...(tab.countColor ? { countColor: tab.countColor } : {})}
            className={`h-full shrink-0 px-1 py-0 text-[11px] [&_svg]:size-3.5 [&_svg]:text-muted-foreground @min-[48rem]:px-2.5 ${
              activeTab === tab.id ? "" : "@max-[48rem]:hidden"
            }`}
          />
        ))}
        <DropdownMenu
          align="left"
          className="shrink-0 @min-[48rem]:hidden"
          menuLabel="More session tabs"
          items={tabs
            .filter((tab) => tab.id !== activeTab)
            .map((tab) => ({
              label: tab.label,
              icon: tab.icon,
              onSelect: () => onSelect(tab.id),
            }))}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="More session tabs"
              title="More session tabs"
              className="h-full w-8 shrink-0 rounded-none text-muted-foreground hover:text-foreground"
            >
              <UiEllipsis className="size-4" />
            </Button>
          }
        />
      </div>
      <div
        role="group"
        aria-label="Session controls"
        className="ml-auto flex shrink-0 items-center gap-1 border-l border-border bg-card pl-1 pr-2 @min-[48rem]:gap-2 @min-[48rem]:px-3"
      >
        {metadata ? (
          <div className="shrink-0">
            <SessionContextMeter metadata={metadata} mode="bar" />
          </div>
        ) : null}
        {toolbarActions}
        <span ref={onMenuHost} className="inline-flex shrink-0" />
      </div>
    </div>
  );
}
