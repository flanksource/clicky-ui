import { useQueries, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import type { SeriesLoader, TimeseriesResponse, TimeseriesServerSeries } from "./TimeseriesPanel.model";
import {
  EMPTY_TIMESERIES_STREAM_GROUP,
  timeseriesStreamAddress,
  timeseriesStreamGroupKey,
  timeseriesStreamInterval,
  useTimeseriesStream,
  type TimeseriesStreamGroupState,
  type TimeseriesStreamRegistration,
} from "./timeseries-stream";

/** Loads a metric by URL; the legacy data path of the timeseries widgets. */
export type TimeseriesFetcher = (url: string) => Promise<TimeseriesResponse>;

/** One series the widgets poll: a metric id, optionally backed by a loader. */
export interface TimeseriesSource {
  id: string;
  load?: SeriesLoader | undefined;
}

export interface TimeseriesQueryOptions {
  /** Prefix for URL-backed sources; ignored by sources with a `load`. */
  baseUrl?: string;
  range: string;
  refreshMs: number;
  fetcher: TimeseriesFetcher;
}

export const defaultTimeseriesFetcher: TimeseriesFetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metrics request failed: ${res.status}`);
  return res.json();
};

/** `baseUrl + id` resolved to a same-origin path with `?since=<range>`. */
export function timeseriesRequestUrl(url: string, range: string): string {
  const u = new URL(url, window.location.origin);
  if (range) u.searchParams.set("since", range);
  return u.pathname + u.search;
}

/**
 * The react-query options for one series. URL-backed sources key on the
 * request URL (unchanged from before loaders existed); loader-backed sources
 * key on `["timeseries", "load", id, range]`, so the id is the cache identity
 * and callers must keep it unique per data source.
 */
export function timeseriesQueryOptions(
  source: TimeseriesSource,
  { baseUrl = "", range, refreshMs, fetcher }: TimeseriesQueryOptions,
): UseQueryOptions<TimeseriesResponse, Error, TimeseriesResponse, readonly unknown[]> {
  const shared = {
    refetchInterval: refreshMs > 0 ? refreshMs : (false as const),
    staleTime: 0,
    retry: 0,
  };
  const { load } = source;
  if (load) {
    return {
      ...shared,
      queryKey: ["timeseries", "load", source.id, range],
      queryFn: ({ signal }: { signal: AbortSignal }) => load({ range, signal }),
    };
  }
  const requestUrl = timeseriesRequestUrl(baseUrl + source.id, range);
  return {
    ...shared,
    queryKey: ["timeseries", requestUrl],
    queryFn: () => fetcher(requestUrl),
  };
}

/** What one requested source resolved to. */
export interface TimeseriesSourceResult {
  /**
   * Every series the source answered with: one for a polled or loaded id,
   * each expansion for a streamed id (possibly none). Undefined until answered.
   */
  series: readonly TimeseriesServerSeries[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const noStream = () => () => {};

function queryResult(id: string, query: UseQueryResult<TimeseriesResponse>): TimeseriesSourceResult {
  const { data } = query;
  return {
    series: data ? [{ id, source: id, points: data.points }] : undefined,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * A streamed source's result, reported under the id the widget requested
 * (which differs from the streamed id for a single-`url` panel).
 */
function streamResult(
  requestedId: string,
  registration: TimeseriesStreamRegistration,
  groups: ReadonlyMap<string, TimeseriesStreamGroupState>,
): TimeseriesSourceResult {
  const group = groups.get(timeseriesStreamGroupKey(registration)) ?? EMPTY_TIMESERIES_STREAM_GROUP;
  const streamedId = registration.id;
  const answered = group.answered.has(streamedId);
  const held = group.bySource.get(streamedId) ?? [];
  const series =
    requestedId === streamedId
      ? held
      : held.map((s) => ({ ...s, source: requestedId, ...(s.id === streamedId ? { id: requestedId } : {}) }));
  return {
    series: answered ? series : undefined,
    isLoading: !answered && group.error === null,
    error: group.error,
  };
}

const NO_GROUPS: ReadonlyMap<string, TimeseriesStreamGroupState> = new Map();

/**
 * Reads every source; results are index-aligned with `sources`. Under a
 * {@link TimeseriesStreamProvider} the URL-backed sources of a live widget
 * (`refreshMs > 0`) come from their stream group (see
 * {@link timeseriesStreamAddress}); sources with a `load`, and every source
 * outside a provider, are fetched per source and re-polled every `refreshMs`.
 */
export function useTimeseriesQueries(
  sources: readonly TimeseriesSource[],
  options: TimeseriesQueryOptions,
): TimeseriesSourceResult[] {
  const stream = useTimeseriesStream();
  const { range } = options;
  const interval = timeseriesStreamInterval(options.refreshMs);
  const registrations = sources.map((source): TimeseriesStreamRegistration | null => {
    if (!stream || interval === null || source.load) return null;
    const address = timeseriesStreamAddress(options.baseUrl ?? "", source.id);
    return address ? { ...address, range, interval } : null;
  });
  const queries = useQueries({
    queries: sources.map((source, i) => ({
      ...timeseriesQueryOptions(source, options),
      enabled: registrations[i] === null,
    })),
  });

  const registrationsKey = JSON.stringify(registrations.filter((r) => r !== null));
  useEffect(() => {
    const active = JSON.parse(registrationsKey) as TimeseriesStreamRegistration[];
    if (!stream || active.length === 0) return;
    const unregister = active.map((registration) => stream.register(registration));
    return () => unregister.forEach((off) => off());
  }, [stream, registrationsKey]);

  const groups = useSyncExternalStore(
    stream ? stream.subscribe : noStream,
    () => (stream ? stream.getSnapshot() : NO_GROUPS),
  );

  return sources.map((source, i) => {
    const registration = registrations[i];
    return registration
      ? streamResult(source.id, registration, groups)
      : queryResult(source.id, queries[i] as UseQueryResult<TimeseriesResponse>);
  });
}

/**
 * The one series a single-value widget (gauge, core bars) reads from a
 * result: the series whose id is the requested id, else the only series. An
 * id that expanded into several series has no single reading, so it is an
 * error rather than an arbitrary pick.
 */
export function soleSeries(
  id: string,
  result: TimeseriesSourceResult | undefined,
): { data: TimeseriesServerSeries | undefined; error: Error | null } {
  if (!result) return { data: undefined, error: null };
  if (result.error) return { data: undefined, error: result.error };
  const list = result.series ?? [];
  const data = list.find((s) => s.id === id) ?? (list.length === 1 ? list[0] : undefined);
  if (!data && list.length > 1) {
    return { data: undefined, error: new Error(`metric ${id} expanded into ${list.length} series; this widget shows one`) };
  }
  return { data, error: null };
}

/** The value of the last point, or undefined when the series is empty. */
export function latestValue(resp: Pick<TimeseriesResponse, "points"> | undefined): number | undefined {
  const points = resp?.points;
  if (!points || points.length === 0) return undefined;
  return points[points.length - 1]?.value;
}
