import type { StaticIconComponent } from "../data/Icon";
import {
  UiActivity,
  UiBoxes,
  UiDatabase,
  UiGlobe,
  UiGraph,
  UiHardDrive,
  UiServer,
  UiSqlDatabase,
  UiTable,
  UiWorkflow,
} from "../icons";

// SURFACE_ICONS maps the opaque icon-name strings the backend emits on each
// surface (x-clicky.surfaces[].icon) to clicky-ui glyph components. The canonical
// vocabulary (database/globe/graph/activity/table) is the contract with the
// backend's icon emitter; aliases are accepted for convenience. Passing the
// resolved component (not the string) to AppShell renders via <Icon icon=.../>
// and never hits the string-name fallback-provider placeholder.
const SURFACE_ICONS: Record<string, StaticIconComponent> = {
  database: UiDatabase,
  sql: UiSqlDatabase,
  "sql-database": UiSqlDatabase,
  server: UiServer,
  "hard-drive": UiHardDrive,
  globe: UiGlobe,
  http: UiGlobe,
  api: UiGlobe,
  graph: UiGraph,
  metrics: UiGraph,
  activity: UiActivity,
  logs: UiActivity,
  boxes: UiBoxes,
  workflow: UiWorkflow,
  table: UiTable,
};

// resolveSurfaceIcon returns the glyph component for a backend icon name, or
// undefined when the name is unknown (the nav item then renders with no icon).
export function resolveSurfaceIcon(
  name: string | undefined,
): StaticIconComponent | undefined {
  if (!name) return undefined;
  return SURFACE_ICONS[name.toLowerCase()];
}
