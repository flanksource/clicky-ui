---
title: Completed sample Top views
description: Render completed samples as typed tables, CPU flamegraphs and memory treemaps.
---

`TopView` combines source, sample and metric selection with the shared FilterBar and Clicky table. Its host owns fetching and URL state. Use one completed sample for charts and table pages, and build the hierarchy from the full filtered sample before paginating rows.

```tsx
import { TopView, type TopViewState } from "@flanksource/clicky-ui/data";

const initial: TopViewState = {
  source: "", frame: "", metric: "", view: "",
  search: "", zoom: "", paused: false,
};
```

Pass completion metadata through `frames` and the resolved `frame`. A frame has a stable ID, source identity, start/completion times, observed and retained counts, and a capture limit. Keep failed collections separate from completed frames. An older recording with no proven sample boundaries should show the unavailable message and retain a History action.

`metrics` names each available measurement, its unit, and its preferred `view`: `flamegraph`, `treemap` or `table`. `hierarchy` has a metric, unit and root node; every node carries `id`, `label`, exclusive `self`, cumulative `total` and `children`. CPU profiles use flamegraphs, in-use memory uses treemaps, and allocation profiles must be labeled allocated bytes. Process ownership trees must aggregate exclusive process usage once. Never combine distinct sources or incompatible measurement units implicitly.

`state` and `onChange` control source, frame, metric, view, search, zoom and pause. Persist them in the route. On pause or page continuation, pin the exact resolved sample selection. Row inspection should freeze that selection. `onRefresh` reloads the selected data; resuming live is explicit. `tableProps` accepts the shared native filter controls, server sort and pagination. The default detail dialog renders the row's server-provided PrettyFull node.

`WeightedProfile` is also available independently. It accepts `hierarchy`, `mode`, controlled `zoom`, `search` and `onZoom`. It preserves recursion and separate path identities, supports keyboard zoom and breadcrumbs, and validates finite, nonnegative weights and cumulative totals.

The runnable CPU and Memory examples live in Storybook under **Data / Traces / TopView**:

```sh
pnpm --filter storybook dev
pnpm --filter @flanksource/clicky-ui exec vitest run src/data/traces/TopView.test.tsx src/data/traces/weighted-layout.test.ts
```
