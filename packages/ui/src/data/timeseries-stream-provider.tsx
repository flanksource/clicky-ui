import { useEffect, useMemo, type ReactNode } from "react";
import { useEventSourceFactory } from "../hooks/event-source";
import { createTimeseriesStream, TimeseriesStreamContext } from "./timeseries-stream";

export interface TimeseriesStreamProviderProps {
  /** How long widget (un)registrations coalesce before a group re-subscribes. Defaults to 50ms. */
  debounceMs?: number;
  children?: ReactNode;
}

/**
 * Streams every URL-backed TimeseriesPanel, TimeseriesGauge and
 * TimeseriesCoreBars below it over one subscription per (baseUrl, range,
 * interval) group — `GET {baseUrl}stream?id=…&since=…&interval=…` (clicky
 * `metrics.RegisterStreamRoutes`) — instead of each series polling
 * `{baseUrl}{id}`. Subscriptions open through `useEventSourceFactory()`, so
 * place it inside an `EventSourceProvider` built with `createEventHub()` to
 * share the tab's single hub connection. A single-`url` panel streams from
 * its url's path prefix (see `timeseriesStreamAddress`). Series with a
 * `load`, and widgets with `refreshMs <= 0`, keep fetching on their own.
 *
 * ```tsx
 * const hub = createEventHub({ buildId });
 * <EventSourceProvider value={hub}>
 *   <TimeseriesStreamProvider>{app}</TimeseriesStreamProvider>
 * </EventSourceProvider>
 * ```
 */
export function TimeseriesStreamProvider({ debounceMs, children }: TimeseriesStreamProviderProps) {
  const factory = useEventSourceFactory();
  const stream = useMemo(
    () => createTimeseriesStream({ factory, ...(debounceMs !== undefined ? { debounceMs } : {}) }),
    [factory, debounceMs],
  );
  useEffect(() => () => stream.close(), [stream]);
  return <TimeseriesStreamContext.Provider value={stream}>{children}</TimeseriesStreamContext.Provider>;
}
