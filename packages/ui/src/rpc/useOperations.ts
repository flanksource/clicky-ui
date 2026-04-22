import { useQuery } from "@tanstack/react-query";
import type { ExecutionResponse, OpenAPISpec, ResolvedOperation } from "./types";

export interface OperationsApiClient {
  getOpenAPISpec(): Promise<OpenAPISpec>;
  executeCommand(
    path: string,
    method: string,
    params: Record<string, string>,
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

  const operations: ResolvedOperation[] = [];
  if (spec) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        operations.push({ path, method, operation });
      }
    }
  }

  return { operations, spec, ...rest };
}

export function useOperationById(
  client: OperationsApiClient,
  operationId: string | undefined,
) {
  const { operations, ...rest } = useOperations(client);
  const operation = operationId
    ? operations.find((op) => op.operation.operationId === operationId)
    : undefined;
  return { operation, ...rest };
}
