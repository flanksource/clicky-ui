import type { ReactNode } from "react";

export type WorkspacePaneLocation = "left" | "center" | "right" | "bottom";
export type WorkspaceSideLocation = "left" | "right";

export type WorkspacePaneSlots = {
  headerLeading?: ReactNode;
  headerTrailing?: ReactNode;
};

export type WorkspacePaneSpec = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  location: WorkspacePaneLocation;
  content: ReactNode;
  slots?: WorkspacePaneSlots;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  collapsible?: boolean;
  resizable?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
};

export type WorkspaceLayoutState = {
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
  stackHeights: Record<string, number>;
  collapsed: Record<string, boolean>;
  sideCollapsed: Record<WorkspaceSideLocation, boolean>;
};

export type WorkspaceLayoutDefaults = Partial<WorkspaceLayoutState>;

export const WORKSPACE_DEFAULT_SIDE_WIDTH = 320;
export const WORKSPACE_DEFAULT_BOTTOM_HEIGHT = 240;
export const WORKSPACE_COLLAPSED_RAIL_WIDTH = 40;

const STORAGE_VERSION = 2;

export function validateWorkspacePanes(panes: WorkspacePaneSpec[]) {
  const ids = new Set<string>();
  for (const pane of panes) {
    if (!pane.id.trim())
      throw new Error("Workspace pane ids must not be empty");
    if (ids.has(pane.id))
      throw new Error(`Workspace pane id ${pane.id} is duplicated`);
    ids.add(pane.id);
    validatePaneDimensions(pane);
  }

  if (panes.filter((pane) => pane.location === "center").length !== 1) {
    throw new Error("Workspace requires exactly one center pane");
  }
  if (panes.filter((pane) => pane.location === "bottom").length > 1) {
    throw new Error("Workspace allows at most one bottom pane");
  }
  validateSharedSideWidth(panes, "left");
  validateSharedSideWidth(panes, "right");
}

function validatePaneDimensions(pane: WorkspacePaneSpec) {
  const values = [
    pane.width,
    pane.height,
    pane.minWidth,
    pane.maxWidth,
    pane.minHeight,
    pane.maxHeight,
  ];
  if (
    values.some(
      (value) => value !== undefined && (!Number.isFinite(value) || value <= 0),
    )
  ) {
    throw new Error(
      `Workspace pane ${pane.id} dimensions must be positive finite numbers`,
    );
  }
  if (
    pane.minWidth !== undefined &&
    pane.maxWidth !== undefined &&
    pane.minWidth > pane.maxWidth
  ) {
    throw new Error(`Workspace pane ${pane.id} minWidth exceeds maxWidth`);
  }
  if (
    pane.minHeight !== undefined &&
    pane.maxHeight !== undefined &&
    pane.minHeight > pane.maxHeight
  ) {
    throw new Error(`Workspace pane ${pane.id} minHeight exceeds maxHeight`);
  }
}

function validateSharedSideWidth(
  panes: WorkspacePaneSpec[],
  location: "left" | "right",
) {
  const widths = new Set(
    panes
      .filter((pane) => pane.location === location && pane.width !== undefined)
      .map((pane) => pane.width),
  );
  if (widths.size > 1) {
    throw new Error(
      `Workspace panes stacked on the ${location} share one width`,
    );
  }
}

export function createWorkspaceLayoutState(
  panes: WorkspacePaneSpec[],
  defaults: WorkspaceLayoutDefaults = {},
): WorkspaceLayoutState {
  const left = panes.find((pane) => pane.location === "left");
  const right = panes.find((pane) => pane.location === "right");
  const bottom = panes.find((pane) => pane.location === "bottom");
  const stackHeights = Object.fromEntries(
    panes
      .filter(
        (pane) =>
          (pane.location === "left" || pane.location === "right") &&
          pane.height !== undefined,
      )
      .map((pane) => [pane.id, pane.height as number]),
  );
  const collapsed = Object.fromEntries(
    panes.map((pane) => [pane.id, pane.defaultCollapsed ?? false]),
  );

  return {
    leftWidth:
      defaults.leftWidth ?? left?.width ?? WORKSPACE_DEFAULT_SIDE_WIDTH,
    rightWidth:
      defaults.rightWidth ?? right?.width ?? WORKSPACE_DEFAULT_SIDE_WIDTH,
    bottomHeight:
      defaults.bottomHeight ??
      bottom?.height ??
      WORKSPACE_DEFAULT_BOTTOM_HEIGHT,
    stackHeights: { ...stackHeights, ...defaults.stackHeights },
    collapsed: { ...collapsed, ...defaults.collapsed },
    sideCollapsed: { left: false, right: false, ...defaults.sideCollapsed },
  };
}

export function readWorkspaceLayoutState(
  storageKey: string,
  panes: WorkspacePaneSpec[],
  defaults: WorkspaceLayoutDefaults,
): WorkspaceLayoutState {
  const fallback = createWorkspaceLayoutState(panes, defaults);
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved) as unknown;
    if (!isStoredWorkspaceState(parsed))
      throw new Error("unsupported workspace layout state");
    const paneIds = new Set(panes.map((pane) => pane.id));
    return createWorkspaceLayoutState(panes, {
      leftWidth: parsed.state.leftWidth,
      rightWidth: parsed.state.rightWidth,
      bottomHeight: parsed.state.bottomHeight,
      stackHeights: filterPaneRecord(parsed.state.stackHeights, paneIds),
      collapsed: filterPaneRecord(parsed.state.collapsed, paneIds),
      sideCollapsed: parsed.state.sideCollapsed,
    });
  } catch (error) {
    console.warn(`Resetting invalid Workspace state for ${storageKey}`, error);
    window.localStorage.removeItem(storageKey);
    return fallback;
  }
}

export function writeWorkspaceLayoutState(
  storageKey: string,
  state: WorkspaceLayoutState,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ version: STORAGE_VERSION, state }),
  );
}

function filterPaneRecord<T>(
  record: Record<string, T>,
  paneIds: Set<string>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).filter(([id]) => paneIds.has(id)),
  );
}

function isStoredWorkspaceState(
  value: unknown,
): value is { version: 2; state: WorkspaceLayoutState } {
  if (!value || typeof value !== "object") return false;
  const stored = value as {
    version?: unknown;
    state?: Partial<WorkspaceLayoutState>;
  };
  const state = stored.state;
  return (
    stored.version === STORAGE_VERSION &&
    Boolean(state) &&
    isPositiveNumber(state?.leftWidth) &&
    isPositiveNumber(state?.rightWidth) &&
    isPositiveNumber(state?.bottomHeight) &&
    isRecord(state?.stackHeights, "number") &&
    isRecord(state?.collapsed, "boolean") &&
    isSideCollapsed(state?.sideCollapsed)
  );
}

function isSideCollapsed(
  value: unknown,
): value is WorkspaceLayoutState["sideCollapsed"] {
  if (!value || typeof value !== "object") return false;
  const sides = value as Partial<WorkspaceLayoutState["sideCollapsed"]>;
  return typeof sides.left === "boolean" && typeof sides.right === "boolean";
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRecord(
  value: unknown,
  valueType: "number" | "boolean",
): value is Record<string, never> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Object.values(value as Record<string, unknown>).every(
      (entry) => typeof entry === valueType,
    )
  );
}
