import type { AppShellNavSection } from "./AppShell";
import { NavSections } from "./AppShell.nav";
import { useGroupCollapsed } from "./useGroupCollapsed";

const DEFAULT_STORAGE_KEY = "clicky-ui:navigation-tree:groups";

export type NavigationTreeProps = {
  section: AppShellNavSection;
  /** localStorage key persisting per-group collapsed state. */
  storageKey?: string;
  /** Icon-only rendering, as in a collapsed AppShell rail. */
  collapsed?: boolean;
  className?: string;
};

// The AppShell rail's navigation without the shell: the same rows, lazy groups,
// search, drag and context menus, with its own persisted group state.
export function NavigationTree({ section, storageKey = DEFAULT_STORAGE_KEY, collapsed = false, className }: NavigationTreeProps) {
  const groupState = useGroupCollapsed(storageKey);
  return <NavSections sections={[section]} collapsed={collapsed} groupState={groupState} {...(className ? { className } : {})} />;
}
