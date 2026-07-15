import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
  className?: string;
};

type WorkspaceTopRightProps = {
  hasLeft: boolean;
  hasRight: boolean;
  slots?: WorkspaceSlots;
  state: WorkspaceLayoutState;
  update: WorkspaceUpdate;
};

function WorkspaceTopRight({
  hasLeft,
  hasRight,
  slots,
  state,
  update,
}: WorkspaceTopRightProps) {
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
  className,
}: WorkspaceProps) {
  validateWorkspacePanes(panes);
  if (value !== undefined && storageKey !== undefined) {
    throw new Error("Workspace cannot combine value with storageKey");
  }
  const [internal, setInternal] = useState(() =>
    storageKey
      ? readWorkspaceLayoutState(storageKey, panes, defaultValue)
      : createWorkspaceLayoutState(panes, defaultValue),
  );
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

  return (
    <div
      className={cn(
        "relative grid min-h-0 w-full grid-cols-1 overflow-auto bg-background md:h-full md:grid-cols-[auto_minmax(0,1fr)_auto] md:grid-rows-[minmax(0,1fr)_auto] md:overflow-hidden",
        className,
      )}
    >
      <WorkspaceTopRight
        hasLeft={groups.left.length > 0}
        hasRight={groups.right.length > 0}
        {...(slots ? { slots } : {})}
        state={state}
        update={update}
      />
      <WorkspaceSideRegion
        location="left"
        panes={groups.left}
        state={state}
        update={update}
      />
      <WorkspaceSingleRegion
        pane={groups.center}
        state={state}
        update={update}
      />
      <WorkspaceSideRegion
        location="right"
        panes={groups.right}
        state={state}
        update={update}
      />
      {groups.bottom && (
        <WorkspaceSingleRegion
          pane={groups.bottom}
          state={state}
          update={update}
        />
      )}
    </div>
  );
}
