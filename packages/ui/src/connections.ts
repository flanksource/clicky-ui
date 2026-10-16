/**
 * Connections: the commons-db connection fleet as one UI every host shares.
 *
 * Every piece talks to the commons-db `cmd/query/connections` service under a
 * host-supplied `apiBase` (where the host mounts it, e.g. `/api/v1`):
 * `GET {apiBase}/connections/dashboard`, `POST {apiBase}/connections/health`,
 * `POST {apiBase}/connection/{test|resolve}` and the `connection` entity's CRUD
 * with its JSON Schema on `GET {apiBase}/connection`.
 *
 * - `ConnectionsPage` is the whole screen for a host without EntityExplorerApp.
 * - An EntityExplorerApp host composes the parts instead:
 *   `createConnectionDashboardResultRenderer`, `createConnectionFormActions`
 *   and `connectionLoggingFormExtensions`.
 * - Register `FlanksourceIcon` as the fallback icon provider
 *   (`setFallbackIconProvider(clickyIconProvider(FlanksourceIcon))`) so the
 *   connection-type picker shows each type's icon.
 */
export * from "./connections/ConnectionsPage";
export {
  connectionFormExtensions,
  type ConnectionFormExtensions,
} from "./connections/connectionsPageModel";
export * from "./connections/connectionDashboard";
export * from "./connections/connectionDashboardRow";
export * from "./connections/connectionDashboardModel";
export * from "./connections/connectionDashboardRenderer";
export * from "./connections/connectionHealth";
export * from "./connections/connectionActions";
export * from "./connections/connectionActionTypes";
export * from "./connections/connectionActionStatus";
export * from "./connections/connectionTestButton";
export * from "./connections/connectionTestView";
export * from "./connections/connectionResolveView";
export * from "./connections/connectionErrorView";
export * from "./connections/connectionLogging";
export * from "./connections/iconProvider";
