import {
  useCallback,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

type ResizeHandleProps = {
  orientation: "horizontal" | "vertical";
  value: number;
  min: number;
  max: number;
  pointerFactor: number;
  label: string;
  testId: string;
  className?: string;
  onChange: (value: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function WorkspaceResizeHandle(props: ResizeHandleProps) {
  const {
    orientation,
    value,
    min,
    max,
    pointerFactor,
    label,
    testId,
    className,
    onChange,
  } = props;
  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const start = orientation === "vertical" ? event.clientX : event.clientY;
      const initial = value;
      const onMove = (moveEvent: PointerEvent) => {
        const current =
          orientation === "vertical" ? moveEvent.clientX : moveEvent.clientY;
        onChange(clamp(initial + (current - start) * pointerFactor, min, max));
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.body.style.cursor =
        orientation === "vertical" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [max, min, onChange, orientation, pointerFactor, value],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16;
    const lowerKey = orientation === "vertical" ? "ArrowLeft" : "ArrowUp";
    const upperKey = orientation === "vertical" ? "ArrowRight" : "ArrowDown";
    if (event.key === "Home") onChange(min);
    else if (event.key === "End") onChange(max);
    else if (event.key === lowerKey)
      onChange(clamp(value - step * pointerFactor, min, max));
    else if (event.key === upperKey)
      onChange(clamp(value + step * pointerFactor, min, max));
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      data-testid={testId}
      className={cn(
        "absolute z-20 hidden bg-border transition-colors hover:bg-primary focus-visible:bg-primary focus-visible:outline-none md:block",
        orientation === "vertical"
          ? "top-0 h-full w-1 cursor-col-resize"
          : "left-0 h-1 w-full cursor-row-resize",
        className,
      )}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}

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
        "relative order-2 flex min-h-0 w-full flex-col overflow-hidden border-border md:row-span-2 md:h-full md:w-[var(--workspace-region-width)]",
        location === "left"
          ? "md:order-none md:col-start-1 md:row-start-1 md:border-r"
          : "order-3 md:order-none md:col-start-3 md:row-start-1 md:border-l",
        sideCollapsed && "hidden border-0 md:flex",
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
                  <WorkspaceResizeHandle
                    orientation="horizontal"
                    // Seed from the pane's current flex basis (0 when unsized) so the
                    // drag starts where the divider actually is — no snap on first move.
                    value={state.stackHeights[pane.id] ?? 0}
                    min={pane.minHeight ?? 72}
                    max={pane.maxHeight ?? 640}
                    pointerFactor={stackPointerFactor}
                    label={`Resize ${typeof pane.label === "string" ? pane.label : pane.id}`}
                    testId={`workspace-resize-stack-${pane.id}`}
                    className="bottom-0"
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
        <WorkspaceResizeHandle
          orientation="vertical"
          value={width}
          min={min}
          max={max}
          pointerFactor={location === "left" ? 1 : -1}
          label={`Resize ${location} workspace panes`}
          testId={`workspace-resize-${location}`}
          className={location === "left" ? "right-0" : "left-0"}
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
          ? "order-4 w-full border-t border-border md:order-none md:col-start-2 md:row-start-2 md:h-[var(--workspace-bottom-height)]"
          : "order-1 min-h-80 md:order-none md:col-start-2 md:row-start-1 md:min-h-0",
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
        <WorkspaceResizeHandle
          orientation="horizontal"
          value={state.bottomHeight}
          min={pane.minHeight ?? 96}
          max={pane.maxHeight ?? 640}
          pointerFactor={-1}
          label={`Resize ${typeof pane.label === "string" ? pane.label : pane.id}`}
          testId="workspace-resize-bottom"
          className="top-0"
          onChange={(bottomHeight) =>
            update((current) => ({ ...current, bottomHeight }))
          }
        />
      )}
    </div>
  );
}
