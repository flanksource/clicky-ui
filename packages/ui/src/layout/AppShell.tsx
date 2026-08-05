import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiClose, UiMenu, UiSidebar } from "../icons";
import { useEscapeLayer } from "../overlay/modalStack";
import { SplitPane } from "./SplitPane";
import { AppShellSlotOutlines } from "./AppShell.debug";
import { NavSections, type GroupState } from "./AppShell.nav";
import {
  contentWidthClassName,
  type ContentWidth,
} from "./content-width";

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

export type AppShellNavGroup = {
  /** Stable key; also the key its collapsed state persists under. */
  key: string;
  /** Group heading rendered on the toggle row. */
  label: string;
  /** Leading icon (icon name or component). */
  icon?: string | StaticIconComponent;
  /** Folded on first render until the user toggles it. */
  defaultCollapsed?: boolean;
  /**
   * Keeps the group open regardless of stored state, so a deep-linked
   * destination can never hide under a folder the user collapsed earlier.
   * Mirrors `Tree.revealSelected`: set it on the active item's ancestors.
   */
  forceExpanded?: boolean;
  items: AppShellNavItem[];
  /**
   * Nested sub-groups, rendered after `items` at one further indent. Groups
   * nest arbitrarily, so a backend hierarchy deeper than two levels does not
   * have to be flattened to fit the rail.
   */
  groups?: AppShellNavGroup[];
  /**
   * Makes the group's own heading row a destination as well as a disclosure:
   * the label becomes a nav link and the chevron sits beside it as a separate
   * control. Needed wherever a node is both a folder and a leaf — e.g. a
   * profile named `jms` that is runnable *and* the parent of `jms.incoming`.
   */
  item?: AppShellNavItem;
};

