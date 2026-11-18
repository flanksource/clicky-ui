import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { isPlainObject } from "../lib/collections";
import { Modal } from "../overlay/Modal";
import { useConfirm } from "../overlay/useConfirm";
import { createOperationsApiClient, type SharedOperationsApiClient } from "../rpc/apiClient";
import { useOperationLookupFetcher } from "../rpc/operationLookupFetcher";
import type { FormActionsRenderer } from "../rpc/SchemaActionForm";
import { ConnectionDashboardSurface } from "./connectionDashboard";
import { ConnectionFormDialog } from "./ConnectionFormDialog";
import {
  CONNECTION_ERROR_BOX,
  errorMessage,
  useConnectionFormExtensions,
  useConnectionSchema,
} from "./connectionFormSupport";
import {
  CONNECTION_DASHBOARD_QUERY_KEY,
  type ConnectionLinkRenderer,
  type ConnectionActionsRenderer,
} from "./connectionDashboardModel";
import { useConnectionDashboard } from "./connectionDashboardQuery";
import { ConnectionTestButton } from "./connectionTestButton";
import {
  createConnectionAction,
  isPlainLeftClick,
  isReadOnlyConnection,
  updateConnectionAction,
  type ConnectionFormExtensions,
} from "./connectionsPageModel";

const CONNECTION_DETAIL_QUERY_KEY = "connection-detail";

export type ConnectionsPageProps = {
	/** Optional actions beside each connection, outside its edit link. */
	renderConnectionActions?: ConnectionActionsRenderer;
  /** Where the commons-db connections service is mounted, e.g. `/api/v1`. */
  apiBase: string;
  /** The connection whose edit dialog is open; the host keeps it in its route. */
  selected?: string;
  /** Called with a row's id when it is clicked, and with undefined to close the editor. */
  onSelect: (id: string | undefined) => void;
  /** The host route of a connection, so a row stays a real link (new tab, copy link). */
  connectionHref: (id: string) => string;
  /** Pickers the host adds to the connection form (e.g. namespace / secret selectors). */
  formExtensions?: ConnectionFormExtensions;
  /** Shown in a read-only connection's view, e.g. where the host lets it be edited instead. */
  readOnlyHint?: ReactNode;
  /**
   * Replaces the dashboard's empty message when there are no connections. `create`
   * opens the Add Connection dialog pre-filled with `initialValue`, e.g. `{ type: "postgres" }`.
   */
  renderEmptyState?: (create: (initialValue?: Record<string, unknown>) => void) => ReactNode;
};

/**
 * ConnectionsPage is the connections screen for a host that does not run
 * EntityExplorerApp: the namespace-laned dashboard, an "Add Connection" dialog
 * over the schema the service serves on `GET {apiBase}/connection`, and — while
 * `selected` names a connection — the same dialog editing it, with Delete. Both
 * dialogs carry the Test / Resolve action, which works on the unsaved draft.
 * A catalog without a connection store hides Add Connection, and a virtual or
 * read-only connection opens as a view with Test / Resolve but no Save or Delete.
 * Needs a react-query QueryClientProvider from the host.
 */
