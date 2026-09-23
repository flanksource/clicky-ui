import { useQueries, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { SeriesLoader, TimeseriesResponse } from "./TimeseriesPanel.model";

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

/** Polls every source in parallel; results are index-aligned with `sources`. */
export function useTimeseriesQueries(
  sources: readonly TimeseriesSource[],
  options: TimeseriesQueryOptions,
): UseQueryResult<TimeseriesResponse>[] {
  return useQueries({
    queries: sources.map((source) => timeseriesQueryOptions(source, options)),
  });
}

/** The value of the last point, or undefined when the series is empty. */
export function latestValue(resp: TimeseriesResponse | undefined): number | undefined {
  const points = resp?.points;
  if (!points || points.length === 0) return undefined;
  return points[points.length - 1]?.value;
}
