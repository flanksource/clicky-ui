import type { MouseEvent } from "react";
import type {
  PostExtension,
  PreExtension,
} from "../components/json-schema-form-runtime-types";
import { createUnitFormExtensions } from "../components/unit-form-extension";
import type { ResolvedOperation } from "../rpc/types";
import { connectionLoggingFormExtensions } from "./connectionLogging";

/** JsonSchemaForm extensions a host adds to the connection form. */
export type ConnectionFormExtensions = {
  pre?: PreExtension[];
  post?: PostExtension[];
};

const unitFormExtensions = createUnitFormExtensions();

/**
 * The connection form's extensions: the unit-aware inputs (`x-clicky-unit`)
 * and the logging policy editor the connection schema always uses, around
 * whatever pickers the host adds (the query app's namespace and secret
 * selectors). A host without such pickers adds none, and the hinted fields
 * render as the plain controls their schema type implies.
 */
export function connectionFormExtensions(
  host: ConnectionFormExtensions = {},
): Required<ConnectionFormExtensions> {
  return {
    pre: [
      ...unitFormExtensions.pre,
      ...(host.pre ?? []),
      ...connectionLoggingFormExtensions.pre,
    ],
    post: [...(host.post ?? []), ...connectionLoggingFormExtensions.post],
  };
}

export const createConnectionAction: ResolvedOperation = {
  path: "/connection",
  method: "post",
  operation: { operationId: "connection_create", summary: "Add Connection" },
};

export const updateConnectionAction: ResolvedOperation = {
  path: "/connection/{id}",
  method: "put",
  operation: { operationId: "connection_update", summary: "Update connection" },
};

/**
 * A connection the service refuses to save or delete (405): a virtual one from
 * a read-only provider such as a host's config file, or one flagged read-only.
 */
export function isReadOnlyConnection(connection: Record<string, unknown>): boolean {
  return connection.virtual === true || connection.read_only === true;
}

/**
 * Only a plain left click selects in place; modified and middle clicks fall
 * through to the browser so "open in new tab" keeps working on the row's href.
 */
export function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
