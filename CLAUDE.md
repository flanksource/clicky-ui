# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@flanksource/clicky-ui` — a React + TypeScript + Tailwind component library built on [shadcn/ui](https://ui.shadcn.com/), with first-class light/dark theming and three density presets. It is a **pnpm workspace monorepo**:

- `packages/ui` — the publishable library (`@flanksource/clicky-ui`). All real source lives here.
- `apps/storybook` — Autodocs component catalog + interaction (play) tests. Dev on **:5270**.
- `apps/kitchen-sink` — a **Preact**-hosted demo app that proves runtime compatibility under a non-React runtime. Dev on **:5273**.
- `e2e` — Playwright tests that run against the kitchen-sink.

Toolchain: Vite (build) + Vitest (unit + storybook tests) + Storybook + Playwright + oxlint. Node `>=22.12`, pnpm `10.33` (use `corepack enable`). Dependency versions are pinned via the pnpm **catalog** in `pnpm-workspace.yaml` (`catalog:` entries) — add/bump shared deps there, not per-package.

## Commands

```bash
pnpm install
pnpm run build              # builds the library only (packages/ui)
pnpm run dev:storybook      # :5270
pnpm run dev:kitchen-sink   # :5273

pnpm run check             # build:icons → format:check → lint → typecheck (the fast gate)
pnpm run test             # builds storybook + kitchen-sink, then runs unit + storybook + e2e tests
pnpm run lint             # oxlint . --deny-warnings
pnpm run typecheck        # tsc -b (project references)
```

Per-package (use `pnpm --filter <pkg> <script>`):

```bash
pnpm --filter @flanksource/clicky-ui test        # vitest unit tests (jsdom)
pnpm --filter @flanksource/clicky-ui test Switch # single test file by name pattern (vitest)
pnpm --filter storybook test                     # storybook play tests (real chromium, headless)
pnpm --filter e2e test                           # playwright against kitchen-sink
```

`make build` / `make icons` / `make test` / `make handoff` / `make clean` are thin wrappers. **Per repo policy, prefer `make build` over invoking `vite`/`tsc` directly.**

