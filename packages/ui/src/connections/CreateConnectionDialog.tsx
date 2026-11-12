import { useCallback, useMemo } from "react";
import { Icon } from "../data/Icon";
import { isPlainObject } from "../lib/collections";
import { Modal } from "../overlay/Modal";
import { createOperationsApiClient } from "../rpc/apiClient";
import type { ExecutionResponse } from "../rpc/types";
import { ConnectionFormDialog } from "./ConnectionFormDialog";
import { ConnectionKubernetesContext } from "./ConnectionKubernetesContext";
import { CONNECTION_ERROR_BOX, useConnectionFormExtensions, useConnectionSchema } from "./connectionFormSupport";
import { createConnectionAction } from "./connectionsPageModel";
import { fetchConnectionJson, type ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";
import { ConnectionTestButton } from "./connectionTestButton";
import { connectionRef, connectionTypeLabel, connectionTypeMeta } from "./connectionTypes";

export type CreateConnectionDialogProps = {
  /** Where the commons-db connections service is mounted, e.g. `/api/v1`. */
  apiBase: string;
  /** Fixes the connection type and hides the form's type picker. Omit to let the form's own picker choose. */
  type?: string;
  /** Pre-fills the form, e.g. a suggested name. */
  initialValue?: Record<string, unknown>;
  /** The `connection://` refs already on offer: creating a name+namespace among them is refused. */
  existing?: string[];
  /** Overrides how the form's secret / cluster lookups are fetched. Defaults to `fetch`. */
  fetcher?: ConnectionJsonFetcher;
  onClose: () => void;
  /** Called with the created connection's `connection://[namespace/]name` ref, ready to be selected. */
  onCreated: (ref: string) => void;
};

/**
 * Creates a connection without leaving the form that needs one: the schema form
 * the service serves on `GET {apiBase}/connection`, POSTed to `{apiBase}/connection`.
 * With `type` the form opens on that type's branch with the type fixed; the
 * Kubernetes context sits in the header. Needs a react-query QueryClientProvider.
 */
export function CreateConnectionDialog({
  apiBase,
  type,
  initialValue,
  existing,
  fetcher = fetchConnectionJson,
  onClose,
  onCreated,
}: CreateConnectionDialogProps) {
  const client = useMemo(() => createOperationsApiClient({ baseUrl: apiBase }), [apiBase]);
  const schema = useConnectionSchema(client);
  const { extensions, error: extensionsError } = useConnectionFormExtensions({
    apiBase,
    schema: schema.data,
    fetcher,
    kubernetes: "external",
  });
  const meta = useMemo(() => (schema.data ? connectionTypeMeta(schema.data) : undefined), [schema.data]);
  const start = useMemo(() => ({ ...(type ? { type } : {}), ...initialValue }), [type, initialValue]);
  const taken = useMemo(() => new Set(existing), [existing]);

  const submitBlocker = useCallback(
    (value: Record<string, unknown>) => {
      const name = typeof value.name === "string" ? value.name.trim() : "";
      const namespace = typeof value.namespace === "string" ? value.namespace : "";
      if (!name || !taken.has(connectionRef({ name, namespace }))) return undefined;
      return `A connection named “${name}” already exists in ${namespace || "the default namespace"}.`;
    },
    [taken],
  );

  const saved = useCallback(
    (response: ExecutionResponse) => {
      const created = response.parsed;
      if (!isPlainObject(created) || typeof created.name !== "string" || created.name === "") {
        throw new Error(`POST ${apiBase}/connection did not return the created connection (expected an object with a name)`);
      }
      onCreated(
        connectionRef({
          name: created.name,
          ...(typeof created.namespace === "string" ? { namespace: created.namespace } : {}),
        }),
      );
    },
    [apiBase, onCreated],
  );

  if (extensionsError) {
    return (
      <Modal open onClose={onClose} title="New connection" size="2xl">
        <div className={CONNECTION_ERROR_BOX}>{extensionsError}</div>
      </Modal>
    );
  }

  return (
    <ConnectionFormDialog
      apiBase={apiBase}
      client={client}
      action={createConnectionAction}
      initialValue={start}
      submitLabel="Create and select"
      extensions={extensions}
      {...(type ? { hiddenKeys: ["type"] } : {})}
      submitBlocker={submitBlocker}
      footerActions={({ value, canSubmit }) => <ConnectionTestButton apiBase={apiBase} value={value} canSubmit={canSubmit} />}
      title={({ value, onValueChange }) => {
        const chosen = typeof value?.type === "string" && value.type ? value.type : undefined;
        return (
          <span className="flex items-center gap-2">
            {chosen && <Icon name={meta?.icons[chosen] ?? chosen} className="text-base" />}
            {chosen ? `New ${connectionTypeLabel(chosen, meta?.labels)} connection` : "New connection"}
            {chosen && value && onValueChange && (
              <span className="ml-auto text-sm font-normal">
                <ConnectionKubernetesContext rootValue={value} onRootChange={onValueChange} apiBase={apiBase} fetcher={fetcher} />
              </span>
            )}
          </span>
        );
      }}
      onClose={onClose}
      onSaved={saved}
    />
  );
}
