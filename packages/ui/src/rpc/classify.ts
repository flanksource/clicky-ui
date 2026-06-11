import { isPositionalParam, type ExecutionResponse, type ResolvedOperation } from "./types";

// findListEndpoint picks the canonical list operation for a set of
// entities. Clicky-rpc auto-registers `<entity> list` commands and mints
// operationIds of the form `<entity>_list`. Matching exactly on that form
// keeps the default table view deterministic — a non-list GET never gets
// promoted to list by accident.
//
// When a `<entity> list` command is promoted onto the bare entity-root
// (clicky's promoteListToEntityRoot), the collection is exposed instead as
// `GET /api/v1/<entity>` with operationId `<entity>` and no `_list` suffix.
// Fall back to that promoted root when no explicit `<entity>_list` exists.
// A path/positional parameter disqualifies it, so a `<entity>/{id}` detail
// GET can never be mistaken for the listing.
export function findListEndpoint(
  operations: ResolvedOperation[],
  entities: string[],
): ResolvedOperation | undefined {
  if (entities.length === 0) return undefined;
  const listIds = new Set(entities.map((e) => `${e}_list`));
  const explicit = operations.find(
    (op) =>
      op.method === "get" && !!op.operation.operationId && listIds.has(op.operation.operationId),
  );
  if (explicit) return explicit;

  const rootIds = new Set(entities);
  return operations.find(
    (op) =>
      op.method === "get" &&
      rootIds.has(op.operation.operationId ?? "") &&
      !op.operation.parameters?.some((p) => p.in === "path" || isPositionalParam(p)),
  );
}

export function findDetailEndpoint(operations: ResolvedOperation[]): ResolvedOperation | undefined {
  return operations.find(
    (op) =>
      op.method === "get" &&
      op.operation.parameters?.some((p) => p.in === "path" || isPositionalParam(p)),
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
  return operations.filter((op) => {
    if ((op.operation.tags ?? []).some((tag) => wanted.has(tag))) return true;
    // clicky promotes a collection to a bare entity-root GET (operationId
    // `<entity>`, no tag). Include it so the catalog can resolve the listing.
    return op.method === "get" && wanted.has(op.operation.operationId ?? "");
  });
}
