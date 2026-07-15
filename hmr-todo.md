# Remaining HMR / Fast-Refresh fixes

Status as of 2026-07-02. All lint-gated work is done: `pnpm --filter
@flanksource/clicky-ui exec oxlint . --deny-warnings` reports 0 warnings/errors
across 593 files. `react/only-export-components` (`allowConstantExport: true`)
and `import/no-cycle` are enforced in `packages/ui/.oxlintrc.json`.

The 13 mixed-export splits and 6+ pre-existing lint warnings this doc used to
track (`TimeseriesPanel.tsx`, `CommandForm.tsx`, `Clicky.tsx`, `Icon.tsx`,
`TimeseriesCoreBars.tsx`, `StatusBreakdown.tsx`, `FrameSourceWindow.tsx`, the
`unicorn(no-useless-fallback-in-spread)`/`no-unsafe-optional-chaining`/
`no-thenable` warnings, and the `react(no-children-prop)` error) are all
resolved. One further mixed-export was found and fixed since: `ToolSchemaBrowser.tsx`
had a runtime `export const SchemaBrowser = ToolSchemaBrowser;` alias sitting
next to the component; the alias now lives in the `data/ai/index.ts` barrel
(`export { ToolSchemaBrowser, ToolSchemaBrowser as SchemaBrowser, ... }`)
instead, matching the `rpc/router.tsx` + `RouterProvider.tsx` pattern of
keeping component files exports-only.

## Remaining hygiene: type-only madge cycles

`npx madge --circular --extensions ts,tsx packages/ui/src` still reports 10
cycles, all confirmed `import type`-only (erased at build, cannot break a Fast
Refresh boundary — lint already passes with `import/no-cycle` enabled):

- `rpc/types.ts > data/Clicky.tsx > (FilterForm/formMetadata/useOperations/classify)`
  — hoist `ClickyNode` (and friends) out of `data/Clicky.tsx` into a leaf types
  module referenced by `rpc/types.ts`.
- `data/test-runner/context.ts > data/test-runner/adapter.ts` — hoist shared
  types into `data/test-runner/types.ts`.
- `components/FilterBar.tsx > components/filter-bar-utils.ts`,
  `data/DataTable.tsx > data/data-table-utils.ts`,
  `data/Clicky.tsx > data/clicky-parse.ts`,
  `data/TimeseriesPanel.axes.ts > data/TimeseriesPanel.model.ts` — same
  type-only shape; leave as-is unless someone wants `madge --circular` at 0.

Do this only for `madge --circular` hygiene, not because anything is broken.

## Manual HMR verification — done

Confirmed both Fast Refresh paths hot-update rather than full-reloading:

- **storybook (React)**: edited `ModelSelector.tsx` while `chat-modelselector--default`
  was open — Vite logged `hmr update` (never `full reload`/`page reload`), and
  `read_network_requests` showed only `ModelSelector.tsx` re-fetched with a new
  cache-busting timestamp.
- **kitchen-sink (Preact/prefresh)**: edited `SessionViewer.tsx` while the
  `session-viewer` demo was open — Vite logged
  `hmr update /@fs/.../data/ai/SessionViewer.tsx`; a `window` marker set before
  the edit survived (proving no full reload) and the DOM picked up the edit in
  both rendered instances.

Both edits were reverted after verification.
