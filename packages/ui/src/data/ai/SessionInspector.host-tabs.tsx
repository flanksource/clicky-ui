import { useState, type ReactNode } from "react";
import type { StaticIconComponent } from "../Icon";
import type { CompactSessionTab } from "./SessionInspector.compact";
import { isSessionInspectorTab } from "./SessionInspector.tabs.model";

/** A host-owned tab in the compact toolbar, right after the transcript tab,
 *  so a host shows its views (e.g. a branch's changes) without a second tab bar. */
export interface SessionInspectorHostTab {
  id: string;
  label: ReactNode;
  icon: StaticIconComponent;
  content: ReactNode;
}

/** The compact toolbar's tabs with the host's views placed right after the
 *  transcript, so a host view sits beside the conversation it accompanies. */
export function withHostTabs(
  inspectorTabs: readonly CompactSessionTab[],
  hostItems: readonly CompactSessionTab[],
): CompactSessionTab[] {
  const at = inspectorTabs.findIndex((tab) => tab.id === "transcript") + 1;
  if (at === 0) {
    throw new Error("SessionInspector compact tabs have no transcript tab to place host tabs after");
  }
  return [...inspectorTabs.slice(0, at), ...hostItems, ...inspectorTabs.slice(at)];
}

export function useHostTabs(
  tabs: readonly SessionInspectorHostTab[] | undefined,
  compact: boolean,
) {
  const [selected, setSelected] = useState<string>();
  if (tabs?.length && !compact) {
    throw new Error('SessionInspector hostTabs require layout="compact"');
  }
  for (const tab of tabs ?? []) {
    if (isSessionInspectorTab(tab.id)) {
      throw new Error(
        `SessionInspector host tab id "${tab.id}" collides with an inspector tab`,
      );
    }
  }
  // A host tab that is no longer passed falls back to the inspector's tab.
  const active = tabs?.find((tab) => tab.id === selected);
  const items: CompactSessionTab[] = (tabs ?? []).map(({ id, label, icon }) => ({
    id,
    label,
    icon,
  }));
  /** Selects a host tab, or clears the host selection; true when `id` is a host tab. */
  const select = (id: string) => {
    const isHost = tabs?.some((tab) => tab.id === id) === true;
    setSelected(isHost ? id : undefined);
    return isHost;
  };
  return { active, items, select };
}
