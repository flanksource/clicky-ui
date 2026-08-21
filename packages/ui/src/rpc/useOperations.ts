import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationLookupFilter,
  OperationLookupResponse,
  OperationRequestValues,
  ResolvedOperation,
} from "./types";

export interface OperationsApiClient {
  getOpenAPISpec(): Promise<OpenAPISpec>;
  executeCommand(
    path: string,
    method: string,
    params: OperationRequestValues,
    headers?: Record<string, string>,
  ): Promise<ExecutionResponse>;
  lookupFilters?(
    path: string,
    method: string,
    params: OperationRequestValues,
    headers?: Record<string, string>,
  ): Promise<OperationLookupResponse>;
  lookupFilterOptions?(
    path: string,
    method: string,
    filterKey: string,
    query: string,
    // Extra query params merged into the lookup request (e.g. a scope filter
    // derived from a sibling form field). Lets a form-field lookup narrow the
    // option set beyond the search term.
    extraParams?: OperationRequestValues,
  ): Promise<OperationLookupFilter>;
  // getSchema fetches a resource's JSON Schema via content negotiation; undefined
  // when the resource exposes none. submitForm sends a nested JSON body (create
  // POST / update PUT) preserving nested objects and arrays. Both are optional so
  // alternative client implementations can omit schema-driven forms.
  getSchema?(path: string): Promise<JsonSchemaObject | undefined>;
  submitForm?(
    path: string,
    method: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<ExecutionResponse>;
}

export function useOpenAPI(client: OperationsApiClient) {
  return useQuery<OpenAPISpec>({
    queryKey: ["openapi-spec"],
    queryFn: () => client.getOpenAPISpec(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOperations(client: OperationsApiClient) {
  const { data: spec, ...rest } = useOpenAPI(client);

  // Flattening a hundred operations is cheap once and wasteful on every render
  // of every page that reads the catalog — and callers memoize off this array,
  // so a fresh identity re-runs their work too.
  const operations = useMemo<ResolvedOperation[]>(() => {
    if (!spec) return [];
    const resolved: ResolvedOperation[] = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        resolved.push({ path, method, operation });
      }
    }
    return resolved;
  }, [spec]);

  return { operations, spec, ...rest };
}

export function useOperationById(client: OperationsApiClient, operationId: string | undefined) {
  const { operations, ...rest } = useOperations(client);
  const operation = operationId
    ? operations.find((op) => op.operation.operationId === operationId)
    : undefined;
  return { operation, ...rest };
}
