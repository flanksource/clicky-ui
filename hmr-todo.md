# Remaining HMR / Fast-Refresh fixes

Status as of 2026-06-10. Work streams A1–A3 of the fast-reload plan are done and
committed (`9f753d8`, `6dbea69`): oxlint now enforces
`react/only-export-components` + `import/no-cycle` in `packages/ui/.oxlintrc.json`,
the json-schema-form family is restructured into one-directional layers (recursion
injected via `RenderContext.render`), and the icons barrel cycle is fixed in
`scripts/build-icons.ts`. Most mixed-export splits (A4) are also done:
button/Badge variants, AcceptPicker options, FormatOptionsDropdown options,
SecretKeySelector, use-theme/use-density (providers split out), diagnostics
state-styles, Timestamp → timestamp-format, TagList → tag-utils,
LogsTable/LogDetails → logs-normalize, DataTable → data-table-utils,
FilterBar → filter-bar-utils, WorkloadPicker → workload-picker-utils.

`pnpm lint` (gate: `oxlint . --deny-warnings`) still fails on the items below.

## 1. Mixed-export splits still to do (react/only-export-components, 13 errors)

Pattern: move non-component runtime exports to a sibling `.ts`/`.tsx` utils
module, update importers + the public barrels (`src/data.ts`, `src/rpc.ts`).
Type-only exports may stay.

- `packages/ui/src/data/TimeseriesPanel.tsx` (5)
  - line 24: `export { assignAxes, latestOf }` re-exports — move consumers to
    import from `TimeseriesPanel.axes.ts` directly, drop the re-export.
  - lines 142/174/219: `resolveSeries`, `resolveBreakdown`, `mergeSeries` →
    move into `TimeseriesPanel.axes.ts` (or a new `timeseries-data.ts`)
    together with the `MergedRow`/`ResolvedSeries` types. This also removes
    the madge cycle `TimeseriesPanel.tsx ↔ TimeseriesPanel.axes.ts`.
- `packages/ui/src/rpc/CommandForm.tsx` (3): `normalizeParameters` (332),
  `pathParamNames` (355), `submitValue` (392) → `rpc/command-form-utils.ts`.
  Importers: `rpc/OperationCommandPage.tsx` (`pathParamNames`, `submitValue`),
  `rpc.ts` barrel if exported.
- `packages/ui/src/data/Clicky.tsx` (1, line ~982): one non-component export in
  a 1000+ line component file — move it next to the other Clicky helpers.
  While in there: `rpc/types.ts:1` has `import type { ClickyNode } from
  "../data/Clicky"` — hoist `ClickyNode` (and friends) into a leaf types module
  to kill madge cycles 3–7 (`rpc/types.ts > data/Clicky.tsx > …`). Type-only,
  so not HMR-breaking, but it keeps `madge --circular` red.
- `packages/ui/src/data/Icon.tsx` (1, line 98): non-component export mixed with
  `Icon`/`LabelIcon` components → move to `data/icon-utils.ts` (check importers:
  Badge, Clicky, json-schema-form, diagnostics all import from `data/Icon`).
- `packages/ui/src/data/TimeseriesCoreBars.tsx` (1, line 82),
  `packages/ui/src/data/StatusBreakdown.tsx` (1, line 26),
  `packages/ui/src/data/diagnostics/FrameSourceWindow.tsx` (1, line 18):
  single helper each → un-export if only used locally, else move to a utils
  module.

## 2. Pre-existing lint warnings that fail the gate (not caused by this work)

- `unicorn(no-useless-fallback-in-spread)` (6): `...(x ?? {})` → `...x` in
  `rpc/apiClient.ts:151,163,179,191`, `components/json-schema-form-resolve.ts:230`,
  `components/JsonSchemaForm.test.tsx:210`. Mechanical, safe.
- `eslint(no-unsafe-optional-chaining)` (2): `rpc/apiClient.test.ts:144,145`.
- `unicorn(no-thenable)` (4): `then:` keys in JSON-Schema if/then fixtures
  (`json-schema-form-resolve.test.ts:247,262,331`, `rpc/apiClient.test.ts:28`,
  `overlay/DropdownMenu.test.tsx:62`). These are FALSE POSITIVES — `then` is a
  JSON Schema keyword and cannot be renamed. Needs a user decision: either an
  oxlint override turning `unicorn/no-thenable` off for `**/*.test.*` (config
  suppression — requires explicit user approval per house rules) or accept the
  rule globally off.
- `react(no-children-prop)` (1): new error surfaced by enabling the react
  plugin — find it via `pnpm lint`; fix by passing children as JSX children
  instead of a `children=` prop.

## 3. Remaining madge cycles (all type-only — erased at runtime, lint passes;
   fix for hygiene so `madge --circular` is clean)

- `rpc/types.ts > data/Clicky.tsx > (FilterForm/formMetadata/useOperations/classify)`
  → hoist `ClickyNode` type out of Clicky.tsx (see §1).
- `data/TimeseriesPanel.tsx ↔ data/TimeseriesPanel.axes.ts` → fixed by the
  TimeseriesPanel split in §1.
- `data/test-runner/context.ts ↔ data/test-runner/adapter.ts` → both edges are
  `import type`; hoist shared types into `data/test-runner/types.ts`.

## 4. Verification still outstanding

- `pnpm check` green at root (format + oxlint --deny-warnings + typecheck).
- `pnpm --filter @flanksource/clicky-ui test` (full vitest run after splits).
- `npx madge --circular --extensions ts,tsx packages/ui/src` → 0 cycles.
- Manual HMR proof: `pnpm dev:storybook`, edit `FieldWrapper` in
  `json-schema-form-fields.tsx` → Vite console must log `hmr update`
  (NOT `page reload`) and the story must keep its state. Repeat in
  kitchen-sink (`pnpm dev:kitchen-sink`, Preact/prefresh path).
