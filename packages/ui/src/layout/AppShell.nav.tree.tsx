import { useMemo, useState, type ReactNode } from "react";
import { Tree } from "../data/Tree";
import { Icon } from "../data/Icon";
import { ContextMenu } from "../overlay/ContextMenu";
import type { AppShellNavGroup, AppShellNavItem, AppShellNavSection } from "./AppShell";
import type { GroupState } from "./AppShell.nav";
import { NAV_DRAG_ROW_CLASS, type NavDragState } from "./AppShell.nav.drag";
import { cn } from "../lib/utils";

type NavNode = { key: string; label: string; group?: AppShellNavGroup; item?: AppShellNavItem; children: NavNode[] };
type RenderItem = (item: AppShellNavItem, options: { drag: boolean }) => ReactNode;

function itemNode(item: AppShellNavItem): NavNode {
  return { key: item.key, label: typeof item.label === "string" ? item.label : item.key, item, children: [] };
}

type NavChildren = { groups?: AppShellNavGroup[]; items?: AppShellNavItem[]; order?: string[] };

function childNodes({ groups = [], items = [], order }: NavChildren): NavNode[] {
  const defaults = [...groups.map(groupNode), ...items.map(itemNode)];
  if (!order) return defaults;
  const byKey = new Map(defaults.map((node) => [node.key, node]));
  const ordered = order.map((key) => {
    const node = byKey.get(key);
    if (!node) throw new Error(`Navigation order key "${key}" matches no item or group, or is repeated; expected each of: ${defaults.map((n) => n.key).join(", ")}`);
    byKey.delete(key);
    return node;
  });
  return [...ordered, ...defaults.filter((node) => byKey.has(node.key))];
}

function groupNode(group: AppShellNavGroup): NavNode {
  return { key: group.key, label: group.label, group, ...(group.item ? { item: group.item } : {}), children: childNodes(group) };
}

function activePath(nodes: NavNode[]): NavNode[] | null {
  for (const node of nodes) {
    if (node.item?.active) return [node];
    const child = activePath(node.children);
    if (child) return [node, ...child];
  }
  return null;
}

const NO_KEYS: ReadonlySet<string> = new Set();

// The active item's ancestors are shown open without being written into the
// persisted collapse state: the reveal is derived from the active path, so it
// disappears when the active item moves. A user collapse of a revealed group is
// remembered only until the active item changes.
function useGroupExpansion(path: NavNode[] | null, selectedKey: string | undefined, groupState: GroupState) {
  const [dismissed, setDismissed] = useState<{ selectedKey: string | undefined; keys: ReadonlySet<string> }>({ selectedKey, keys: NO_KEYS });
  const revealed = useMemo(() => new Set((path ?? []).filter((node) => node.group).map((node) => node.key)), [path]);
  const dismissedKeys = dismissed.selectedKey === selectedKey ? dismissed.keys : NO_KEYS;
  const storedOpen = (node: NavNode) => !groupState.isCollapsed(node.key, node.group?.defaultCollapsed ?? false);
  const expanded = (node: NavNode) => Boolean(node.group && (node.group.forceExpanded || (revealed.has(node.key) && !dismissedKeys.has(node.key)) || storedOpen(node)));
  const setExpanded = (node: NavNode, open: boolean) => {
    if (!node.group || node.group.forceExpanded || expanded(node) === open) return;
    if (storedOpen(node) !== open) groupState.toggle(node.key, node.group.defaultCollapsed ?? false);
    if (!revealed.has(node.key)) return;
    const keys = new Set(dismissedKeys);
    if (open) keys.delete(node.key);
    else keys.add(node.key);
    setDismissed({ selectedKey, keys });
  };
  return { expanded, setExpanded };
}

export function NavTree({ section, groupState, dragState, renderItem }: {
  section: AppShellNavSection;
  groupState: GroupState;
  dragState: NavDragState;
  renderItem: RenderItem;
}) {
  const roots = useMemo(() => childNodes(section), [section.groups, section.items, section.order]);
  const path = useMemo(() => activePath(roots), [roots]);
  const selected = path?.at(-1) ?? null;
  const { expanded, setExpanded } = useGroupExpansion(path, selected?.key, groupState);
  return <Tree roots={roots} getKey={(node) => node.key} getChildren={(node) => node.children}
    hasMoreChildren={(node) => Boolean(node.group?.loadChildren)}
    loadChildren={async (node) => {
      if (!node.group?.loadChildren) return node.children;
      return childNodes(await node.group.loadChildren());
    }} reloadOnOpen={section.reloadOnOpen ?? true} getChildrenVersion={(node) => node.group?.version ?? section.childrenVersion ?? 0}
    ariaLabel={section.label ?? "Navigation"} getAriaLabel={(node) => node.label} selected={selected}
    getExpanded={expanded} onExpandedChange={setExpanded}
    searchLabel={section.search?.label ?? "Filter navigation"}
    {...(section.search ? { showSearch: true, searchQuery: section.search.value, onSearchQueryChange: section.search.onChange } : {})}
    getSearchText={(node) => node.item?.searchText ?? `${node.label} ${node.key}`} toolbarClassName="bg-sidebar supports-[backdrop-filter]:bg-sidebar text-sidebar-foreground border-sidebar-border"
    rowClass={() => "rounded-md py-0 pr-0 text-sidebar-foreground hover:bg-sidebar-accent"}
    renderRow={({ node, toggle, loading, error }) => <><NavTreeRow node={node} toggle={toggle} dragState={dragState} renderItem={renderItem} />{loading && <span role="status" className="text-xs">Loading…</span>}{error != null && <span role="alert" className="text-xs text-destructive">{error instanceof Error ? error.message : String(error)}</span>}</>}
    empty={<p role={section.loading ? "status" : undefined} className="px-2 py-4 text-xs text-sidebar-foreground/70">{section.loading ? "Loading navigation…" : "No matching pages."}</p>} />;
}

function NavTreeRow({ node, toggle, dragState, renderItem }: { node: NavNode; toggle: () => void; dragState: NavDragState; renderItem: RenderItem }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  if (!node.group) return <div className="min-w-0 flex-1" onClick={(event) => event.stopPropagation()}>{node.item && renderItem(node.item, { drag: true })}</div>;
  const group = node.group;
  const folder = { key: node.key, kind: "group" } as const;
  const drag = dragState.props({ drag: node.item ? { key: node.item.key, kind: "item" } : folder, drop: folder });
  return <div ref={setTarget} className={cn("flex min-w-0 flex-1 items-center", drag && NAV_DRAG_ROW_CLASS)} {...drag} onClick={(event) => event.stopPropagation()}>
    {node.item ? renderItem(node.item, { drag: false }) : <button type="button" onClick={toggle} className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-density-2 py-1.5 text-left text-[13px]">
      {group.icon && <Icon {...(typeof group.icon === "string" ? { name: group.icon } : { icon: group.icon })} className="size-4 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{group.label}</span>
    </button>}
    {group.badge}
    {group.contextMenu && <ContextMenu contextTarget={target} menuLabel={group.contextMenuLabel ?? `${group.label} actions`} menuItems={group.contextMenu} />}
  </div>;
}