export function ConnectionsPage({
	renderConnectionActions,
  apiBase,
  selected,
  onSelect,
  connectionHref,
  formExtensions,
  readOnlyHint,
  renderEmptyState,
}: ConnectionsPageProps) {
  const [creating, setCreating] = useState<{ initialValue?: Record<string, unknown> }>();
  const dashboard = useConnectionDashboard({ apiBase });
  const catalogReadOnly = dashboard.data?.readOnly === true;
  const queryClient = useQueryClient();
  const client = useMemo(() => createOperationsApiClient({ baseUrl: apiBase }), [apiBase]);
  const schema = useConnectionSchema(client);
  const { extensions, error: schemaExtensionsError } = useConnectionFormExtensions({
    apiBase,
    schema: schema.data,
    host: formExtensions,
  });
  const renderConnectionLink = useCallback<ConnectionLinkRenderer>(
    (connection, link) => (
      <a
        href={connectionHref(connection.id)}
        className={link.className}
        title={link.title}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          onSelect(connection.id);
        }}
      >
        {link.children}
      </a>
    ),
    [connectionHref, onSelect],
  );
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: [CONNECTION_DASHBOARD_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [CONNECTION_DETAIL_QUERY_KEY] }),
    ]);
  const testAction: FormActionsRenderer = ({ value, canSubmit }) => (
    <ConnectionTestButton apiBase={apiBase} value={value} canSubmit={canSubmit} />
  );

  return (
    <div className="space-y-4">
      {dashboard.data && !catalogReadOnly ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setCreating({})}>
            Add Connection
          </Button>
        </div>
      ) : null}
      <ConnectionDashboardSurface
        apiBase={apiBase}
        renderConnectionLink={renderConnectionLink}
        {...(renderConnectionActions ? { renderConnectionActions } : {})}
        {...(renderEmptyState
          ? {
              emptyState: renderEmptyState((initialValue) =>
                setCreating(initialValue ? { initialValue } : {}),
              ),
            }
          : {})}
      />
      {schemaExtensionsError && (creating || selected) ? (
        <Modal open onClose={() => (creating ? setCreating(undefined) : onSelect(undefined))} title="Connection form" size="2xl">
          <div className={CONNECTION_ERROR_BOX}>{schemaExtensionsError}</div>
        </Modal>
      ) : creating && !catalogReadOnly ? (
        <ConnectionFormDialog
          apiBase={apiBase}
          client={client}
          action={createConnectionAction}
          title="Add Connection"
          submitLabel="Add Connection"
          extensions={extensions}
          footerActions={testAction}
          {...(creating.initialValue ? { initialValue: creating.initialValue } : {})}
          onClose={() => setCreating(undefined)}
          onSaved={() => {
            setCreating(undefined);
            void refresh();
          }}
        />
      ) : selected ? (
        <ConnectionEditDialog
          key={selected}
          id={selected}
          apiBase={apiBase}
          client={client}
          extensions={extensions}
          testAction={testAction}
          catalogReadOnly={dashboard.isPending ? undefined : catalogReadOnly}
          readOnlyHint={readOnlyHint}
          onClose={() => onSelect(undefined)}
          onChanged={() => {
            onSelect(undefined);
            void refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ConnectionEditDialog({
  id,
  apiBase,
  client,
  extensions,
  testAction,
  catalogReadOnly,
  readOnlyHint,
  onClose,
  onChanged,
}: {
  id: string;
  apiBase: string;
  client: SharedOperationsApiClient;
  extensions: Required<ConnectionFormExtensions>;
  testAction: FormActionsRenderer;
  /** Undefined until the dashboard answers whether the catalog has a store. */
  catalogReadOnly: boolean | undefined;
  readOnlyHint: ReactNode;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { confirm, dialog } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const detail = useQuery({
    queryKey: [CONNECTION_DETAIL_QUERY_KEY, apiBase, id],
    queryFn: async () => {
      const response = await client.executeCommand(
        updateConnectionAction.path,
        "GET",
        { id },
        { Accept: "application/json" },
      );
      if (!isPlainObject(response.parsed)) {
        throw new Error(`GET ${apiBase}/connection/${id} did not return a connection object`);
      }
      return response.parsed;
    },
    retry: 0,
  });

  if (!detail.data || catalogReadOnly === undefined) {
    return (
      <Modal open onClose={onClose} title="Edit connection" size="2xl">
        {detail.isError ? (
          <div className={CONNECTION_ERROR_BOX}>{errorMessage(detail.error)}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading connection…</div>
        )}
      </Modal>
    );
  }

  const connection = detail.data;
  const name = typeof connection.name === "string" && connection.name ? connection.name : id;

  if (catalogReadOnly || isReadOnlyConnection(connection)) {
    return (
      <ConnectionViewDialog
        apiBase={apiBase}
        client={client}
        connection={connection}
        title={`View ${name}`}
        extensions={extensions}
        hint={readOnlyHint}
        onClose={onClose}
      />
    );
  }

  async function remove() {
    const confirmed = await confirm({
      title: "Delete connection?",
      message: `Delete connection "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;
    setDeleting(true);
    setDeleteError("");
    let failure = "";
    try {
      const response = await client.executeCommand(
        updateConnectionAction.path,
        "DELETE",
        { id },
        { Accept: "application/json" },
      );
      failure = response.error ?? "";
    } catch (err) {
      failure = errorMessage(err);
    }
    setDeleting(false);
    if (failure) setDeleteError(failure);
    else onChanged();
  }

  return (
    <>
      <ConnectionFormDialog
        apiBase={apiBase}
        client={client}
        action={updateConnectionAction}
        lockedValues={{ id }}
        initialValue={connection}
        title={`Edit ${name}`}
        submitLabel="Save"
        extensions={extensions}
        footerActions={(context) => (
          <>
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              disabled={deleting}
              onClick={() => void remove()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            {testAction(context)}
          </>
        )}
        notice={deleteError ? <div className={CONNECTION_ERROR_BOX}>{deleteError}</div> : null}
        onClose={onClose}
        onSaved={onChanged}
      />
      {dialog}
    </>
  );
}

function ConnectionViewDialog({
  apiBase,
  client,
  connection,
  title,
  extensions,
  hint,
  onClose,
}: {
  apiBase: string;
  client: SharedOperationsApiClient;
  connection: Record<string, unknown>;
  title: string;
  extensions: Required<ConnectionFormExtensions>;
  hint: ReactNode;
  onClose: () => void;
}) {
  const lookupFetcher = useOperationLookupFetcher(client);
  const schema = useConnectionSchema(client);
  const missingSchema = schema.data === null;

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <ConnectionTestButton apiBase={apiBase} value={connection} canSubmit />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <p>This connection is read-only: it cannot be saved or deleted here.</p>
          {hint ? <div className="mt-1 text-foreground">{hint}</div> : null}
        </div>
        {schema.data ? (
          <JsonSchemaForm
            schema={schema.data}
            value={connection}
            onChange={rejectReadOnlyEdit}
            readOnly
            pre={extensions.pre}
            post={extensions.post}
            {...(lookupFetcher ? { lookupFetcher } : {})}
          />
        ) : missingSchema ? (
          <div className={CONNECTION_ERROR_BOX}>
            {`GET ${apiBase}/connection served no connection JSON Schema (Accept: application/schema+json).`}
          </div>
        ) : schema.isError ? (
          <div className={CONNECTION_ERROR_BOX}>{errorMessage(schema.error)}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading form…</div>
        )}
      </div>
    </Modal>
  );
}

function rejectReadOnlyEdit(): never {
  throw new Error("a read-only connection view cannot change its value");
}

