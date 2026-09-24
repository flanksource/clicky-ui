import { useState } from "react";
import type { SessionInspectorTab } from "./SessionInspector.tabs.model";

// useInspectorTab owns the active tab unless the host controls it. The output
// fallback is derived rather than written back, so a controlled "output" tab
// on a session without structured output shows the transcript without a loop.
export function useInspectorTab(
  defaultTab: SessionInspectorTab,
  outputVisible: boolean,
  controlledTab: SessionInspectorTab | undefined,
  onTabChange: ((tab: SessionInspectorTab) => void) | undefined,
) {
  const [localTab, setLocalTab] = useState(defaultTab);
  const requested = controlledTab ?? localTab;
  const tab: SessionInspectorTab =
    requested === "output" && !outputVisible ? "transcript" : requested;
  const selectTab = (next: SessionInspectorTab) => {
    setLocalTab(next);
    onTabChange?.(next);
  };
  return [tab, selectTab] as const;
}
