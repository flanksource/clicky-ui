import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiClose, UiMenu, UiSidebar } from "../icons";
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
  /** Compact action cluster used in the mobile header. Defaults to `actions`. */
  mobileActions?: ReactNode;
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
  /** Accessible label for the mobile navigation drawer. Defaults to "Navigation". */
  mobileSidebarLabel?: string;

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
    mobileActions,
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
    mobileSidebarLabel = "Navigation",
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(
    () =>
      readStored(collapsedStorageKey) === "true" ||
      (readStored(collapsedStorageKey) === null && defaultCollapsed),
  );

  useEffect(() => {
    if (collapsedStorageKey && typeof window !== "undefined")
      window.localStorage.setItem(collapsedStorageKey, String(collapsed));
  }, [collapsed, collapsedStorageKey]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

  const railWidth = collapsed ? collapsedWidth : sidebarWidth;
  const compactActions = mobileActions ?? actions;
  const hasTopBar =
    (!hasSidebar && brand !== undefined) ||
    nav !== undefined ||
    search !== undefined ||
    actions !== undefined ||
    mobileActions !== undefined ||
    toolbar !== undefined;
  const hasMobileHeader = hasSidebar;
  const hasBodyHeader = bodyHeader !== undefined || bodyActions !== undefined;
  const renderSidebarContent = (collapsedValue: boolean, onNavigate?: () => void) =>
    typeof sidebar === "function"
      ? sidebar(collapsedValue)
      : sidebar !== undefined
        ? sidebar
        : navSections && (
            <NavSections
              sections={navSections}
              collapsed={collapsedValue}
              {...(onNavigate ? { onNavigate } : {})}
            />
          );

  return (
    <div className={cn("flex h-full min-h-0 w-full bg-background", className)}>
      {hasSidebar && (
        <aside
          style={{ width: railWidth }}
          className={cn(
            "hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
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
            {renderSidebarContent(collapsed)}
          </div>
          {sidebarFooter && (
            <div className="mt-auto shrink-0 border-t border-sidebar-border px-density-3 py-density-2">
              {sidebarFooter}
            </div>
          )}
        </aside>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {(hasTopBar || hasMobileHeader) && (
          <header className="shrink-0 border-b border-border bg-card">
            {hasMobileHeader && (
              <div className="flex flex-wrap items-center gap-density-2 px-density-3 py-density-2 md:hidden">
                <button
                  type="button"
                  aria-label={`Open ${mobileSidebarLabel}`}
                  title={mobileSidebarLabel}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Icon icon={UiMenu} className="h-4 w-4" />
                </button>
                {brand && (
                  <div className="flex min-w-0 flex-1 items-center gap-density-2">
                    {brand}
                  </div>
                )}
                {compactActions && (
                  <div className="ml-auto flex min-w-0 shrink items-center justify-end gap-density-2">
                    {compactActions}
                  </div>
                )}
                {search !== undefined && (
                  <div className="basis-full min-w-0">
                    {search}
                  </div>
                )}
                {nav && (
                  <div className="basis-full min-w-0 overflow-x-auto">
                    {nav}
                  </div>
                )}
              </div>
            )}
            <div
              className={cn(
                "hidden h-14 items-center gap-density-3 px-density-4 md:flex",
                !hasSidebar && "flex",
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
                  "flex flex-wrap items-center gap-density-2 border-t border-border bg-muted px-density-3 py-density-2 md:px-density-4",
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
              "flex shrink-0 flex-col items-stretch gap-density-2 border-b border-border bg-card px-density-3 py-density-2 md:flex-row md:items-start md:justify-between md:gap-density-3 md:px-density-4",
              bodyHeaderClassName,
            )}
          >
            <div className="min-w-0 flex-1">{bodyHeader}</div>
            {bodyActions && (
              <div className="flex shrink-0 flex-wrap items-center gap-density-2">
                {bodyActions}
              </div>
            )}
          </div>
        )}

        {bodySidebar !== undefined ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
              <div className="max-h-[40vh] shrink-0 overflow-y-auto border-b border-border bg-background">
                {bodySidebar}
              </div>
              <main
                className={cn(
                  "min-h-0 min-w-0 flex-1 overflow-auto",
                  contentClassName,
                )}
              >
                {children}
              </main>
            </div>
            <SplitPane
              className="hidden min-h-0 flex-1 md:flex"
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
          </>
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
      {hasSidebar && mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="presentation"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={mobileSidebarLabel}
            className={cn(
              "relative z-10 flex h-full w-[min(20rem,85vw)] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl",
              sidebarClassName,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-density-3">
              {brand && <div className="flex min-w-0 items-center gap-2">{brand}</div>}
              <button
                type="button"
                aria-label={`Close ${mobileSidebarLabel}`}
                title="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon icon={UiClose} className="h-4 w-4" />
              </button>
            </div>
            {sidebarHeader && (
              <div className="shrink-0 border-b border-sidebar-border px-density-3 py-density-2">
                {sidebarHeader}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto py-density-2">
              {renderSidebarContent(false, () => setMobileSidebarOpen(false))}
            </div>
            {sidebarFooter && (
              <div className="mt-auto shrink-0 border-t border-sidebar-border px-density-3 py-density-2">
                {sidebarFooter}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function NavSections({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: AppShellNavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
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
              {...(onNavigate ? { onNavigate } : {})}
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
  onNavigate,
}: {
  item: AppShellNavItem;
  collapsed: boolean;
  renderLink: RenderLink;
  onNavigate?: () => void;
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
        onClick={onNavigate}
      >
        {inner}
      </a>
    );
  }
  const link = renderLink({
    key: item.key,
    to: item.to,
    className,
    children: inner,
    ...(title ? { title } : {}),
  });

  if (!onNavigate) return link;
  return (
    <div onClick={onNavigate}>
      {link}
    </div>
  );
}