export type AppShellNavSection = {
  /** Section heading; collapses to a divider when the rail is collapsed. */
  label?: string;
  items?: AppShellNavItem[];
  /** Collapsible groups rendered after the flat items. High-cardinality
   *  clusters (provider surfaces, per-ledger journals) belong here so they can
   *  be folded away; a collapsed rail flattens them back to plain items. */
  groups?: AppShellNavGroup[];
  /**
   * How the groups read.
   *
   * `"list"` (the default) styles each group heading as a small uppercase
   * cluster label — right for a handful of named clusters under one section.
   *
   * `"tree"` styles headings as ordinary nav rows, because in a tree a folder
   * sits at the same level as its sibling destinations: a group carrying an
   * `item` renders as a link either way, so an uppercase heading beside it
   * would make two nodes of the same kind look like different things.
   */
  variant?: "list" | "tree";
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
  /** localStorage key persisting per-group collapsed state. */
  groupCollapsedStorageKey?: string;
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
  /** Centers content at responsive wide breakpoints, or allows it to fill the workspace. */
  contentWidth?: ContentWidth;

  /**
   * Outlines every slot in its own colour and labels it with its `data-slot`
   * name — a layout-debugging aid for working out which region owns a given
   * area or scrollbar. Uses `outline`, so enabling it does not shift layout.
   */
  debugSlots?: boolean;

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

const DEFAULT_GROUP_COLLAPSE_KEY = "clicky-ui:app-shell:groups";

function readGroupState(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

// Lives here rather than in AppShell.nav so a single instance can be shared by
// both NavSections renders (rail + mobile drawer).
function useGroupCollapsed(storageKey: string): GroupState {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    readGroupState(storageKey),
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Rail state is a UX nicety; private-mode storage failures are safe to swallow.
    }
  }, [state, storageKey]);
  return {
    isCollapsed: (key, fallback) => state[key] ?? fallback,
    toggle: (key, fallback) =>
      setState((prev) => ({ ...prev, [key]: !(prev[key] ?? fallback) })),
  };
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
    groupCollapsedStorageKey,
    sidebarWidth = 240,
    collapsedWidth = 56,
    mobileSidebarLabel = "Navigation",
    bodyHeader,
    bodyActions,
    bodySidebar,
    bodySplit = 24,
    children,
    contentWidth = "contained",
    debugSlots = false,
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

  useEscapeLayer(mobileSidebarOpen, () => setMobileSidebarOpen(false));

  // One instance for the rail AND the mobile drawer: both render NavSections,
  // and per-render state behind a shared storage key would desync.
  const groupState = useGroupCollapsed(
    groupCollapsedStorageKey ?? DEFAULT_GROUP_COLLAPSE_KEY,
  );

  const railWidth = collapsed ? collapsedWidth : sidebarWidth;
  const hasTopBar =
    (!hasSidebar && brand !== undefined) ||
    nav !== undefined ||
    search !== undefined ||
    actions !== undefined ||
    mobileActions !== undefined ||
    toolbar !== undefined;
  const hasMobileHeader = hasSidebar;
  const hasBodyHeader = bodyHeader !== undefined || bodyActions !== undefined;
  const effectiveContentWidth =
    bodySidebar === undefined ? contentWidth : "full";
  const renderSidebarContent = (collapsedValue: boolean, onNavigate?: () => void) =>
    typeof sidebar === "function"
      ? sidebar(collapsedValue)
      : sidebar !== undefined
        ? sidebar
        : navSections && (
            <NavSections
              sections={navSections}
              collapsed={collapsedValue}
              groupState={groupState}
              {...(onNavigate ? { onNavigate } : {})}
            />
          );

  return (
    <div
      className={cn("flex h-full min-h-0 w-full bg-background", className)}
      {...(debugSlots ? { "data-debug-slots": "true" } : {})}
    >
      {debugSlots && <AppShellSlotOutlines />}
      {hasSidebar && (
        <aside
          data-slot="app-shell-sidebar"
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
              <div data-slot="app-shell-brand" className="flex min-w-0 items-center gap-2">
                {brand}
              </div>
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
            <div
              data-slot="app-shell-sidebar-header"
              className="shrink-0 border-b border-sidebar-border px-density-3 py-density-2"
            >
              {sidebarHeader}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto py-density-2">
            {renderSidebarContent(collapsed)}
          </div>
          {sidebarFooter && (
            <div
              data-slot="app-shell-sidebar-footer"
              className="mt-auto shrink-0 border-t border-sidebar-border px-density-3 py-density-2"
            >
              {sidebarFooter}
            </div>
          )}
        </aside>
      )}

      <div
        data-slot="app-shell-column"
        className="@container/app-content flex min-h-0 min-w-0 flex-1 flex-col"
      >
        {(hasTopBar || hasMobileHeader) && (
          <header
            data-slot="app-shell-header"
            className="shrink-0 border-b border-border bg-card"
          >
            <div
              className={cn(
                hasSidebar
                  ? "flex flex-wrap items-center gap-density-2 px-density-3 py-density-2 md:h-14 md:flex-nowrap md:gap-density-3 md:px-density-4 md:py-0"
                  : "flex h-14 items-center gap-density-3 px-density-4",
                headerClassName,
              )}
            >
              {hasSidebar && (
                <button
                  type="button"
                  aria-label={`Open ${mobileSidebarLabel}`}
                  title={mobileSidebarLabel}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent md:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Icon icon={UiMenu} className="h-4 w-4" />
                </button>
              )}
              {brand && (
                <div
                  data-slot="app-shell-brand"
                  className={cn(
                    "min-w-0 items-center gap-density-2",
                    hasSidebar ? "flex flex-1 md:hidden" : "flex shrink-0",
                  )}
                >
                  {brand}
                </div>
              )}
              {nav && (
                <div
                  data-slot="app-shell-nav"
                  className={cn(
                    "flex min-w-0 items-center",
                    hasSidebar &&
                      "order-3 basis-full overflow-x-auto md:order-none md:basis-auto md:overflow-visible",
                  )}
                >
                  {nav}
                </div>
              )}
              {search !== undefined && (
                <div
                  data-slot="app-shell-search"
                  className={cn(
                    "flex min-w-0 flex-1 justify-center",
                    hasSidebar &&
                      "order-2 basis-full md:order-none md:basis-auto md:flex-1",
                  )}
                >
                  <div className="w-full" style={{ maxWidth: searchMaxWidth }}>
                    {search}
                  </div>
                </div>
              )}
              {search === undefined && (
                <div className={cn("flex-1", hasSidebar && "hidden md:block")} />
              )}
              {(actions !== undefined || (hasSidebar && mobileActions !== undefined)) && (
                <div
                  data-slot="app-shell-actions"
                  className={cn(
                    "flex shrink-0 items-center gap-density-2",
                    hasSidebar && "order-1 ml-auto md:order-none md:ml-0",
                  )}
                >
                  {!hasSidebar || mobileActions === undefined ? (
                    actions
                  ) : (
                    <>
                      <div className="hidden items-center gap-density-2 md:flex">
                        {actions}
                      </div>
                      <div className="flex items-center gap-density-2 md:hidden">
                        {mobileActions}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {toolbar && (
              <div
                data-slot="app-shell-toolbar"
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
            data-slot="app-shell-body-header"
            className={cn(
              "shrink-0 border-b border-border bg-card",
              bodyHeaderClassName,
            )}
          >
            <div
              data-slot="app-shell-body-header-content"
              data-content-width={effectiveContentWidth}
              className={cn(
                "flex flex-col items-stretch gap-density-2 px-density-3 py-density-2 md:flex-row md:items-start md:justify-between md:gap-density-3 md:px-density-4",
                contentWidthClassName(effectiveContentWidth),
              )}
            >
              <div className="min-w-0 flex-1">{bodyHeader}</div>
              {bodyActions && (
                <div
                  data-slot="app-shell-body-actions"
                  className="flex shrink-0 flex-wrap items-center gap-density-2"
                >
                  {bodyActions}
                </div>
              )}
            </div>
          </div>
        )}

        {bodySidebar !== undefined ? (
          <SplitPane
            stackOnMobile
            className="min-h-0 flex-1"
            defaultSplit={bodySplit}
            minLeft={12}
            minRight={30}
            left={
              <div
                data-slot="app-shell-body-sidebar"
                className="h-full"
              >
                {bodySidebar}
              </div>
            }
            right={
              <main
                data-slot="app-shell-main"
                className={cn(
                  "h-full min-h-0 min-w-0 overflow-auto",
                  contentClassName,
                )}
              >
                {children}
              </main>
            }
            leftClass="max-h-[40vh] shrink-0 border-b border-border md:max-h-none md:border-b-0"
            rightClass="min-h-0 flex-1 md:flex-none"
          />
        ) : (
          <main
            data-slot="app-shell-main"
            className={cn(
              "min-h-0 min-w-0 flex-1 overflow-auto",
              contentClassName,
            )}
          >
            <div
              data-slot="app-shell-content"
              data-content-width={contentWidth}
              className={cn(contentWidthClassName(contentWidth), "h-full")}
            >
              {children}
            </div>
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
