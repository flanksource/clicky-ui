import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import type { SharedOperationsApiClient } from "../rpc/apiClient";
import {
  connectionFormExtensions,
  createConnectionAction,
  mergeConnectionFormExtensions,
  type ConnectionFormExtensions,
} from "./connectionsPageModel";
import { connectionSchemaFormExtensions } from "./connectionSchemaFormExtensions";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";

export const CONNECTION_ERROR_BOX =
  "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive";

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * The served connection schema, under the key SchemaActionForm reads, so the
 * page, the editor, the read-only view and the create dialog share one request.
 * `null` means the service served no schema.
 */
export function useConnectionSchema(client: SharedOperationsApiClient) {
  return useQuery<JsonSchemaObject | null>({
    queryKey: ["entity-schema", createConnectionAction.path],
    queryFn: async () => (await client.getSchema(createConnectionAction.path)) ?? null,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}

/**
 * The connection form's extensions for a served schema: the schema-derived
 * pickers (namespace / secret selectors), then the host's own, inside the
 * unit-aware and logging ones every connection form carries. A schema whose
 * source hints are malformed yields `error` rather than a half-built form.
 */
export function useConnectionFormExtensions({
  apiBase,
  schema,
  host,
  fetcher,
  kubernetes,
}: {
  apiBase: string;
  schema: JsonSchemaObject | null | undefined;
  host?: ConnectionFormExtensions | undefined;
  fetcher?: ConnectionJsonFetcher | undefined;
  kubernetes?: "form" | "external" | undefined;
}): { extensions: Required<ConnectionFormExtensions>; error?: string } {
  const derived = useMemo((): { extensions?: Required<ConnectionFormExtensions>; error?: string } => {
    if (!schema) return {};
    try {
      return {
        extensions: connectionSchemaFormExtensions({
          apiBase,
          schema,
          ...(fetcher ? { fetcher } : {}),
          ...(kubernetes ? { kubernetes } : {}),
        }),
      };
    } catch (err) {
      return { error: errorMessage(err) };
    }
  }, [apiBase, schema, fetcher, kubernetes]);
  const extensions = useMemo(
    () => connectionFormExtensions(mergeConnectionFormExtensions(derived.extensions, host)),
    [derived.extensions, host],
  );
  return { extensions, ...(derived.error ? { error: derived.error } : {}) };
}
