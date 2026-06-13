import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiSidebar } from "../icons";
import type { RenderLink } from "../rpc/EndpointList";

// AppSidebar / AppLayout are a router-agnostic application shell: a collapsible
// left navigation rail driven by declarative sections, plus a flex layout that
// pairs it with an optional header and the routed content. Navigation is
// expressed through `renderLink` (the same render-prop EndpointList uses) so the
// host app supplies react-router's Link, a plain <a>, or any custom navigator
// without coupling the library to a router. Active state is derived from the
// `pathname` prop rather than a router hook for the same reason.

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

export interface AppNavSection {
  /** Section heading; omitted for the leading section. */
  label?: string;
  items: AppNavItem[];
}

export interface AppSidebarProps {
  sections: AppNavSection[];
  /** Current path, used to compute the active item. */
  pathname: string;
  renderLink: RenderLink;
  /** Branding shown at the top of the expanded rail (logo/title). */
  header?: ReactNode;
  /** Pinned to the bottom of the rail (theme switcher, version, etc.). */
  footer?: ReactNode;
  /** localStorage key persisting the collapsed state. */
  collapsedStorageKey?: string;
  /** Override the default prefix-match active test. */
  isActive?: (pathname: string, to: string) => boolean;
  className?: string;
}

const DEFAULT_COLLAPSE_KEY = "clicky-ui:app-sidebar:collapsed";

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

export function AppSidebar({
  sections,
  pathname,
  renderLink,
  header,
  footer,
  collapsedStorageKey = DEFAULT_COLLAPSE_KEY,
  isActive = defaultIsActive,
  className,
}: AppSidebarProps) {
  const [collapsed, toggleCollapsed] = useCollapsed(collapsedStorageKey);
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
            {section.items.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                active={isActive(pathname, item.to)}
                collapsed={collapsed}
                renderLink={renderLink}
              />
            ))}
          </div>
        ))}
      </div>

      {footer && <div className={cn("mt-auto border-t border-border py-3", collapsed ? "px-2" : "px-4")}>{footer}</div>}
    </nav>
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
