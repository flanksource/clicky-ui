import { useEffect, useMemo } from "react";
import { ThemeSwitcher } from "../components/theme-switcher";
import type { ClickyCommandRuntime, ClickyResolvedCommand } from "../data/Clicky";
import { getClickySurfaces, makeSurfaceDefinition } from "./clickyMetadata";
import type { RenderLink } from "./EndpointList";
import { OperationCatalog } from "./OperationCatalog";
import { OperationCommandPage } from "./OperationCommandPage";
import { OperationEntityPage } from "./OperationEntityPage";
import type { ClickySurface } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { useOperations } from "./useOperations";

export type EntityExplorerAppProps = {
  client: OperationsApiClient;
  pathname: string;
  renderLink: RenderLink;
  basePath?: string;
  showApiExplorer?: boolean;
};

export function EntityExplorerApp({
  client,
  pathname,
  renderLink,
  basePath = "",
  showApiExplorer = true,
}: EntityExplorerAppProps) {
  const { spec } = useOperations(client);
  const surfaces = useMemo(() => getClickySurfaces(spec), [spec]);
  const defaultSurface = useMemo(
    () => surfaces.find((surface) => !surface.admin) ?? surfaces[0],
    [surfaces],
  );
  const relativePath = useMemo(() => stripBasePath(pathname, basePath), [basePath, pathname]);
  const route = useMemo(() => parseExplorerRoute(relativePath), [relativePath]);
  const resolvedRoute = useMemo(() => resolveRouteSurface(route, surfaces), [route, surfaces]);
  const commandRuntime = useMemo<ClickyCommandRuntime>(
    () => ({
      client,
      hrefForCommand: (resolved) => buildCommandHref(basePath, resolved),
      onNavigate: (resolved) => {
        const href = buildCommandHref(basePath, resolved);
        if (!href || typeof window === "undefined") return;
        window.history.pushState(window.history.state, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
    }),
    [basePath, client],
  );
  const { initialValues: commandInitialValues, autoRun: commandAutoRun } = useMemo(
    () => (resolvedRoute.kind === "command" ? readCommandQueryParams() : { initialValues: {}, autoRun: false }),
    [resolvedRoute.kind, pathname],
  );
  const explorerDefinition = useMemo(
    () => ({
      key: "explorer",
      title: "API Explorer",
      description: "Every operation exposed by the current OpenAPI spec.",
    }),
    [],
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      defaultSurface == null ||
      relativePath !== "/" ||
      window.location.pathname !== withBasePath(basePath, "/")
    ) {
      return;
    }

    const target = withBasePath(basePath, `/${defaultSurface.key}`);
    window.history.replaceState(window.history.state, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [basePath, defaultSurface, relativePath]);

  return (
    <div className="flex h-full">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-muted/30 p-4">
        <div className="mb-6">
          <div className="text-sm font-semibold">{spec?.info.title ?? "Clicky Explorer"}</div>
          <div className="text-xs text-muted-foreground">Metadata-driven entity explorer</div>
        </div>
        <nav className="flex flex-col gap-1">
          {surfaces.map((surface) =>
            renderLink({
              key: surface.key,
              to: withBasePath(basePath, `/${surface.key}`),
              className: navLinkClassName(isSurfaceRouteActive(resolvedRoute, surface.key)),
              children: surface.title,
            }),
          )}
          {showApiExplorer &&
            renderLink({
              key: explorerDefinition.key,
              to: withBasePath(basePath, "/explorer"),
              className:
                navLinkClassName(
                  resolvedRoute.kind === "explorer" || resolvedRoute.kind === "command",
                ),
              children: explorerDefinition.title,
            })}
        </nav>
        <div className="mt-auto pt-4">
          <ThemeSwitcher />
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {resolvedRoute.kind === "surface" ? (
          resolvedRoute.surface ? (
            <OperationCatalog
              definition={makeSurfaceDefinition(resolvedRoute.surface)}
              entities={[resolvedRoute.surface.entity]}
              client={client}
              renderLink={renderLink}
              surfaceKey={resolvedRoute.surface.key}
              commandRuntime={commandRuntime}
            />
          ) : (
            <UnknownSurface surfaceKey={resolvedRoute.surfaceKey} />
          )
        ) : resolvedRoute.kind === "entity" ? (
          resolvedRoute.surface ? (
            <OperationEntityPage
              definition={makeSurfaceDefinition(resolvedRoute.surface)}
              entities={[resolvedRoute.surface.entity]}
              client={client}
              renderLink={renderLink}
              surfaceKey={resolvedRoute.surface.key}
              backHref={withBasePath(basePath, `/${resolvedRoute.surface.key}`)}
              backLabel={`Back to ${resolvedRoute.surface.title}`}
              commandRuntime={commandRuntime}
              {...(resolvedRoute.id ? { id: resolvedRoute.id } : {})}
            />
          ) : (
            <UnknownSurface surfaceKey={resolvedRoute.surfaceKey} />
          )
        ) : resolvedRoute.kind === "command" ? (
          <OperationCommandPage
            client={client}
            backHref={withBasePath(basePath, "/explorer")}
            backLabel="Back to API Explorer"
            renderLink={renderLink}
            commandRuntime={commandRuntime}
            initialValues={commandInitialValues}
            autoRun={commandAutoRun}
            {...(resolvedRoute.operationId ? { operationId: resolvedRoute.operationId } : {})}
          />
        ) : resolvedRoute.kind === "explorer" ? (
          <OperationCatalog
            definition={explorerDefinition}
            entities={[]}
            allOperations
            client={client}
            renderLink={renderLink}
            commandRuntime={commandRuntime}
          />
        ) : defaultSurface == null ? (
          <div className="text-sm text-muted-foreground">Loading surfaces…</div>
        ) : (
          <div className="text-sm text-muted-foreground">Redirecting…</div>
        )}
      </main>
    </div>
  );
}

type ExplorerRoute =
  | { kind: "root" }
  | { kind: "explorer" }
  | { kind: "command"; operationId?: string }
  | { kind: "surface"; surfaceKey: string; surface?: ClickySurface }
  | {
      kind: "entity";
      surfaceKey: string;
      surface?: ClickySurface;
      id?: string;
    };

function parseExplorerRoute(pathname: string): ExplorerRoute {
  const normalized = trimTrailingSlash(pathname) || "/";
  if (normalized === "/") {
    return { kind: "root" };
  }

  const segments = normalized.replace(/^\/+/, "").split("/");
  if (segments[0] === "explorer") {
    return { kind: "explorer" };
  }
  if (segments[0] === "commands") {
    return segments[1]
      ? { kind: "command", operationId: segments[1] }
      : { kind: "command" };
  }
  const surfaceKey = segments[0] ?? "";
  if (segments[1]) {
    return {
      kind: "entity",
      surfaceKey,
      id: decodeURIComponent(segments[1]),
    };
  }
  return { kind: "surface", surfaceKey };
}

function resolveRouteSurface(route: ExplorerRoute, surfaces: ClickySurface[]): ExplorerRoute {
  if (route.kind !== "surface" && route.kind !== "entity") {
    return route;
  }
  const surface = surfaces.find((item) => item.key === route.surfaceKey);
  return surface ? { ...route, surface } : route;
}

function isSurfaceRouteActive(route: ExplorerRoute, surfaceKey: string) {
  return (
    (route.kind === "surface" && route.surfaceKey === surfaceKey) ||
    (route.kind === "entity" && route.surfaceKey === surfaceKey)
  );
}

function navLinkClassName(active: boolean) {
  return [
    "rounded-md px-2 py-1.5 text-sm transition-colors",
    active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent",
  ].join(" ");
}

function stripBasePath(pathname: string, basePath: string) {
  const base = trimTrailingSlash(basePath);
  if (!base || base === "/") {
    return trimTrailingSlash(pathname) || "/";
  }
  if (pathname === base) {
    return "/";
  }
  if (pathname.startsWith(`${base}/`)) {
    return trimTrailingSlash(pathname.slice(base.length)) || "/";
  }
  return trimTrailingSlash(pathname) || "/";
}

function withBasePath(basePath: string, pathname: string) {
  const base = trimTrailingSlash(basePath);
  if (!base || base === "/") {
    return pathname;
  }
  return `${base}${pathname}`;
}

function trimTrailingSlash(value: string) {
  if (!value) return "";
  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

function UnknownSurface({ surfaceKey }: { surfaceKey: string }) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Unknown surface: <code>{surfaceKey}</code>
    </div>
  );
}

const AUTORUN_QUERY_PARAM = "__autoRun";
const ARG_QUERY_PREFIX = "__arg";

function buildCommandHref(basePath: string, resolved: ClickyResolvedCommand): string | undefined {
  const commandId = resolved.operation?.operation.operationId ?? resolved.request.command;
  if (!commandId) return undefined;

  const meta = resolved.operation?.operation["x-clicky"];
  const args = resolved.request.args ?? [];
  const flags = resolved.request.flags ?? {};

  // Entity `get` commands route to the surface detail URL: /<surface>/<id>?<flags>
  if (meta?.verb === "get" && meta?.scope === "entity" && meta.surface && args[0]) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(flags)) {
      if (value !== undefined && value !== "") {
        search.set(key, value);
      }
    }
    const query = search.toString();
    const suffix = query ? `?${query}` : "";
    return withBasePath(basePath, `/${encodeURIComponent(meta.surface)}/${encodeURIComponent(args[0])}${suffix}`);
  }

  const search = new URLSearchParams();
  args.forEach((value, index) => {
    if (value !== undefined && value !== "") {
      search.set(`${ARG_QUERY_PREFIX}${index}`, value);
    }
  });
  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }
  if (resolved.request.autoRun) {
    search.set(AUTORUN_QUERY_PARAM, "1");
  }

  const query = search.toString();
  const suffix = query ? `?${query}` : "";
  return withBasePath(basePath, `/commands/${encodeURIComponent(commandId)}${suffix}`);
}

function readCommandQueryParams(): { initialValues: Record<string, string>; autoRun: boolean } {
  if (typeof window === "undefined") {
    return { initialValues: {}, autoRun: false };
  }
  const search = new URLSearchParams(window.location.search);
  const initialValues: Record<string, string> = {};
  let autoRun = false;
  const positional: string[] = [];

  for (const [key, value] of search.entries()) {
    if (key === AUTORUN_QUERY_PARAM) {
      autoRun = value === "1" || value === "true";
      continue;
    }
    if (key.startsWith(ARG_QUERY_PREFIX)) {
      const index = Number.parseInt(key.slice(ARG_QUERY_PREFIX.length), 10);
      if (Number.isFinite(index) && index >= 0) {
        positional[index] = value;
      }
      continue;
    }
    initialValues[key] = value;
  }

  const packedArgs = positional.filter((value) => value !== undefined).join(" ");
  if (packedArgs !== "") {
    initialValues.args = packedArgs;
  }

  return { initialValues, autoRun };
}
