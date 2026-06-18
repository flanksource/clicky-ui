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
