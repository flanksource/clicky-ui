import { isPositionalParam, type ExecutionResponse, type ResolvedOperation } from "./types";

// findListEndpoint picks the canonical list operation for a set of
// entities. Clicky-rpc auto-registers `<entity> list` commands and mints
// operationIds of the form `<entity>_list`. Matching exactly on that form
// keeps the default table view deterministic — a non-list GET never gets
// promoted to list by accident.
export function findListEndpoint(
  operations: ResolvedOperation[],
  entities: string[],
): ResolvedOperation | undefined {
  const wanted = new Set(entities.map((e) => `${e}_list`));
  if (wanted.size === 0) return undefined;
  return operations.find(
    (op) =>
      op.method === "get" &&
      !!op.operation.operationId &&
      wanted.has(op.operation.operationId),
  );
}

export function findDetailEndpoint(
  operations: ResolvedOperation[],
): ResolvedOperation | undefined {
  return operations.find(
    (op) =>
      op.method === "get" &&
      op.operation.parameters?.some(
        (p) => p.in === "path" || isPositionalParam(p),
      ),
  );
}

function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

// findDetailEndpointForList prefers the detail GET that belongs to the
// resolved list route. This keeps sibling surfaces that share tags
// (for example `stack_*` and `admin_stack_*`) from cross-contaminating
// default entity-detail routing.
export function findDetailEndpointForList(
  operations: ResolvedOperation[],
  listEndpoint: ResolvedOperation | undefined,
): ResolvedOperation | undefined {
  if (!listEndpoint) {
    return findDetailEndpoint(operations);
  }

  const baseSegments = splitPath(listEndpoint.path);
  const candidates = operations.filter(
    (op) =>
      op.method === "get" &&
      op.path !== listEndpoint.path &&
      op.operation.parameters?.some((p) => p.in === "path" || isPositionalParam(p)),
  );

  const exactChild = candidates.find((op) => {
    const segments = splitPath(op.path);
    if (segments.length !== baseSegments.length + 1) {
      return false;
    }
    return baseSegments.every((segment, index) => segments[index] === segment);
  });

  if (exactChild) {
    return exactChild;
  }

  const descendant = candidates.find((op) => op.path.startsWith(`${listEndpoint.path}/`));
  return descendant ?? findDetailEndpoint(operations);
}

export function parseJsonBody(response: ExecutionResponse | undefined): unknown {
  if (!response) return null;
  const text = response.stdout || response.output || "";
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function normalizeRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
  }
  return [];
}

// filterOperationsByDomain returns operations whose OpenAPI `tags` intersect
// the given entity list. Clicky-rpc's converter stamps the parent command
// name into `op.tags`, so passing the entities that belong to a domain
// yields that domain's operations.
export function filterOperationsByDomain(
  operations: ResolvedOperation[],
  entities: string[],
): ResolvedOperation[] {
  if (entities.length === 0) return [];
  const wanted = new Set(entities);
  return operations.filter((op) =>
    (op.operation.tags ?? []).some((tag) => wanted.has(tag)),
  );
}
