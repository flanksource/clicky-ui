import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

function groupNode(group: AppShellNavGroup): NavNode {
  return { key: group.key, label: group.label, group, ...(group.item ? { item: group.item } : {}), children: [...(group.groups ?? []).map(groupNode), ...group.items.map(itemNode)] };
}

function activePath(nodes: NavNode[]): NavNode[] | null {
  for (const node of nodes) {
    if (node.item?.active) return [node];
    const child = activePath(node.children);
    if (child) return [node, ...child];
  }
  return null;
}

export function NavTree({ section, groupState, dragState, renderItem }: {
  section: AppShellNavSection;
  groupState: GroupState;
  dragState: NavDragState;
  renderItem: RenderItem;
}) {
  const roots = useMemo(() => [...(section.groups ?? []).map(groupNode), ...(section.items ?? []).map(itemNode)], [section.groups, section.items]);
  const path = useMemo(() => activePath(roots), [roots]);
  const selected = path?.at(-1) ?? null;
  const revealedKey = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (revealedKey.current === selected?.key) return;
    revealedKey.current = selected?.key;
    for (const node of path ?? []) {
      if (node.group && groupState.isCollapsed(node.key, node.group.defaultCollapsed ?? false)) groupState.toggle(node.key, node.group.defaultCollapsed ?? false);
    }
  }, [selected?.key, path, groupState]);
  const expanded = (node: NavNode) => Boolean(node.group && (node.group.forceExpanded || !groupState.isCollapsed(node.key, node.group.defaultCollapsed ?? false)));
  return <Tree roots={roots} getKey={(node) => node.key} getChildren={(node) => node.children}
    ariaLabel={section.label ?? "Navigation"} getAriaLabel={(node) => node.label} selected={selected}
    getExpanded={expanded} onExpandedChange={(node, open) => {
      if (node.group && !node.group.forceExpanded && expanded(node) !== open) groupState.toggle(node.key, node.group.defaultCollapsed ?? false);
    }}
    showSearch={Boolean(section.search)} searchLabel={section.search?.label ?? "Filter navigation"}
    {...(section.search ? { searchQuery: section.search.value, onSearchQueryChange: section.search.onChange } : {})}
    getSearchText={(node) => node.item?.searchText ?? `${node.label} ${node.key}`} toolbarClassName="bg-sidebar supports-[backdrop-filter]:bg-sidebar text-sidebar-foreground border-sidebar-border"
    rowClass={() => "rounded-md py-0 pr-0 text-sidebar-foreground hover:bg-sidebar-accent"}
    renderRow={({ node, toggle }) => <NavTreeRow node={node} toggle={toggle} dragState={dragState} renderItem={renderItem} />}
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
