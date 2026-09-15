import { TabButton } from "../TabButton";
import type {
  InspectorTabItem,
  SessionInspectorTab,
} from "./SessionInspector.tabs.model";

export type { SessionInspectorTab } from "./SessionInspector.tabs.model";

export function InspectorTabs({
  tab,
  tabs,
  onSelect,
}: {
  tab: SessionInspectorTab;
  tabs: InspectorTabItem[];
  onSelect: (tab: SessionInspectorTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Session detail view"
      className="flex shrink-0 overflow-x-auto border-b border-border px-density-2"
    >
      {tabs.map((item) => (
        <TabButton
          key={item.id}
          active={tab === item.id}
          onClick={() => onSelect(item.id)}
          label={item.label}
          icon={item.icon}
          variant="underline"
          {...(item.count === undefined ? {} : { count: item.count })}
          {...(item.countColor ? { countColor: item.countColor } : {})}
          className="shrink-0 py-density-2 [&_svg]:text-muted-foreground"
        />
      ))}
    </div>
  );
}
