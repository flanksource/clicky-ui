---
title: Timeseries widgets
description: Poll metrics from URLs or loader functions with TimeseriesPanel, TimeseriesGauge, TimeseriesCoreBars and WorkloadCard.
---

`TimeseriesPanel`, `TimeseriesGauge`, `TimeseriesCoreBars` and `WorkloadCard` (all exported from `@flanksource/clicky-ui/data`) poll metric series and render the latest value, a trend chart, or both.

## QueryClient requirement

The widgets poll with `@tanstack/react-query`'s `useQueries`, so they must render under a `QueryClientProvider`. The provider has to come from the **same copy** of `@tanstack/react-query` that clicky-ui resolves: a provider from a second copy is invisible to the widgets, and they throw `No QueryClient set, use QueryClientProvider to set one`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
```

If the host app depends on `@tanstack/react-query` itself, keep it on a `^5` range compatible with clicky-ui's so the package manager installs a single copy.

## URL-backed series

A series `{ id }` is requested as `baseUrl + id + "?since=<range>"` through the widget's `fetcher` (default: `fetch` + JSON). It is cached under `["timeseries", requestUrl]`.

```tsx
<TimeseriesGauge
  title="CPU"
  baseUrl="/api/v1/metrics/"
  value={{ id: "k8s.deployment.api.cpu.usage" }}
  max={{ id: "k8s.deployment.api.cpu.limit" }}
  fetcher={(url) => apiClient.get(url)}
/>
```

## Function-backed series

Set `load` on a series to load it directly, with no URL involved. `baseUrl` and `fetcher` are then ignored for that series.

```ts
type SeriesLoader = (ctx: {
  range: string;
  signal: AbortSignal;
}) => Promise<TimeseriesResponse>;
```

```tsx
<TimeseriesCoreBars
  title="CPU"
  value={{
    id: "vm-42.cpu",
    load: ({ range, signal }) => api.vmCpu("vm-42", { range, signal }),
  }}
  max={4000}
/>
```

- **The `id` is the cache identity.** A loaded series is cached under `["timeseries", "load", id, range]`, so the id must be unique per data source. Two widgets whose series share an id share one cached response even if their loaders differ, and swapping a loader under the same id does not refetch.
- **`range` is part of the key**, so changing the widget's range loads again.
- **`signal` is react-query's `AbortSignal`**: pass it to `fetch` (or your client) so an in-flight request is cancelled when the query is, for example when the widget unmounts.

`load` works on `value` and `max` of `TimeseriesGauge`/`TimeseriesCoreBars`, on each `series` entry of `TimeseriesPanel`, and on the `WorkloadCard` metrics, which are passed to those widgets.

## Reference lines

`TimeseriesPanel` takes `referenceLines: { value, label, color?, unit? }[]` to draw fixed values, such as a static capacity, as dashed lines with a legend entry.

## WorkloadCard for non-Kubernetes workloads

`workload.kind` is optional. Anything that isn't a Kubernetes resource sets a free-form `type` label (shown where the kind label would be), an `icon`, and `metadata`, a list of `{ label, value }` pairs rendered in the subtitle row after the built-ins (`namespace`, `role`, `replicas`, `createdAt`).

```tsx
<WorkloadCard
  workload={{
    type: "EC2 instance",
    name: "build-runner-1",
    status: { label: "running", health: "healthy" },
    metadata: [
      { label: "region", value: "us-east-1" },
      { label: "size", value: "m6i.large" },
    ],
  }}
  metrics={{
    cpu: { value: { id: "i-0a1b2c3d.cpu", load: loadCpu }, max: 4000 },
    memory: {
      value: { id: "i-0a1b2c3d.memory", load: loadMemory },
      max: 16 * 1024 ** 3,
    },
  }}
  headerActions={<RestartButton />}
/>
```

- The status tone comes from `status.health` only: `healthy` → success, `warning` → warning, `unhealthy` → danger, anything else → neutral. Set `status.tone` to override it. The badge text (`label`, else `code`, else `health`) never changes the tone.
- Memory renders one bar per GiB.
- The history modal plots each metric with its `max`: a series-backed max as a second series, a numeric max as a flat "capacity" line (`maxLabel` renames it).
- `className` is merged last with `cn()`, so it can override the card's border, padding and background.
- `headerActions` renders caller-owned controls beside the status badge.
