import { type CSSProperties } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { UiChevronDown, UiChevronRight } from "../icons";
import { cn } from "../lib/utils";
import {
  WORKSPACE_COLLAPSED_RAIL_WIDTH,
  type WorkspaceLayoutState,
  type WorkspacePaneSpec,
} from "./Workspace.model";

export type WorkspaceUpdate = (
  change: (current: WorkspaceLayoutState) => WorkspaceLayoutState,
) => void;

type PaneViewProps = {
  pane: WorkspacePaneSpec;
  collapsed: boolean;
  compact: boolean;
  onToggle: () => void;
};

function WorkspacePaneView({
  pane,
  collapsed,
  compact,
  onToggle,
}: PaneViewProps) {
  const headerContent = (
    <>
      {pane.collapsible !== false &&
        (collapsed ? (
          <UiChevronRight className="size-3.5 shrink-0" />
        ) : (
          <UiChevronDown className="size-3.5 shrink-0" />
        ))}
      {pane.slots?.headerLeading}
      {pane.icon && (
        <span className="flex size-4 shrink-0 items-center justify-center">
          {pane.icon}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-semibold",
          compact && "[writing-mode:vertical-rl]",
        )}
      >
        {pane.label}
      </span>
    </>
  );

  return (
    <section
      data-testid={`workspace-pane-${pane.id}`}
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden bg-background",
        collapsed ? "shrink-0" : "flex-1",
        pane.className,
      )}
    >
      {pane.showHeader !== false ? (
        <header
          className={cn(
            "flex h-9 shrink-0 items-center gap-1 border-b border-border bg-muted/40 px-2",
            compact && "h-auto min-h-12 flex-col px-1 py-2",
          )}
        >
          {pane.collapsible === false ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {headerContent}
            </div>
          ) : (
            <button
              type="button"
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1.5 rounded-sm text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                compact && "flex-col",
              )}
              aria-expanded={!collapsed}
              aria-label={`${collapsed ? "Expand" : "Collapse"} ${typeof pane.label === "string" ? pane.label : pane.id}`}
              onClick={onToggle}
            >
              {headerContent}
            </button>
          )}
          {!compact && pane.slots?.headerTrailing && (
            <div className="flex shrink-0 items-center gap-1">
              {pane.slots.headerTrailing}
            </div>
          )}
        </header>
      ) : null}
      {!collapsed && (
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-auto",
            pane.contentClassName,
          )}
        >
          {pane.content}
        </div>
      )}
    </section>
  );
}

type SideRegionProps = {
  location: "left" | "right";
  panes: WorkspacePaneSpec[];
  state: WorkspaceLayoutState;
  update: WorkspaceUpdate;
};

