import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { UiSidebar } from "../icons";
import { cn } from "../lib/utils";
import {
  createWorkspaceLayoutState,
  readWorkspaceLayoutState,
  validateWorkspacePanes,
  writeWorkspaceLayoutState,
  type WorkspaceLayoutDefaults,
  type WorkspaceLayoutState,
  type WorkspacePaneSpec,
  type WorkspaceSideArrangements,
  type WorkspaceSideLocation,
} from "./Workspace.model";
import {
  WorkspaceSideRegion,
  WorkspaceSingleRegion,
  type WorkspaceUpdate,
} from "./Workspace.regions";

export type {
  WorkspaceLayoutDefaults,
  WorkspaceLayoutState,
  WorkspacePaneLocation,
  WorkspacePaneSlots,
  WorkspacePaneSpec,
  WorkspaceSideArrangement,
  WorkspaceSideArrangements,
  WorkspaceSideLocation,
} from "./Workspace.model";

export type WorkspaceSlots = {
  topRightActions?: ReactNode;
};

export type WorkspaceProps = {
  panes: WorkspacePaneSpec[];
  value?: WorkspaceLayoutState;
  defaultValue?: WorkspaceLayoutDefaults;
  onValueChange?: (value: WorkspaceLayoutState) => void;
  storageKey?: string;
  slots?: WorkspaceSlots;
  /**
   * Sides the host holds collapsed for now, such as while the center shows something that needs the
   * full width: they render collapsed and lose their toggle, and the layout state keeps how they were.
   */
  collapsedSides?: WorkspaceSideLocation[];
  /**
   * How the panes of each side sit. "stack" (the default) divides one shared region; "columns" puts the
   * side's panes next to each other, each resizable on its own (widths live in `paneWidths`). Below the
   * workspace's `3xl` container width every side stacks.
   */
  sideArrangement?: WorkspaceSideArrangements;
  className?: string;
};

type WorkspaceTopRightProps = {
  hasLeft: boolean;
  hasRight: boolean;
  slots?: WorkspaceSlots;
  state: WorkspaceLayoutState;
  update: WorkspaceUpdate;
  /** Receives the controls' width plus their inset (0 when there are none), so headers underneath can keep clear of them. */
  onReserve: (width: number) => void;
};

// The controls float over the top-right corner, so the header beneath them has to
// know how much room they take; they are measured because `topRightActions`
// is arbitrary content.
function useReportedWidth(onReserve: (width: number) => void) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!node) {
      onReserve(0);
      return;
    }
    const measure = () =>
      onReserve(Math.ceil(node.getBoundingClientRect().width) + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      observer.disconnect();
      onReserve(0);
    };
  }, [node, onReserve]);
  return setNode;
}

function WorkspaceTopRight({
  hasLeft,
  hasRight,
  slots,
  state,
  update,
  onReserve,
}: WorkspaceTopRightProps) {
  const measureRef = useReportedWidth(onReserve);
  if (!hasLeft && !hasRight && !slots?.topRightActions) return null;
  const toggleSide = (location: "left" | "right") =>
    update((current) => ({
      ...current,
      sideCollapsed: {
        ...current.sideCollapsed,
        [location]: !current.sideCollapsed[location],
      },
    }));
  return (
    <div
      ref={measureRef}
      data-testid="workspace-top-right"
      className="absolute right-1 top-1 z-30 flex h-7 items-center gap-1 rounded bg-muted/90 px-1 shadow-sm backdrop-blur"
    >
      {slots?.topRightActions}
      {hasLeft && (
        <button
          type="button"
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-expanded={!state.sideCollapsed.left}
          aria-label={`${state.sideCollapsed.left ? "Expand" : "Collapse"} left side`}
          onClick={() => toggleSide("left")}
        >
          <UiSidebar className="size-4" />
        </button>
      )}
      {hasRight && (
        <button
          type="button"
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-expanded={!state.sideCollapsed.right}
          aria-label={`${state.sideCollapsed.right ? "Expand" : "Collapse"} right side`}
          onClick={() => toggleSide("right")}
        >
          <UiSidebar className="size-4 -scale-x-100" />
        </button>
      )}
    </div>
  );
}

