import { useEffect, useMemo, type ReactNode } from "react";
import { ThemeSwitcher } from "../components/theme-switcher";
import type { PreExtension, PostExtension } from "../components/json-schema-form-types";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { AppShell, type AppShellNavSection } from "../layout/AppShell";
import { getClickySurfaces, makeSurfaceDefinition } from "./clickyMetadata";
import {
  ARG_QUERY_PREFIX,
  AUTORUN_QUERY_PARAM,
  buildCommandHref,
  trimTrailingSlash,
  withBasePath,
} from "./commandHref";
import { useRouter } from "./router";
import { OperationCatalog } from "./OperationCatalog";
import type { ResultRenderer } from "./OperationResultView";
import { OperationCommandPage } from "./OperationCommandPage";
import { OperationEntityPage } from "./OperationEntityPage";
import type { FormActionsRenderer } from "./SchemaActionForm";
import { resolveSurfaceIcon } from "./surfaceIconMap";
import type { ClickySurface } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { useOperations } from "./useOperations";

export type EntityExplorerAppProps = {
  client: OperationsApiClient;
  basePath?: string;
  showApiExplorer?: boolean;
  /**
   * Custom JsonSchemaForm field extensions applied to every create/edit form the
   * explorer renders — e.g. a SecretKeySelector widget keyed on an
   * `x-clicky-component` schema hint. `pre` transforms a resolved control; `post`
   * can replace the rendered value node with a custom component.
   */
  formExtensions?: { pre?: PreExtension[]; post?: PostExtension[] };
  /**
   * Optional extra footer actions added to every create/edit form (e.g. a
   * connection "Test" split-button). The renderer receives the live form value
   * and the action it submits to, so it can scope itself to a given entity.
   */
  formActions?: FormActionsRenderer;
  /**
   * @deprecated Superseded by per-surface icons emitted by the backend
   * (x-clicky-icon → ClickySurface.icon). AppShell section labels are plain
   * strings, so this group-header icon map is no longer rendered. Kept for
   * source-compatibility only.
   */
  surfaceIcons?: Record<string, ReactNode>;
  /**
   * Optional host override for the result surface. Called where an entity's
   * result table renders, with the current surface key, the raw response, and
   * the default OperationResultView element. Return `defaultView` to keep the
   * standard table, or a custom node (e.g. a LogsTable for trace/log profiles
   * flagged via x-clicky-render). Filtering/sorting policy is the host's choice.
   */
  resultRenderer?: ResultRenderer;
};

// SIDEBAR_COLLAPSED_KEY persists the AppShell rail collapsed flag across reloads.
const SIDEBAR_COLLAPSED_KEY = "clicky-ui:sidebar:collapsed";

export function EntityExplorerApp({
  client,
  basePath = "",
  showApiExplorer = true,
  formExtensions,
  formActions,
  resultRenderer,
}: EntityExplorerAppProps) {
  const formPre = formExtensions?.pre;
  const formPost = formExtensions?.post;
  const { pathname, renderLink, navigate } = useRouter();
  const { spec } = useOperations(client);
  const surfaces = useMemo(() => getClickySurfaces(spec), [spec]);
  const surfaceGroups = useMemo(() => groupSurfacesByParent(surfaces), [surfaces]);
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
        if (!href) return;
        navigate(href);
      },
    }),
    [basePath, client, navigate],
  );
  const { initialValues: commandInitialValues } = useMemo(
    () =>
      resolvedRoute.kind === "command"
        ? readCommandQueryParams()
        : { initialValues: {}, autoRun: false },
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
  const navSections = useMemo<AppShellNavSection[]>(() => {
    const sections: AppShellNavSection[] = surfaceGroups.map((group) => ({
      label: group.label,
      items: group.surfaces.map((surface) => {
        const icon = resolveSurfaceIcon(surface.icon);
        return {
          key: surface.key,
          label: surface.title,
          ...(icon ? { icon } : {}),
          active: isSurfaceRouteActive(resolvedRoute, surface.key),
          to: withBasePath(basePath, `/${surface.key}`),
        };
      }),
    }));
    if (showApiExplorer) {
      sections.push({
        items: [
          {
            key: explorerDefinition.key,
            label: explorerDefinition.title,
            active: resolvedRoute.kind === "explorer" || resolvedRoute.kind === "command",
            to: withBasePath(basePath, "/explorer"),
          },
        ],
      });
    }
    return sections;
  }, [surfaceGroups, basePath, resolvedRoute, showApiExplorer, explorerDefinition]);

  useEffect(() => {
    if (defaultSurface == null || relativePath !== "/") return;
    navigate(withBasePath(basePath, `/${defaultSurface.key}`), { replace: true });
  }, [basePath, defaultSurface, relativePath, navigate]);

  const content = (
    <AppShell
      brand={
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {spec?.info.title ?? "Clicky Explorer"}
          </div>
          <div className="truncate text-xs text-sidebar-foreground/60">
            Metadata-driven entity explorer
          </div>
        </div>
      }
      navSections={navSections}
      sidebarFooter={<ThemeSwitcher />}
      collapsedStorageKey={SIDEBAR_COLLAPSED_KEY}
      contentClassName="p-6"
    >
      {resolvedRoute.kind === "surface" ? (
          resolvedRoute.surface ? (
            <OperationCatalog
              definition={makeSurfaceDefinition(resolvedRoute.surface)}
              entities={[resolvedRoute.surface.entity]}
              client={client}
              renderLink={renderLink}
              surfaceKey={resolvedRoute.surface.key}
              commandRuntime={commandRuntime}
              {...(formPre ? { formPre } : {})}
              {...(formPost ? { formPost } : {})}
              {...(formActions ? { formActions } : {})}
              {...(resultRenderer ? { resultRenderer } : {})}
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
              {...(formPre ? { formPre } : {})}
              {...(formPost ? { formPost } : {})}
              {...(formActions ? { formActions } : {})}
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
            autoRun={true}
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
    </AppShell>
  );

  return content;
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
    return segments[1] ? { kind: "command", operationId: segments[1] } : { kind: "command" };
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

function UnknownSurface({ surfaceKey }: { surfaceKey: string }) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Unknown surface: <code>{surfaceKey}</code>
    </div>
  );
}

const LEGACY_AUTORUN_QUERY_PARAM = "__autoRun";

type SurfaceGroup = {
  parent: string; // the slug; "" for surfaces that declared no parent
  label: string; // display name in the sidebar
  surfaces: ClickySurface[];
};

// groupSurfacesByParent buckets surfaces by their ClickySurface.parent slug,
// preserving the order surfaces appeared in the spec. Surfaces with no parent
// fall into a trailing "" bucket labelled "Other".
function groupSurfacesByParent(surfaces: ClickySurface[]): SurfaceGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, ClickySurface[]>();
  for (const surface of surfaces) {
    const parent = surface.parent ?? "";
    if (!buckets.has(parent)) {
      buckets.set(parent, []);
      order.push(parent);
    }
    buckets.get(parent)!.push(surface);
  }
  return order.map((parent) => ({
    parent,
    label: parent === "" ? "Other" : titleCase(parent),
    surfaces: buckets.get(parent)!,
  }));
}

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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
    if (key === AUTORUN_QUERY_PARAM || key === LEGACY_AUTORUN_QUERY_PARAM) {
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
