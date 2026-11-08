import { useMemo } from "react";
import { getClickySurfaces, makeSurfaceDefinition } from "./clickyMetadata";
import { OperationCatalog } from "./OperationCatalog";
import type { ResultRenderer } from "./OperationResultView";
import { useRouter } from "./router";
import type { OperationsApiClient } from "./useOperations";
import { useOperations } from "./useOperations";

export type EntitySurfaceProps = {
  client: OperationsApiClient;
  /** The surface to list, as the OpenAPI spec's `x-clicky.surfaces` keys it. */
  surfaceKey: string;
  resultRenderer?: ResultRenderer;
  paginationMode?: "paged" | "infinite";
};

/**
 * EntitySurface lists one surface wherever a host places it — the same listing,
 * filters and result renderer EntityExplorerApp shows on the surface's own
 * route, embedded in another page (e.g. a connection's logs on its detail page).
 * Filter state lives in the current URL's query string, as it does on the route.
 */
export function EntitySurface({ client, surfaceKey, resultRenderer, paginationMode }: EntitySurfaceProps) {
  const { renderLink } = useRouter();
  const { spec } = useOperations(client);
  const surface = useMemo(
    () => (spec ? getClickySurfaces(spec).find((item) => item.key === surfaceKey) : undefined),
    [spec, surfaceKey],
  );
  if (!spec) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!surface) {
    return (
      <div className="text-sm text-muted-foreground">
        Unknown surface: <code>{surfaceKey}</code>
      </div>
    );
  }
  return (
    <OperationCatalog
      key={surface.key}
      definition={makeSurfaceDefinition(surface)}
      entities={[surface.entity]}
      client={client}
      renderLink={renderLink}
      surfaceKey={surface.key}
      {...(resultRenderer ? { resultRenderer } : {})}
      {...(paginationMode ? { paginationMode } : {})}
    />
  );
}
