import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiSidebar } from "../icons";
import type { RenderLink } from "../rpc/EndpointList";
import { useRouter } from "../rpc/router";

// AppSidebar / AppLayout are a router-agnostic application shell: a collapsible
// left navigation rail driven by declarative sections, plus a flex layout that
// pairs it with an optional header and the routed content. Navigation and active
// state come from the RouterAdapter (see ../rpc/router) — by default a plain
// <a href={to}> browser adapter, or the host's react-router/memory adapter via
// RouterProvider. The `pathname` and `renderLink` props still override the
// adapter for cases where a rail's active state is independent of the URL.
//
// A section may carry flat `items` and/or collapsible `groups`. Groups are for
// high-cardinality clusters (e.g. provider surfaces) that benefit from being
// folded away; their open/closed state persists per `group.key`.

export interface AppNavItem {
  /** Stable key; also used as the React key. */
  key: string;
  title: string;
  /** Destination passed to renderLink (or href for external items). */
  to: string;
  icon?: ReactNode;
  /** Render a plain anchor (new-tab style) instead of a routed link. */
  external?: boolean;
  /** Optional trailing adornment (count, status dot, etc.). */
  badge?: ReactNode;
}

export interface AppNavGroup {
  /** Stable key; also the persistence key for collapsed state. */
  key: string;
  label: string;
  icon?: ReactNode;
  /** Collapsed on first render until the user toggles it. */
  defaultCollapsed?: boolean;
  items?: AppNavItem[];
  /** Nested groups (one extra level, e.g. Providers > Xero). */
  groups?: AppNavGroup[];
}

export interface AppNavSection {
  /** Section heading; omitted for the leading section. */
  label?: string;
  items?: AppNavItem[];
  /** Collapsible groups rendered after the flat items. */
  groups?: AppNavGroup[];
}

export interface AppSidebarProps {
  sections: AppNavSection[];
  /** Current path for active-state. Defaults to the RouterAdapter's pathname. */
  pathname?: string;
  /** Render routed links. Defaults to the RouterAdapter's renderLink (a plain
   *  <a href={to}> unless a RouterProvider supplies a router Link). */
  renderLink?: RenderLink;
  /** Branding shown at the top of the expanded rail (logo/title). */
  header?: ReactNode;
  /** Pinned to the bottom of the rail (theme switcher, version, etc.). */
  footer?: ReactNode;
  /** localStorage key persisting the rail collapsed state. */
  collapsedStorageKey?: string;
  /** localStorage key persisting per-group collapsed state. */
  groupCollapsedStorageKey?: string;
  /** Override the default prefix-match active test. */
  isActive?: (pathname: string, to: string) => boolean;
  className?: string;
}

const DEFAULT_COLLAPSE_KEY = "clicky-ui:app-sidebar:collapsed";
const DEFAULT_GROUP_COLLAPSE_KEY = "clicky-ui:app-sidebar:groups";

function defaultIsActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function useCollapsed(storageKey: string): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(storageKey) === "true";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed, storageKey]);
  return [collapsed, () => setCollapsed((c) => !c)];
}

interface GroupState {
  isCollapsed: (key: string, fallback: boolean) => boolean;
  toggle: (key: string, fallback: boolean) => void;
}

function readGroupState(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function useGroupCollapsed(storageKey: string): GroupState {
  const [state, setState] = useState<Record<string, boolean>>(() => readGroupState(storageKey));
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Sidebar state is a UX nicety; private-mode storage failures are safe to swallow.
    }
  }, [state, storageKey]);
  return {
    isCollapsed: (key, fallback) => state[key] ?? fallback,
    toggle: (key, fallback) => setState((prev) => ({ ...prev, [key]: !(prev[key] ?? fallback) })),
  };
}

function flattenGroupItems(groups: AppNavGroup[]): AppNavItem[] {
  const out: AppNavItem[] = [];
  for (const group of groups) {
    if (group.items) out.push(...group.items);
    if (group.groups) out.push(...flattenGroupItems(group.groups));
  }
  return out;
}

