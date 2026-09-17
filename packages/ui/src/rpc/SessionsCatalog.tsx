import { useMemo } from "react";
import { OperationCatalog, type OperationCatalogProps } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import { InlineError } from "./InlineError";
import { findSurfaceListOperation } from "./clickyMetadata";
import type { ResolvedOperation } from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";

/**
 * The x-clicky surface key commons-db's sessions list operation
 * (`GET /api/v1/sessions`, operationId `list-sessions`) is published under.
 * A host that mounts the sessions API under a different surface passes its
 * own key through `surfaceKey`.
 */
export const SESSIONS_SURFACE_KEY = "sessions";

export type SessionsCatalogProps = {
  client: OperationsApiClient;
  renderLink: RenderLink;
  /** Surface the list operation is tagged with. Defaults to SESSIONS_SURFACE_KEY. */
  surfaceKey?: string;
  /**
   * Filters the host pins, e.g. `{ profile: "trace-capture/jvm_trace",
   * "label.target": "cycle" }` for one target's JVM traces. Sent on every list,
   * lookup and export request; never editable, never in the URL. Every key must
   * be a parameter the list operation declares: once the spec has loaded, an
   * undeclared key renders an error in place of the table.
   */
  lockedValues?: Record<string, string>;
  /**
   * Editable starting filters, applied only where the URL is silent. Keys are
   * checked against the list operation's parameters like `lockedValues`.
   */
  initialValues?: Record<string, string>;
  /** Route of a session's page, given the row's id. */
  getRowDetailHref?: (id: string) => string | undefined;
  urlState?: OperationCatalogProps["urlState"];
  hiddenColumns?: string[];
  /** Heading used in loading and export labels. Defaults to "Sessions". */
  title?: string;
};

// OperationCatalog packs only the values a parameter list names, so an
// undeclared pinned filter would vanish from the request and the table would
// list every session while the host believed it was scoped.
function undeclaredFilterKeys(
  listOperation: ResolvedOperation,
  values: { lockedValues: Record<string, string> | undefined; initialValues: Record<string, string> | undefined },
): string[] {
  const declared = new Set((listOperation.operation.parameters ?? []).map((parameter) => parameter.name));
  return Object.entries(values).flatMap(([prop, record]) =>
    Object.keys(record ?? {})
      .filter((key) => !declared.has(key))
      .map((key) => `${prop} key "${key}"`),
  );
}

export function SessionsCatalog({
  client,
  renderLink,
  surfaceKey = SESSIONS_SURFACE_KEY,
  lockedValues,
  initialValues,
  getRowDetailHref,
  urlState,
  hiddenColumns,
  title = "Sessions",
}: SessionsCatalogProps) {
  const { operations } = useOperations(client);
  const listOperation = useMemo(
    () => findSurfaceListOperation(operations, surfaceKey),
    [operations, surfaceKey],
  );
  const undeclared = listOperation ? undeclaredFilterKeys(listOperation, { lockedValues, initialValues }) : [];
  if (listOperation && undeclared.length > 0) {
    const declared = (listOperation.operation.parameters ?? []).map((parameter) => parameter.name);
    return (
      <InlineError
        title={`${title}: filters the list operation does not declare`}
        error={
          new Error(
            `${undeclared.join(", ")} is not a parameter of ${listOperation.method.toUpperCase()} ${listOperation.path} (declared: ${declared.join(", ") || "none"})`,
          )
        }
      />
    );
  }

  return (
    <OperationCatalog
      definition={{ key: surfaceKey, title, description: "Recorded query sessions" }}
      entities={[]}
      surfaceKey={surfaceKey}
      client={client}
      renderLink={renderLink}
      selectionNoun="sessions"
      {...(lockedValues ? { lockedValues } : {})}
      {...(initialValues ? { initialValues } : {})}
      {...(getRowDetailHref ? { getRowDetailHref } : {})}
      {...(urlState !== undefined ? { urlState } : {})}
      {...(hiddenColumns ? { hiddenColumns } : {})}
    />
  );
}
