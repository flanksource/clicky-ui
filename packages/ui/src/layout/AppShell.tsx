import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiSidebar } from "../icons";
import { useRouter } from "../rpc/router";
import type { RenderLink } from "../rpc/EndpointList";
import { SplitPane } from "./SplitPane";

// AppShell is a sidebar-first application shell. The full-height DARK nav rail
// owns the brand + collapse toggle and renders grouped nav sections; the top bar
// (search, actions) sits to the RIGHT of the rail — there is no full-width top
// bar when a rail is present. With no rail, the top bar spans full width. The
// body carries a fixed bodyHeader + bodyActions row over an optional
// bodySidebar | body-main split (body-main scrolls; bodySidebar — e.g. a tree —
// scrolls independently via a resizable SplitPane).

export type AppShellNavItem = {
  /** Stable key; also the React key. */
  key: string;
  /** Visible label (hidden when the rail is collapsed). */
  label: ReactNode;
  /** Leading icon (icon name or component). */
  icon?: string | StaticIconComponent;
  /** Highlights the item as the current location. */
  active?: boolean;
  /** Routing destination; rendered as an anchor via the RouterAdapter. */
  to: string;
  /** Opens `to` in a new tab. */
  external?: boolean;
  /** Trailing adornment (count, status dot). */
  badge?: ReactNode;
};

export type AppShellNavSection = {
  /** Section heading; collapses to a divider when the rail is collapsed. */
  label?: string;
  items: AppShellNavItem[];
};

export type AppShellProps = {
  // ── Top bar (right of the rail; full width when no rail) ─
  /** Brand mark / wordmark. Shown in the rail header when a rail is present, else in the top bar. */
  brand?: ReactNode;
  /** Inline primary nav (e.g. tabs) shown after the brand in the top bar. */
  nav?: ReactNode;
  /** Centered search slot; grows to fill and is width-capped. */
  search?: ReactNode;
  /** Right-aligned cluster (icon buttons, settings/org picker, …). */
  actions?: ReactNode;
  /** Optional second top-bar row for filters / bulk actions. */
  toolbar?: ReactNode;
  /** Max width of the centered search slot. Defaults to 28rem. */
  searchMaxWidth?: string | number;

  // ── Left nav rail (dark, collapsible, fixed width) ───────
  /** Declarative nav sections rendered into the rail (collapse-aware). */
  navSections?: AppShellNavSection[];
  /** Custom sidebar content; receives the collapsed flag. Overrides navSections. */
  sidebar?: ReactNode | ((collapsed: boolean) => ReactNode);
  /** Pinned below the rail header (e.g. a context switcher). */
  sidebarHeader?: ReactNode;
  /** Pinned to the bottom of the rail (version, account). */
  sidebarFooter?: ReactNode;
  /** Show the collapse toggle. Defaults to true when a rail is present. */
  collapsible?: boolean;
  /** Initial collapsed state (uncontrolled). */
  defaultCollapsed?: boolean;
  /** localStorage key persisting the collapsed state. */
  collapsedStorageKey?: string;
  /** Expanded rail width in px. Defaults to 240. */
  sidebarWidth?: number;
  /** Collapsed rail width in px. Defaults to 56. */
  collapsedWidth?: number;

  // ── Body ─────────────────────────────────────────────────
  /** Fixed header row, left side (breadcrumb, title, tabs). */
  bodyHeader?: ReactNode;
  /** Fixed header row, right side (entity actions) — same row as bodyHeader. */
  bodyActions?: ReactNode;
  /** Optional independent-scroll pane (e.g. a tree). Renders a SplitPane vs body-main. */
  bodySidebar?: ReactNode;
  /** bodySidebar width as a percent when present. Defaults to 24. */
  bodySplit?: number;
  /** Main content (body-main); fills the remaining space and scrolls. */
  children: ReactNode;

  className?: string;
  headerClassName?: string;
  toolbarClassName?: string;
  sidebarClassName?: string;
  bodyHeaderClassName?: string;
  contentClassName?: string;
};