export function Workspace({
  panes,
  value,
  defaultValue = {},
  onValueChange,
  storageKey,
  slots,
  collapsedSides,
  sideArrangement,
  className,
}: WorkspaceProps) {
  validateWorkspacePanes(panes, sideArrangement);
  if (value !== undefined && storageKey !== undefined) {
    throw new Error("Workspace cannot combine value with storageKey");
  }
  const [internal, setInternal] = useState(() =>
    storageKey
      ? readWorkspaceLayoutState(storageKey, panes, defaultValue)
      : createWorkspaceLayoutState(panes, defaultValue),
  );
  const [topRightReserve, setTopRightReserve] = useState(0);
  const seenLocations = useRef(new Set(panes.map((pane) => pane.location)));
  const seenPaneIds = useRef(new Set(panes.map((pane) => pane.id)));
  const state = value ?? internal;
  const groups = useMemo(
    () => ({
      left: panes.filter((pane) => pane.location === "left"),
      center: panes.find(
        (pane) => pane.location === "center",
      ) as WorkspacePaneSpec,
      right: panes.filter((pane) => pane.location === "right"),
      bottom: panes.find((pane) => pane.location === "bottom"),
    }),
    [panes],
  );

  useLayoutEffect(() => {
    const addedLocations = new Set(
      panes
        .map((pane) => pane.location)
        .filter((location) => !seenLocations.current.has(location)),
    );
    const addedPanes = panes.filter(
      (pane) => !seenPaneIds.current.has(pane.id),
    );
    panes.forEach((pane) => {
      seenLocations.current.add(pane.location);
      seenPaneIds.current.add(pane.id);
    });
    if (
      value !== undefined ||
      (addedLocations.size === 0 && addedPanes.length === 0)
    )
      return;
    const defaults = createWorkspaceLayoutState(panes, defaultValue);
    const addedStackHeights = addedPanes.reduce<Record<string, number>>(
      (heights, pane) => {
        if (pane.height !== undefined) heights[pane.id] = pane.height;
        return heights;
      },
      {},
    );
    const addedPaneWidths = addedPanes.reduce<Record<string, number>>(
      (widths, pane) => {
        if (pane.width !== undefined) widths[pane.id] = pane.width;
        return widths;
      },
      {},
    );
    setInternal((current) => ({
      ...current,
      ...(addedLocations.has("left") ? { leftWidth: defaults.leftWidth } : {}),
      ...(addedLocations.has("right")
        ? { rightWidth: defaults.rightWidth }
        : {}),
      ...(addedLocations.has("bottom")
        ? { bottomHeight: defaults.bottomHeight }
        : {}),
      stackHeights: { ...current.stackHeights, ...addedStackHeights },
      paneWidths: { ...current.paneWidths, ...addedPaneWidths },
      collapsed: {
        ...current.collapsed,
        ...Object.fromEntries(
          addedPanes.map((pane) => [pane.id, pane.defaultCollapsed ?? false]),
        ),
      },
    }));
  }, [defaultValue, panes, value]);

  const update = useCallback<WorkspaceUpdate>(
    (change) => {
      const next = change(state);
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange, state, value],
  );

  useEffect(() => {
    if (storageKey && value === undefined)
      writeWorkspaceLayoutState(storageKey, internal);
  }, [internal, storageKey, value]);

  const held = (location: WorkspaceSideLocation) =>
    collapsedSides?.includes(location) ?? false;
  const shown: WorkspaceLayoutState = collapsedSides?.length
    ? {
        ...state,
        sideCollapsed: {
          left: held("left") || state.sideCollapsed.left,
          right: held("right") || state.sideCollapsed.right,
        },
      }
    : state;
  const rightShown = groups.right.length > 0 && !shown.sideCollapsed.right;

  // The regions switch between stacked and side-by-side on the workspace's own
  // width (a container query), so a workspace embedded in a narrow column
  // stacks even on a wide screen. A container cannot query itself, hence the
  // outer box; caller classes size it.
  return (
    <div
      data-slot="workspace"
      className={cn("@container/workspace h-full min-h-0 w-full", className)}
      style={
        {
          "--workspace-top-right-reserve": `${topRightReserve}px`,
        } as CSSProperties
      }
    >
      <div
        className="relative grid h-full min-h-0 w-full grid-cols-1 content-start overflow-auto bg-background @3xl/workspace:grid-cols-[auto_minmax(0,1fr)_auto] @3xl/workspace:grid-rows-[minmax(0,1fr)_auto] @3xl/workspace:content-stretch @3xl/workspace:overflow-hidden"
      >
        <WorkspaceTopRight
          hasLeft={groups.left.length > 0 && !held("left")}
          hasRight={groups.right.length > 0 && !held("right")}
          {...(slots ? { slots } : {})}
          state={state}
          update={update}
          onReserve={setTopRightReserve}
        />
        <WorkspaceSideRegion
          location="left"
          panes={groups.left}
          arrangement={sideArrangement?.left ?? "stack"}
          state={shown}
          update={update}
        />
        <WorkspaceSingleRegion
          pane={groups.center}
          state={state}
          update={update}
          reserveTopRight={rightShown ? "stacked" : "always"}
        />
        <WorkspaceSideRegion
          location="right"
          panes={groups.right}
          arrangement={sideArrangement?.right ?? "stack"}
          state={shown}
          update={update}
          reserveTopRight="wide"
        />
        {groups.bottom && (
          <WorkspaceSingleRegion
            pane={groups.bottom}
            state={state}
            update={update}
          />
        )}
      </div>
    </div>
  );
}
