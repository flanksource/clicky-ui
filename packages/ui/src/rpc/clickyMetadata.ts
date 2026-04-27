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