function readStored(key: string | undefined): string | null {
  if (!key || typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

export function AppShell(props: AppShellProps) {
  const {
    brand,
    nav,
    search,
    actions,
    toolbar,
    searchMaxWidth = "28rem",
    navSections,
    sidebar,
    sidebarHeader,
    sidebarFooter,
    collapsible = true,
    defaultCollapsed = false,
    collapsedStorageKey,
    sidebarWidth = 240,
    collapsedWidth = 56,
    bodyHeader,
    bodyActions,
    bodySidebar,
    bodySplit = 24,
    children,
    className,
    headerClassName,
    toolbarClassName,
    sidebarClassName,
    bodyHeaderClassName,
    contentClassName,
  } = props;

  const hasSidebar = sidebar !== undefined || (navSections?.length ?? 0) > 0;

  const [collapsed, setCollapsed] = useState(
    () =>
      readStored(collapsedStorageKey) === "true" ||
      (readStored(collapsedStorageKey) === null && defaultCollapsed),
  );

  useEffect(() => {
    if (collapsedStorageKey && typeof window !== "undefined")
      window.localStorage.setItem(collapsedStorageKey, String(collapsed));
  }, [collapsed, collapsedStorageKey]);

  const railWidth = collapsed ? collapsedWidth : sidebarWidth;
  const hasTopBar =
    (!hasSidebar && brand !== undefined) ||
    nav !== undefined ||
    search !== undefined ||
    actions !== undefined ||
    toolbar !== undefined;
  const hasBodyHeader = bodyHeader !== undefined || bodyActions !== undefined;

  return (
    <div className={cn("flex h-full min-h-0 w-full bg-background", className)}>
      {hasSidebar && (
        <aside
          style={{ width: railWidth }}
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
            sidebarClassName,
          )}
        >
          <div
            className={cn(
              "flex h-14 shrink-0 items-center border-b border-sidebar-border",
              collapsed
                ? "justify-center px-2"
                : "justify-between px-density-3",
            )}
          >
            {!collapsed && brand && (
              <div className="flex min-w-0 items-center gap-2">{brand}</div>
            )}
            {collapsible && (
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon icon={UiSidebar} className="h-4 w-4" />
              </button>
            )}
          </div>
          {sidebarHeader && (
            <div className="shrink-0 border-b border-sidebar-border px-density-3 py-density-2">
              {sidebarHeader}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto py-density-2">
            {typeof sidebar === "function"
              ? sidebar(collapsed)
              : sidebar !== undefined
                ? sidebar
                : navSections && (
                    <NavSections sections={navSections} collapsed={collapsed} />
                  )}
          </div>
          {sidebarFooter && (
            <div className="mt-auto shrink-0 border-t border-sidebar-border px-density-3 py-density-2">
              {sidebarFooter}
            </div>
          )}
        </aside>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {hasTopBar && (
          <header className="shrink-0 border-b border-border bg-card">
            <div
              className={cn(
                "flex h-14 items-center gap-density-3 px-density-4",
                headerClassName,
              )}
            >
              {!hasSidebar && brand && (
                <div className="flex shrink-0 items-center gap-density-2">
                  {brand}
                </div>
              )}
              {nav && <div className="flex shrink-0 items-center">{nav}</div>}
              {search !== undefined && (
                <div className="flex min-w-0 flex-1 justify-center">
                  <div className="w-full" style={{ maxWidth: searchMaxWidth }}>
                    {search}
                  </div>
                </div>
              )}
              {search === undefined && <div className="flex-1" />}
              {actions && (
                <div className="flex shrink-0 items-center gap-density-2">
                  {actions}
                </div>
              )}
            </div>
            {toolbar && (
              <div
                className={cn(
                  "flex items-center gap-density-2 border-t border-border bg-muted px-density-4 py-density-2",
                  toolbarClassName,
                )}
              >
                {toolbar}
              </div>
            )}
          </header>
        )}

        {hasBodyHeader && (
          <div
            className={cn(
              "flex shrink-0 items-start justify-between gap-density-3 border-b border-border bg-card px-density-4 py-density-2",
              bodyHeaderClassName,
            )}
          >
            <div className="min-w-0 flex-1">{bodyHeader}</div>
            {bodyActions && (
              <div className="flex shrink-0 items-center gap-density-2">
                {bodyActions}
              </div>
            )}
          </div>
        )}

        {bodySidebar !== undefined ? (
          <SplitPane
            className="min-h-0 flex-1"
            defaultSplit={bodySplit}
            minLeft={12}
            minRight={30}
            left={bodySidebar}
            right={
              <div className={cn("h-full min-w-0", contentClassName)}>
                {children}
              </div>
            }
            rightClass="overflow-y-auto"
          />
        ) : (
          <main
            className={cn(
              "min-h-0 min-w-0 flex-1 overflow-auto",
              contentClassName,
            )}
          >
            {children}
          </main>
        )}
      </div>
    </div>
  );
}

function NavSections({
  sections,
  collapsed,
}: {
  sections: AppShellNavSection[];
  collapsed: boolean;
}) {
  const { renderLink } = useRouter();
  return (
    <nav
      className={cn(
        "flex flex-col gap-0.5",
        collapsed ? "px-2" : "px-density-2",
      )}
    >
      {sections.map((section, i) => (
        <div key={section.label ?? `section-${i}`} className="flex flex-col">
          {section.label &&
            (collapsed ? (
              <div className="mx-2 mb-1 mt-3 border-t border-sidebar-border first:mt-1" />
            ) : (
              <div className="mb-0.5 mt-3 px-density-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55 first:mt-1">
                {section.label}
              </div>
            ))}
          {section.items.map((item) => (
            <NavItemRow
              key={item.key}
              item={item}
              collapsed={collapsed}
              renderLink={renderLink}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

function NavItemRow({
  item,
  collapsed,
  renderLink,
}: {
  item: AppShellNavItem;
  collapsed: boolean;
  renderLink: RenderLink;
}) {
  const className = cn(
    "flex w-full items-center gap-2.5 rounded-md px-density-2 py-1.5 text-left text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    collapsed && "justify-center px-0",
    item.active && "bg-sidebar-accent font-medium text-sidebar-primary",
  );
  const inner = (
    <>
      {item.icon && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <Icon
            {...(typeof item.icon === "string"
              ? { name: item.icon }
              : { icon: item.icon })}
          />
        </span>
      )}
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge}
    </>
  );
  const title =
    collapsed && typeof item.label === "string" ? item.label : undefined;

  if (item.external) {
    return (
      <a
        href={item.to}
        className={className}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return renderLink({
    key: item.key,
    to: item.to,
    className,
    children: inner,
    ...(title ? { title } : {}),
  });
}