export function AppSidebar({
  sections,
  pathname: pathnameProp,
  renderLink: renderLinkProp,
  header,
  footer,
  collapsedStorageKey = DEFAULT_COLLAPSE_KEY,
  groupCollapsedStorageKey = DEFAULT_GROUP_COLLAPSE_KEY,
  isActive = defaultIsActive,
  className,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = pathnameProp ?? router.pathname;
  const renderLink = renderLinkProp ?? router.renderLink;
  const [collapsed, toggleCollapsed] = useCollapsed(collapsedStorageKey);
  const groupState = useGroupCollapsed(groupCollapsedStorageKey);
  return (
    <nav
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-border bg-muted/30 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border py-3",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!collapsed && <div className="min-w-0 flex-1">{header}</div>}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Icon icon={UiSidebar} className="h-4 w-4" />
        </button>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto py-2", collapsed ? "px-2" : "px-3")}>
        {sections.map((section, i) => (
          <div key={section.label ?? `section-${i}`} className="flex flex-col">
            {section.label && <SectionLabel collapsed={collapsed}>{section.label}</SectionLabel>}
            {section.items?.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                active={isActive(pathname, item.to)}
                collapsed={collapsed}
                renderLink={renderLink}
              />
            ))}
            {section.groups?.map((group) =>
              collapsed ? (
                flattenGroupItems([group]).map((item) => (
                  <SidebarItem
                    key={item.key}
                    item={item}
                    active={isActive(pathname, item.to)}
                    collapsed
                    renderLink={renderLink}
                  />
                ))
              ) : (
                <SidebarGroup
                  key={group.key}
                  group={group}
                  pathname={pathname}
                  isActive={isActive}
                  renderLink={renderLink}
                  groupState={groupState}
                />
              ),
            )}
          </div>
        ))}
      </div>

      {footer && <div className={cn("mt-auto border-t border-border py-3", collapsed ? "px-2" : "px-4")}>{footer}</div>}
    </nav>
  );
}

function SidebarGroup({
  group,
  pathname,
  isActive,
  renderLink,
  groupState,
}: {
  group: AppNavGroup;
  pathname: string;
  isActive: (pathname: string, to: string) => boolean;
  renderLink: RenderLink;
  groupState: GroupState;
}) {
  const fallback = group.defaultCollapsed ?? false;
  const collapsed = groupState.isCollapsed(group.key, fallback);
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => groupState.toggle(group.key, fallback)}
        aria-expanded={!collapsed}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-accent/40"
      >
        {group.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{group.icon}</span>}
        <span className="flex-1 truncate text-left">{group.label}</span>
        <span aria-hidden className="text-[0.65rem] opacity-60">
          {collapsed ? "▸" : "▾"}
        </span>
      </button>
      {!collapsed && (
        <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-border/60 pl-2">
          {group.items?.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={isActive(pathname, item.to)}
              collapsed={false}
              renderLink={renderLink}
            />
          ))}
          {group.groups?.map((sub) => (
            <SidebarGroup
              key={sub.key}
              group={sub}
              pathname={pathname}
              isActive={isActive}
              renderLink={renderLink}
              groupState={groupState}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  renderLink,
}: {
  item: AppNavItem;
  active: boolean;
  collapsed: boolean;
  renderLink: RenderLink;
}) {
  const className = cn(
    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
    collapsed && "justify-center px-0",
    active && "bg-accent font-medium text-accent-foreground",
  );
  const title = collapsed ? item.title : undefined;
  const children = (
    <>
      {item.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>}
      {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
      {!collapsed && item.badge}
    </>
  );

  if (item.external) {
    return (
      <a href={item.to} className={className} title={title} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return renderLink({ key: item.key, to: item.to, className, children, ...(title ? { title } : {}) });
}

function SectionLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-2 mb-1 mt-3 border-t border-border first:mt-2" />;
  }
  return (
    <div className="mb-0.5 mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground first:mt-2">
      {children}
    </div>
  );
}

export interface AppLayoutProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Flex shell pairing the sidebar rail with an optional header and the routed
 * content area. The content area scrolls independently of the rail. */
export function AppLayout({ sidebar, header, children, className }: AppLayoutProps) {
  return (
    <div className={cn("flex h-full min-h-0 w-full overflow-hidden bg-background", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
