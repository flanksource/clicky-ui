import type { QueryBrowserCompletion } from "../../data/query-browser/QueryBrowser.completion";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  completionForInspection,
  fetchJSON,
  type BrowserInspection,
  type CatalogNode,
  type InspectionCache,
} from "./connectionBrowserModel";

export type InspectionScope = {
  cacheKey: string;
  id: string;
  baseUrl: string;
  enabled: boolean;
  database: string;
  fallbackDatabase?: string;
  target: string;
  targetKind?: string;
};

export type Inspection = {
  data?: BrowserInspection | undefined;
  nodes: CatalogNode[];
  databases: string[];
  activeDatabase: string;
  sqlDatabase: string;
  targetKind: string;
  loading: boolean;
  error: unknown;
  completion?: QueryBrowserCompletion | undefined;
  cache?: InspectionCache | undefined;
  refreshing: boolean;
  refresh: () => void;
};

export function effectiveInspectionDatabase(
  scope: Pick<InspectionScope, "database" | "fallbackDatabase">,
): string {
  return scope.database || scope.fallbackDatabase || "";
}

export function inspectionURL(
  baseUrl: string,
  options: {
    database?: string;
    target?: string;
    targetKind?: string;
    refresh?: boolean;
  } = {},
): string {
  const params = new URLSearchParams();
  if (options.database) params.set("database", options.database);
  if (options.target) params.set("target", options.target);
  if (options.targetKind) params.set("targetKind", options.targetKind);
  if (options.refresh) params.set("refresh", "true");
  const encoded = params.toString();
  return `${baseUrl}/inspect${encoded ? `?${encoded}` : ""}`;
}

export function useInspection(scope: InspectionScope): Inspection {
  const { cacheKey, id, baseUrl } = scope;
  const queryClient = useQueryClient();
  const requestedDatabase = effectiveInspectionDatabase(scope);
  const baseQueryKey = [cacheKey, id, "base", requestedDatabase] as const;
  const base = useQuery({
    queryKey: baseQueryKey,
    queryFn: () =>
      fetchJSON<BrowserInspection>(
        inspectionURL(baseUrl, { database: requestedDatabase }),
      ),
    enabled: scope.enabled,
    retry: 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const data = base.data;
  const targetKind =
    scope.targetKind ??
    data?.targets?.find((target) => target.name === scope.target)?.kind ??
    "";
  const targetEnabled =
    data?.kind === "opensearch" && scope.target !== "" && targetKind !== "";
  const targetQueryKey = [
    cacheKey,
    id,
    "target",
    targetKind,
    scope.target,
  ] as const;
  const target = useQuery({
    queryKey: targetQueryKey,
    queryFn: () =>
      fetchJSON<BrowserInspection>(
        inspectionURL(baseUrl, { target: scope.target, targetKind }),
      ),
    enabled: targetEnabled,
    retry: 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
  const activeDatabase = requestedDatabase || data?.database || "";
  const completion = useMemo(
    () => completionForInspection(data, target.data),
    [data, target.data],
  );
  const activeCache = targetEnabled
    ? (target.data?.cache ?? data?.cache)
    : data?.cache;
  const refresh = useMutation({
    mutationFn: () =>
      fetchJSON<BrowserInspection>(
        inspectionURL(baseUrl, {
          database: requestedDatabase,
          ...(targetEnabled ? { target: scope.target, targetKind } : {}),
          refresh: true,
        }),
      ),
    onSuccess: (refreshed) => {
      queryClient.setQueryData(baseQueryKey, refreshed);
      if (targetEnabled) queryClient.setQueryData(targetQueryKey, refreshed);
    },
  });

  useEffect(() => {
    if (!activeCache?.refreshing) return;
    let cancelled = false;
    let timer = 0;
    const poll = async () => {
      const baseResult = await base.refetch();
      const targetResult = targetEnabled ? await target.refetch() : undefined;
      const cache = targetEnabled
        ? (targetResult?.data?.cache ?? baseResult.data?.cache)
        : baseResult.data?.cache;
      if (!cancelled && cache?.refreshing) {
        timer = window.setTimeout(
          () => void poll(),
          Math.max(500, cache.retryAfterMs ?? 1_000),
        );
      }
    };
    timer = window.setTimeout(
      () => void poll(),
      Math.max(500, activeCache.retryAfterMs ?? 1_000),
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeCache?.refreshing,
    activeCache?.retryAfterMs,
    base.refetch,
    target.refetch,
    targetEnabled,
  ]);

  const active = targetEnabled ? target : base;
  return {
    data,
    nodes: data?.nodes ?? [],
    databases: base.data?.databases ?? [],
    activeDatabase,
    sqlDatabase: data?.kind === "sql" ? activeDatabase : "",
    targetKind,
    loading: active.isLoading && active.data === undefined,
    error: refresh.error ?? active.error ?? base.error,
    completion,
    cache: activeCache,
    refreshing:
      refresh.isPending ||
      base.isFetching ||
      (targetEnabled && target.isFetching),
    refresh: () => refresh.mutate(),
  };
}