CI runs via **gavel** (Flanksource's test runner) which auto-discovers the vitest and Playwright suites; `.gavel.yaml` declares the library build as a `pre:` hook. There is no Go in this repo despite living under `$GOPATH` — it is entirely TypeScript/React.

## The icons codegen — read this before anything fails to resolve

`src/icons/` is **generated and gitignored**. Almost every script (`dev`, `build`, `test`, `check`) runs `build:icons` first for this reason. If imports from `@flanksource/clicky-ui/icons` or the barrel fail to resolve, run:

```bash
pnpm --filter @flanksource/clicky-ui build:icons
```

`scripts/build-icons.ts` reads `packages/ui/icons/icon-selections.json`, resolves each pick (Phosphor / JetBrains expui / Iconify / flanksource-icons SVG cache), normalizes to a 24×24 `currentColor` SVG, and emits one `Ui<PascalCase>` (outline) + `Ui<PascalCase>Filled` React component per icon plus a barrel. **To add an icon: add a row to `icon-selections.json` and re-run `build:icons`** — do not hand-write components under `src/icons/`. A custom oxlint rule (`clicky-icons/no-iconify-names`, in `packages/ui/oxlint-plugins/`) forbids raw Iconify name strings; use the generated `Ui*` components or `<Icon name="...">`.

## Architecture

**Subpath exports drive the layout.** `packages/ui/src/` is organized to mirror the package's public subpath exports (see `packages/ui/package.json` `exports` and the matching `src/*.ts` barrels). Each barrel re-exports a directory:

- `components/` → `@flanksource/clicky-ui/components` — interactive form/control primitives (Button, Select, Combobox, MultiSelect, pickers, `JsonSchemaForm`, FilterBar, date/time fields).
- `data/` → `@flanksource/clicky-ui/data` — display/visualization components (DataTable, Badge, Properties, Tree, Gauge, Timeseries*, LogsTable, JsonView, Markdown, CodeBlock, Timeline, TaskManager). The largest area.
- `layout/`, `overlay/` — AppShell/Panel/Section/SplitPane/Tabs and Modal/Toast/DropdownMenu/HoverCard. Overlay z-index is centralized in `overlay/zIndex.ts`.
- `hooks/` → `/hooks` — `ThemeProvider`/`useTheme`, `DensityProvider`/`useDensity`, sort/history hooks.
- `lib/` → `/utils` — pure, React-free helpers: `cn()` (clsx + tailwind-merge), `format.ts` (Grafana-style unit/byte formatting), color/palette.
- `clicky.ts` → `/clicky` — the **Clicky AST renderer**: `<Clicky data={...}>` takes a `ClickyDocument` (or JSON string) and renders a tagged `html-react` AST (trees, tables, code blocks, collapsed sections, buttons) produced by the sibling `clicky` Go repo. Parsing/normalization in `data/clicky-parse.ts`.
- `rpc/` → `/rpc` — an **OpenAPI operation explorer**: `OperationCatalog` / `EntityExplorerApp` consume an OpenAPI spec (via `OperationsApiClient`) and render operations grouped by entity surface, driven by `x-clicky` surface metadata in the spec. Includes a small hash router.
- `chat/`, `ai/` → optional AI-SDK-backed chat surfaces (peer deps `ai`, `@ai-sdk/react` are optional).

**Theming model.** Tokens are switched via `[data-theme="light|dark"]` and `[data-density="compact|comfortable|spacious"]` attributes on `<html>`. Consumers apply `tailwind-preset.ts` (exported as `/tailwind-preset`) which wires the tokens, density-scaled spacing utilities (`gap-density-2`, `p-density-4`, …), and variants. Hooks persist to `localStorage` (`clicky-ui-theme` / `clicky-ui-density`). **Note (from memory): the `density-*` utilities only emit integer keys — for half-steps use the default `py-1.5`/`gap-1.5` scale, not `density-1.5`.**

**Build output.** `vite build` runs twice (ESM, then `--mode cjs`) producing per-subpath `.js`/`.cjs`/`.d.ts` with `preserveModules`, plus `styles.css` via `scripts/build-styles.mjs`. Everything outside the package (`react`, radix, etc.) is externalized. `git-info.mjs` injects `__CLICKY_COMMIT__`/`__CLICKY_TAG__`/etc. at build time.

## Component notes (from project memory)

Lessons from building on clicky-ui downstream. New capabilities belong in this library's source
(`packages/ui/src/…`), not as consumer workarounds — but keep them domain-agnostic (no app/brand
concepts leak in).

**Forms (`JsonSchemaForm`)**
- **Stay domain-agnostic; customize via extension *functions*, not schema data.** The form renders a
  flat object subschema (resolving `if/then`/`allOf` via `effectiveProperties`) and exposes two hooks
  the consumer passes: `PreExtension = (field: FieldControl, ctx) => FieldControl | null` (after control
  inference, before render — mutate or drop the field) and `PostExtension = (field, {label, value}) =>
  {label, value}` (wraps the rendered nodes). `field.onChange`/`field.value` ride on the FieldControl so
  a post adornment can mutate. Source: `components/json-schema-form-{types,resolve,fields,array,render}`.
- **Nested objects render as flat headed sections**, not indented bordered boxes (`renderFieldRow`
  early-returns an ObjectSection with a `border-b border-border font-semibold` header + full-width
  fields). `resolveControl` recurses enum→bool→number→array→open-string-map→nested-object→string; pre/post
  apply at every depth; `ArrayControl` is hybrid (scalar-string items → compact `TagArray`, else a
  per-item recursive list).
- **In-field adornments via `FieldControl.suffix?: ReactNode`** — String/Number/Date/Combobox controls
  render it inside the input wrapper (tagged `data-jsf-control`) next to `input[data-jsf-input]`.
- **Small fixed enums** can opt into a segmented control with `FieldControl.display:"radio"` →
  `RadioGroupControl` (still `kind:"enum"`, reuses options/custom-value logic).
- **Honor `x-order` and `x-enum-labels`** — `orderByXOrder` sorts listed property keys first (Go maps
  marshal alphabetically, so producers emit `x-order` to control field order); `enumOptions` renders
  `"Desc (code)"` while storing the raw code (works on `propertyNames` too). `ObjectControl` must copy
  `x-order` into its reconstructed subschema. Stacked `FieldWrapper` caps label+value at
  `layout.valueMaxWidth` (default 600px).
- **`effectiveProperties` merges unconditional `allOf` members**, not only matched `if/then` clauses —
  a flattened `$ref` becomes a plain composition member with no top-level `properties`, and the form
  must still render its fields (`json-schema-form-resolve.ts`; `JsonSchemaConditional` carries
  `properties?`/`required?`).
- **Same extension-function pattern for `FilterBar`/`OperationCatalog`** — export `FilterExtension =
  (FilterBarFilter) => FilterBarFilter`; `OperationCatalog` takes `filterPre?: FilterExtension[]`. A
  filter `icon` renders *instead of* the combobox text label (`Combobox`/`MultiSelect` gained `ariaLabel`).
- **Never synthesize a placeholder when a label exists.** Gate the prop on an explicit value
  (`{...(explicit !== undefined ? { placeholder: explicit } : {})}`); never fall back to `"value-1,
  value-2"`, `"Value"`, `` `Any ${label}` ``, the label, or data-derived bounds. Touch points:
  `rpc/formMetadata.ts`, `rpc/FilterForm.tsx`, `components/FilterBar.tsx` (`parameterPlaceholder` is the
  only legitimate explicit source).

**Data / visualization (`data/`)**
- **`TimeseriesPanel` multi-metric API = `baseUrl` + `series=[{id,label?,transform?,color?}]`**, not
  `url`/`secondaryUrl` pairs. Each request is `baseUrl + series.id`; points merge by timestamp and pass
  through `transform` before plotting. Per-series negation is `transform:(v)=>-v`, not a `mirror` flag
  (Y-axis/tooltip use `Math.abs`). The legacy single-`url` form normalizes to a one-element list — one
  render path. Values flow through clicky's `/api/v1/metrics/<id>` route.
- **`TimeseriesGauge`** (`data/TimeseriesGauge.tsx`) — half-radial gauge reading latest value/max live
  from the timeseries store. Props `{baseUrl, value:{id,transform?}, max?:{id,transform?}|number, title,
  icon, unit, range, refreshMs, expandable, thresholds:[warn,danger], fetcher}`; tone emerald<75% /
  amber / red≥90%; expands to a `TimeseriesPanel`. Sibling `StatusBreakdown` family (`StatusRows`,
  `StackedStatusBar`, `segment()`, `StatusSegment`, `StatusRenderLink`) is router-agnostic — pass
  `renderLink` (defaults to plain `<a>`).
- **`Loading`** sizes its 3-dot SVG with an inline `style` `clamp(1.25rem, 18cqmin, 2.5rem)`, NOT a
  Tailwind arbitrary class `size-[clamp(…)]`. A *dynamic/computed* arbitrary class only ships if the
  consumer's Tailwind `@source` scans a file with that exact literal — which fails across a stale linked
  dist and leaves the SVG unsized (it then balloons under `h-full`). Rule: compute CSS via inline
  `style`, never a dynamic arbitrary class; static classes (`size-4`, `text-sm`) are fine.
- **`DataTable`** carries `accessor`/`clientReveal`/`scrollContainerClassName`; consumer adapters stay
  thin (empty-state + column inference belong consumer-side).
- **`Tree.revealSelected?: boolean`** force-opens the `selected` node's ancestor keys (via
  `forcedOpenKeys` + `ancestorPathKeys`/`mergeKeySets`) so a selection can't hide under a collapsed
  parent. `Tree` also supports async/lazy child loading — add such capabilities here, not in consumers.
