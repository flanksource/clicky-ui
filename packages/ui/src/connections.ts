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
 *   A catalog the service reports `readOnly` hides Add Connection; a virtual or
 *   read-only connection opens as a view carrying the host's `readOnlyHint`.
 * - An EntityExplorerApp host composes the parts instead:
 *   `createConnectionDashboardResultRenderer`, `createConnectionFormActions`
 *   and `connectionLoggingFormExtensions`.
 * - Register `FlanksourceIcon` as the fallback icon provider
 *   (`setFallbackIconProvider(clickyIconProvider(FlanksourceIcon))`) so the
 *   connection-type picker shows each type's icon.
 * - `ConnectionPicker` picks one connection from the options a lookup returned
 *   (icon, endpoint and badges come from the server), by its `connection://`
 *   ref. `JsonSchemaForm` renders it for a `format: "connection"` lookup field,
 *   and given a `connectionApiBase` its footer opens `CreateConnectionDialog`,
 *   which POSTs a new connection to `{apiBase}/connection` and selects it.
 */
export * from "./connections/ConnectionsPage";
export {
  connectionFormExtensions,
  isReadOnlyConnection,
  mergeConnectionFormExtensions,
  type ConnectionFormExtensions,
} from "./connections/connectionsPageModel";
export {
  ConnectionPicker,
  type ConnectionCreateRequest,
  type ConnectionPickerProps,
} from "./connections/ConnectionPicker";
export {
  CreateConnectionDialog,
  type CreateConnectionDialogProps,
} from "./connections/CreateConnectionDialog";
export {
  ConnectionFormDialog,
  type ConnectionFormDialogProps,
} from "./connections/ConnectionFormDialog";
export {
  useConnectionFormExtensions,
  useConnectionSchema,
} from "./connections/connectionFormSupport";
export {
  connectionRef,
  connectionTypeLabel,
  connectionTypeMeta,
  connectionTypeOfIcon,
  type ConnectionTypeMeta,
} from "./connections/connectionTypes";
export {
  connectionSchemaFormExtensions,
  connectionSecretLoaders,
  connectionSecretSources,
  fetchConnectionJson,
  type ConnectionJsonFetcher,
  type ConnectionSchemaFormExtensionsOptions,
  type ConnectionSecretSources,
} from "./connections/connectionSchemaFormExtensions";
export {
  ConnectionKubernetesContext,
  type ConnectionKubernetesContextProps,
} from "./connections/ConnectionKubernetesContext";
export * from "./connections/connectionDashboard";
export * from "./connections/connectionDashboardQuery";
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
