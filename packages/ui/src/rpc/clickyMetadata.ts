import type {
  ClickyOperationMeta,
  ClickySpecMeta,
  ClickySurface,
  DomainDefinition,
  OpenAPISpec,
  ResolvedOperation,
} from "./types";

export function getClickySpecMeta(spec: OpenAPISpec | undefined): ClickySpecMeta | undefined {
  return spec?.["x-clicky"];
}

export function getClickySurfaces(spec: OpenAPISpec | undefined): ClickySurface[] {
  return getClickySpecMeta(spec)?.surfaces ?? [];
}

export function getOperationClickyMeta(
  operation: Pick<ResolvedOperation, "operation">,
): ClickyOperationMeta | undefined {
  return operation.operation["x-clicky"];
}

export function filterOperationsBySurface(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation[] {
  if (!surfaceKey) return [];
  return operations.filter(
    (operation) => getOperationClickyMeta(operation)?.surface === surfaceKey,
  );
}

export function findSurfaceOperation(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
  predicate: (meta: ClickyOperationMeta) => boolean,
): ResolvedOperation | undefined {
  return filterOperationsBySurface(operations, surfaceKey).find((operation) => {
    const meta = getOperationClickyMeta(operation);
    return meta != null && predicate(meta);
  });
}

export function findSurfaceListOperation(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation | undefined {
  return findSurfaceOperation(
    operations,
    surfaceKey,
    (meta) => meta.verb === "list" && meta.scope === "collection",
  );
}

export function findSurfaceDetailOperation(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation | undefined {
  return findSurfaceOperation(
    operations,
    surfaceKey,
    (meta) => meta.verb === "get" && meta.scope === "entity",
  );
}

export function findSurfaceCollectionActions(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation[] {
  return filterOperationsBySurface(operations, surfaceKey).filter((operation) => {
    const meta = getOperationClickyMeta(operation);
    return meta != null && meta.scope === "collection" && meta.verb !== "list";
  });
}

// findSurfaceActions returns every runnable action on a surface — both
// collection-scoped (e.g. create) and entity-scoped (e.g. update/delete, and
// custom Actions which clicky always annotates scope:"entity"). The action bar
// surfaces these as buttons that open the execution dialog (the dialog collects
// any id the entity-scoped action needs). Only the list and the entity get are
// excluded — they drive the table and the row click-through respectively.
export function findSurfaceActions(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation[] {
  return filterOperationsBySurface(operations, surfaceKey).filter((operation) => {
    const meta = getOperationClickyMeta(operation);
    return meta != null && meta.verb !== "list" && meta.verb !== "get";
  });
}

// surfaceActionLabel prefers the short clicky actionName/verb (capitalized)
// over the OpenAPI summary, which is often a full sentence. Falls back to the
// operationId/path so a button always has a label.
export function surfaceActionLabel(operation: ResolvedOperation): string {
  const meta = getOperationClickyMeta(operation);
  const short = meta?.actionName?.trim() || meta?.verb?.trim();
  if (short && short !== "action") {
    return short.charAt(0).toUpperCase() + short.slice(1);
  }
  return operation.operation.operationId || operation.path;
}

export function findSurfaceEntityActions(
  operations: ResolvedOperation[],
  surfaceKey: string | undefined,
): ResolvedOperation[] {
  return filterOperationsBySurface(operations, surfaceKey).filter((operation) => {
    const meta = getOperationClickyMeta(operation);
    return meta != null && meta.scope === "entity" && meta.verb !== "get";
  });
}

export function makeSurfaceDefinition(surface: ClickySurface): DomainDefinition {
  return {
    key: surface.key,
    title: surface.title,
    description: surface.description || `Manage ${surface.title.toLowerCase()} resources.`,
  };
}