- **JVM diagnostics** — `DiagnosticsDetailPanel`/`JvmStackTrace`/`ThreadCard` take an optional
  `resolveSource?: (frame) => {sourceLines, …} | undefined` that renders an inline source window under
  each frame; a missing class must resolve to `undefined`, never throw.
- **`CacheBrowser`** (`data/cache-browser/`) — generic valkey keyspace browser (SplitPane: lazy
  `CacheTree` + search / stats / detail). Detail rendering is pluggable via a `CacheNodeAdapter`
  registry (`prefixAdapter(id, "prefix:", render)`). Pairs with the clicky Go `cache.Browser` interface
  + `cache.RegisterRoutes` (impl in the `valkey/` submodule).
- **Background tasks** — `TaskManager`/`TaskProgress` + `use-task-run`/`use-task-runs` hooks speak only
  `TaskSnapshot`/`RunMeta` (no app concepts) and are **SSE-first** (`EventSource` over clicky's
  `SSEHandler`, react-query poll only as a fallback). Extend clicky core's task registry rather than
  building a per-feature one.

**Theming**
- Bind shadcn-style HSL-triple CSS variables with **`@theme inline`**, not plain `@theme`. Plain
  `@theme { --color-primary: hsl(var(--primary)) }` evaluates `var(...)` at build time (undefined →
  token silently dropped, `bg-primary` never compiles); `@theme inline` emits the literal `var(...)` so
  it resolves at runtime and re-flows when `data-theme` flips. Spacing tokens can stay plain `@theme`
  (`calc()` resolves at build time). Lives in `packages/ui/src/styles/tokens.css`.