export function WorkspaceSideRegion({
  location,
  panes,
  state,
  update,
}: SideRegionProps) {
  if (panes.length === 0) return null;
  const sideCollapsed = state.sideCollapsed[location];
  const allCollapsed = panes.every((pane) => state.collapsed[pane.id]);
  const width = sideCollapsed
    ? 0
    : allCollapsed
      ? WORKSPACE_COLLAPSED_RAIL_WIDTH
      : location === "left"
        ? state.leftWidth
        : state.rightWidth;
  const min = Math.max(...panes.map((pane) => pane.minWidth ?? 160));
  const max = Math.min(...panes.map((pane) => pane.maxWidth ?? 720));
  const canResize =
    !sideCollapsed &&
    !allCollapsed &&
    panes.some((pane) => pane.resizable !== false);
  const style = { "--workspace-region-width": `${width}px` } as CSSProperties;
  // Open panes flex-share the region, so changing one pane's basis by d moves its
  // rendered edge by only d*(open-1)/open; scale the drag so the handle tracks the cursor.
  const openCount = panes.filter(
    (pane) => !(state.collapsed[pane.id] ?? false),
  ).length;
  const stackPointerFactor = openCount > 1 ? openCount / (openCount - 1) : 1;

  return (
    <aside
      data-testid={`workspace-region-${location}`}
      aria-hidden={sideCollapsed}
      style={style}
      className={cn(
        "relative order-2 flex min-h-0 w-full flex-col overflow-hidden border-border @3xl/workspace:row-span-2 @3xl/workspace:h-full @3xl/workspace:w-[var(--workspace-region-width)]",
        location === "left"
          ? "@3xl/workspace:order-none @3xl/workspace:col-start-1 @3xl/workspace:row-start-1 @3xl/workspace:border-r"
          : "order-3 @3xl/workspace:order-none @3xl/workspace:col-start-3 @3xl/workspace:row-start-1 @3xl/workspace:border-l",
        sideCollapsed && "hidden border-0 @3xl/workspace:flex",
      )}
    >
      {!sideCollapsed &&
        panes.map((pane, index) => {
          const collapsed = state.collapsed[pane.id] ?? false;
          const nextPane = panes[index + 1];
          return (
            <div
              key={pane.id}
              data-testid={`workspace-stack-${pane.id}`}
              className={cn(
                "relative flex min-h-0 flex-col",
                collapsed ? "shrink-0" : "flex-1",
              )}
              style={
                !collapsed && state.stackHeights[pane.id] !== undefined
                  ? { flexBasis: `${state.stackHeights[pane.id]}px` }
                  : undefined
              }
            >
              <WorkspacePaneView
                pane={pane}
                collapsed={collapsed}
                compact={allCollapsed}
                onToggle={() =>
                  update((current) => ({
                    ...current,
                    collapsed: { ...current.collapsed, [pane.id]: !collapsed },
                  }))
                }
              />
              {!collapsed &&
                nextPane &&
                pane.resizable !== false &&
                nextPane.resizable !== false && (
                  <ResizeHandle
                    orientation="horizontal"
                    // Seed from the pane's current flex basis (0 when unsized) so the
                    // drag starts where the divider actually is — no snap on first move.
                    value={state.stackHeights[pane.id] ?? 0}
                    min={pane.minHeight ?? 72}
                    max={pane.maxHeight ?? 640}
                    pointerFactor={stackPointerFactor}
                    label={`Resize ${typeof pane.label === "string" ? pane.label : pane.id}`}
                    testId={`workspace-resize-stack-${pane.id}`}
                    className="bottom-0 hidden @3xl/workspace:block"
                    onChange={(height) =>
                      update((current) => ({
                        ...current,
                        stackHeights: {
                          ...current.stackHeights,
                          [pane.id]: height,
                        },
                      }))
                    }
                  />
                )}
            </div>
          );
        })}
      {canResize && (
        <ResizeHandle
          orientation="vertical"
          value={width}
          min={min}
          max={max}
          pointerFactor={location === "left" ? 1 : -1}
          label={`Resize ${location} workspace panes`}
          testId={`workspace-resize-${location}`}
          className={cn("hidden @3xl/workspace:block", location === "left" ? "right-0" : "left-0")}
          onChange={(nextWidth) =>
            update((current) => ({
              ...current,
              [location === "left" ? "leftWidth" : "rightWidth"]: nextWidth,
            }))
          }
        />
      )}
    </aside>
  );
}

type SingleRegionProps = {
  pane: WorkspacePaneSpec;
  state: WorkspaceLayoutState;
  update: WorkspaceUpdate;
};

export function WorkspaceSingleRegion({
  pane,
  state,
  update,
}: SingleRegionProps) {
  const collapsed = state.collapsed[pane.id] ?? false;
  const isBottom = pane.location === "bottom";
  const style =
    isBottom && !collapsed
      ? ({
          "--workspace-bottom-height": `${state.bottomHeight}px`,
        } as CSSProperties)
      : undefined;
  return (
    <div
      data-testid={`workspace-region-${pane.location}`}
      style={style}
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden",
        isBottom
          ? "order-4 w-full border-t border-border @3xl/workspace:order-none @3xl/workspace:col-start-2 @3xl/workspace:row-start-2 @3xl/workspace:h-[var(--workspace-bottom-height)]"
          : "order-1 min-h-80 @3xl/workspace:order-none @3xl/workspace:col-start-2 @3xl/workspace:row-start-1 @3xl/workspace:min-h-0",
      )}
    >
      <WorkspacePaneView
        pane={pane}
        collapsed={collapsed}
        compact={false}
        onToggle={() =>
          update((current) => ({
            ...current,
            collapsed: { ...current.collapsed, [pane.id]: !collapsed },
          }))
        }
      />
      {isBottom && !collapsed && pane.resizable !== false && (
        <ResizeHandle
          orientation="horizontal"
          value={state.bottomHeight}
          min={pane.minHeight ?? 96}
          max={pane.maxHeight ?? 640}
          pointerFactor={-1}
          label={`Resize ${typeof pane.label === "string" ? pane.label : pane.id}`}
          testId="workspace-resize-bottom"
          className="top-0 hidden @3xl/workspace:block"
          onChange={(bottomHeight) =>
            update((current) => ({ ...current, bottomHeight }))
          }
        />
      )}
    </div>
  );
}