**Consuming via a `file:` link (downstream)**
- A consumer that links this package via `file:` must `optimizeDeps.exclude` it in Vite (else a freshly
  exported symbol 404s from the stale prebundle) and pin `optimizeDeps.entries` (else Vite's HTML dep
  scan drags in generated reports). The `file:` dep is *copied* into the pnpm store at install time, not
  live-linked, so after editing source: rebuild `dist` (`pnpm run build`) **then** reinstall in the
  consumer to refresh the store copy. `tsc -b` against a local checkout can pass even when a component
  uses props that exist only in uncommitted local source — validate against the published version before
  relying on it.

## Testing layers

Three distinct layers — match the layer to the change:

1. **Unit (vitest, jsdom)** — colocated `*.test.ts(x)` next to source in `packages/ui/src/`. For pure logic and component rendering. Setup: `src/test/setup.ts`.
2. **Storybook play tests** — `*.stories.tsx` with a `play` function using `storybook/test` (`expect`/`userEvent`/`within`). These run in a **real headless chromium** via `@storybook/addon-vitest`. Use for interaction/behavior. Stories use `satisfies Meta<typeof X>` and a `title` of `"Category/Name"`.
3. **E2E (Playwright)** — `e2e/tests/`, against the running kitchen-sink (`:5273`). Defaults to system Chrome (`channel: "chrome"`, no `playwright install` needed); set `E2E_ALL_BROWSERS=1` for firefox/webkit.

New components conventionally ship all three artifacts where relevant: `Component.tsx`, `Component.test.tsx`, `Component.stories.tsx`, and a demo in `apps/kitchen-sink/src/demos/`.

## TypeScript / lint conventions

- Strict everywhere, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` (use `import type` for type-only imports), `noUnusedLocals`/`Parameters`. Project references — run `tsc -b`, not bare `tsc`.
- oxlint enforces `import/no-cycle` (no circular imports between barrels — be careful what a barrel re-exports), `react/only-export-components` (relaxed for stories/tests), and the custom icon rule above.
- The library targets React 18 **and** Preact (kitchen-sink) and React 19 (peer range) — avoid React-version-specific APIs.
