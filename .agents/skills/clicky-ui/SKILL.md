---
name: clicky-ui
description: Conventions for building in @flanksource/clicky-ui — AppShell layout and its scroll/height contract, DataTable, clicky-rpc operation catalogs, theming, overlays, and the three testing layers. Use when adding or changing any component in packages/ui, composing an app shell around a table, wiring an OpenAPI-driven surface, or debugging why a shell/table does not fill or scroll correctly.
user-invocable: true
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Building in clicky-ui

Domain-agnostic React library. New capabilities belong in `packages/ui/src/**` — never as a consumer
workaround, and never with app or brand concepts baked in. Extend via **extension functions and
slots**, not by hardcoding app knowledge.

Historical decisions live in `.agents/memory/*.md`; this skill is the prescriptive layer.

## Verify with

```bash
pnpm --filter @flanksource/clicky-ui build:icons   # src/icons/ is generated + gitignored
pnpm --filter @flanksource/clicky-ui check         # icons → tsc -b → oxlint
pnpm --filter @flanksource/clicky-ui exec vitest run <file>   # file-isolated
pnpm --filter storybook test                       # play tests, real chromium
```

`pnpm --filter @flanksource/clicky-ui test -- <file>` is **not** file-isolated — it runs everything
and buries your result in unrelated failures. Use `exec vitest run <file>`.

Layout and interaction changes are not done until seen in a browser. Drive it with **agent-browser**
(repo rule T-7 — not playwright/puppeteer/chrome-mcp), at **1920×1080 and 2560×1440**.

---

## AppShell

`packages/ui/src/layout/AppShell.tsx`. Sidebar-first shell. Top bar renders **brand → nav → search
(centred, width-capped) → actions**; the body is a fixed `bodyHeader`/`bodyActions` row over an
optional `bodySidebar | children` split.

Slots: `brand`, `nav`, `search`, `actions`, `mobileActions`, `toolbar`, `navSections`/`sidebar`,
`sidebarHeader`, `sidebarFooter`, `bodyHeader`, `bodyActions`, `bodySidebar`, `children`.
There is **no `footer` slot**.

### The scroll contract — the thing people get wrong

*`<main>` must not scroll; the table's row region owns the scroll so the sticky header and the
pagination footer stay pinned.*

```tsx
<AppShell contentClassName="flex min-h-0 flex-col overflow-hidden p-density-4">
  <DataTable className="min-h-0 flex-1" … />
</AppShell>
```

`contentClassName` merges through `cn()` (tailwind-merge), so `overflow-hidden` beats `<main>`'s
default `overflow-auto`. Every ancestor in the chain needs `min-h-0` or the flex child refuses to
shrink.

### Height: `h-full` collapses without a definite ancestor

`height: 100%` against an auto-height parent falls back to auto. In Storybook, `layout: "fullscreen"`
gives the decorator an `h-dvh` box (`apps/storybook/.storybook/preview.tsx`), so a story wrapper can
use `h-full`. Elsewhere (kitchen-sink demos), self-bound with an explicit height — the demo host wraps
each demo in a padded div with no height.

Use `dvh` when you need viewport height without a height chain; it is viewport-relative.

### Debugging layout

Every slot carries `data-slot="app-shell-*"`. Pass `debugSlots` to outline each in its own colour with
a label. It uses `outline`, not `border`, so switching it on does not shift the layout you are
measuring.

### Do / Don't

- **Do** let the host own page titles, breadcrumbs and actions. Breadcrumbs go in `nav` (before
  `search`); page title in `bodyHeader`; entity actions in `bodyActions`.
- **Don't** let a child component invent a page header — that produces duplicate `<h1>`s.
- **Don't** reach for a fixed `max-h-*` to "fix" a table that grows unbounded. That fakes the
  contract; fix the `min-h-0` / `overflow-hidden` chain instead.

---

## DataTable

`packages/ui/src/data/DataTable.tsx`.

- **The sticky header is not a prop.** `<thead>` is always `sticky top-0 z-10`. A fixed header only
  needs a **bounded height** — see the scroll contract above.
- **Pagination is presentational.** `DataTable` never slices `data`; the caller pages and passes
  `total`. Without `total` you lose "Page X of Y".
- `virtualize` windows the **DOM**, not the data: reach for it above ~200 rows. It composes with both
  `pagination` and `infinite`, and grouping, select-all and counts still see every filtered row.
  Column widths are pinned on first measure so they do not shift as you scroll.
- Bound height either by a flex parent (`min-h-0 flex-1`) or `scrollContainerClassName="max-h-…"`.
- Consumer adapters stay thin: empty states and column inference belong consumer-side.

---

## Operation catalogs (clicky-rpc)

`packages/ui/src/rpc/`. OpenAPI + `x-clicky` metadata drives the UI.

### The client is an interface — mock it

`OperationsApiClient` (`useOperations.ts`) needs only `getOpenAPISpec()` and `executeCommand()`, and
is passed as a **prop**. Stories and tests supply an object literal; see
`packages/ui/src/rpc/rpc-story.fixtures.ts` (`FAKE_CLIENT`) and the per-surface fixtures beside it.
rpc components need a react-query `QueryClientProvider`.

### Pagination needs BOTH roles

`parametersToFormConfig` only builds a pagination config when the operation declares **both** an
`x-clicky.role: "limit"` **and** a `role: "offset"` parameter. Declare only `limit` and the footer
silently never renders. Response side: `ExecutionResponse.pagination = {total, limit, offset}`, which
the real client parses from `X-Total-Count` / `X-Page-Limit` / `X-Page-Offset`; a fake client sets the
field directly. `dataTablePaginationFromForm` (`formMetadata.ts`) adapts it to `DataTablePagination`.

`OperationCommandPage` only threads pagination when the op is **GET + autoRun**, and its refetch loop
is debounced ~250 ms — allow for that in tests.

### The catalog renders no page header

`OperationCatalog` deliberately renders **no title, eyebrow or description** — headers and breadcrumbs
are the host's to define. It renders results, and optionally lets the host relocate its two button
clusters:

```tsx
<OperationCatalog
  viewToggleContainer={navActionsHost}   // table/endpoint switcher → shell top-bar actions
  actionsContainer={bodyActionsHost}     // collection actions (Create) → shell bodyActions
/>
```

Both fall back to inline rendering when `null`, so existing consumers are unaffected. Supply targets
as callback refs held in **state** (`const [host, setHost] = useState<HTMLElement|null>(null)`), so
attaching the node triggers the render that mounts the portal.

**Why portals and not a render-prop:** the shell slot is rendered *above* the catalog in the tree, so
nodes returned in place cannot move upward. And `OperationActionBar` owns its dialog state and closes
over the catalog's live filters and list query — detaching it severs both. This mirrors
`SessionViewer`'s `menuContainer`, the repo's established child→ancestor pattern.

---

## Cross-cutting conventions

**Icons.** Never a raw Iconify name string (a custom oxlint rule forbids it). Use a generated `Ui*`
component or `<Icon name="…">`. To add one: add a row to `packages/ui/icons/icon-selections.json` and
re-run `build:icons` — never hand-write a file under `src/icons/` (generated + gitignored).

**Theming.** Bind shadcn HSL triples with `@theme inline`, never plain `@theme` (plain evaluates
`var()` at build time and silently drops the token). `dark:` compiles to `prefers-color-scheme` in
dist — for custom dark colours use `[[data-theme=dark]_&]:`.

**Density.** `density-*` utilities only emit **integer** keys. For half-steps use the default scale
(`py-1.5`, `gap-1.5`), not `density-1.5`.

**Dynamic CSS.** Compute via inline `style`, never a *dynamic* arbitrary class — a consumer's Tailwind
only generates arbitrary classes it can scan from the published dist. Static classes are fine. Same
reason overlays take `style={{ zIndex }}` from `overlay/zIndex.ts` and never `z-[N]`.

**Overlays.** Reuse `overlay/modalStack.ts`: `useModalStack` (depth/stacking), `useEscapeLayer`
(topmost layer owns Escape, one layer per press), `useFloatingZIndex` (float above any open modal).
Build a bespoke portal only when `Modal` genuinely cannot fit — `Modal` centres its panel, focuses the
dialog element rather than an input, forces body padding, and pins an inline max-height, none of which
are overridable.

**TypeScript.** `exactOptionalPropertyTypes` is on: pass optional props with a conditional spread
(`{...(x !== undefined ? { x } : {})}`), never `prop={undefined}`. Also `noUncheckedIndexedAccess` —
index access is `T | undefined`; fail fast rather than defaulting silently. Use `import type`.

**Fast refresh.** A `.tsx` may not export both a component and a constant/function
(`react/only-export-components`). Put shared constants in a `.ts` file or keep them module-local.

**Dependencies.** Check `pnpm-lock.yaml`, not just the `pnpm-workspace.yaml` catalog — the catalog
lists packages that were never installed (`cmdk` is catalogued, unused, and absent from the lock).
House style hand-rolls overlays on `@floating-ui/react`; the package ships only two Radix primitives.

### These conventions are machine-enforced

`packages/ui/oxlint-plugins/` ships custom rules — also published for **consumer** repos as
`@flanksource/clicky-ui/oxlint-plugins`, so downstream projects can enforce the same discipline
without copying anything (see its `README.md`). Read the rule before working around a violation; each
one names the seam you should be using:

| Rule | Enforces |
|---|---|
| `clicky-ui-prefer-components` | Reuse clicky-ui components instead of rebuilding native DOM by hand |
| `clicky-ui-no-adhoc-overlay` | Use `Modal` instead of hand-rolled dialog markup |
| `clicky-ui-no-direct-z-index` | Use overlay components or `useFloatingZIndex`, not raw z-index |
| `clicky-ui-prefer-theme` | Theme tokens + theme/density hooks, not hardcoded colours or raw storage |
| `clicky-ui-prefer-tailwind` | Tailwind utilities, not hand-rolled static inline styles |
| `clicky-ui-prefer-icons` / `no-iconify-names` | Approved icon sources and components — no name strings, no emoji |

Note the interaction with the dynamic-CSS rule above: `prefer-tailwind` targets *static* inline
styles. Genuinely computed values (a `clamp()`, a z-index from the scale) still belong in `style`.

Per repo policy, never silence one of these by editing lint-ignore config — change the source.

---

## Testing

Three layers — match the layer to the change:

1. **Unit** (vitest + jsdom), colocated `*.test.tsx`. Pure logic and rendering.
2. **Storybook play** (`*.stories.tsx`, real headless chromium). Interaction and behaviour.
3. **E2E** (Playwright) against the kitchen-sink.

New components conventionally ship `Component.tsx`, `.test.tsx`, `.stories.tsx`, and a React
kitchen-sink demo registered in `apps/kitchen-sink/src/demo-catalog.tsx`.

Gotchas that will cost you an hour each:

- **Portaled content lives in `document.body`.** Scope with `within(document.body)`, not
  `within(canvasElement)`.
- **Play functions auto-run on story load.** Opening a story by hand means racing it — a story whose
  play navigates will not be sitting where you left it.
- **Global hotkeys register on `document`.** `fireEvent.keyDown(window, …)` will not reach them.
- **jsdom lacks `scrollIntoView` and `URL.createObjectURL`.** Guard optional DOM APIs in the
  component rather than crashing a consumer's test run.
- Use `satisfies Meta<typeof X>` and a `title` of `"Category/Name"`.

---

## Do / Don't summary

| Do | Don't |
|---|---|
| Put new shared capability in `packages/ui/src` | Work around a gap in the consumer |
| Extend via extension functions / slots / portals | Hardcode app or brand concepts |
| Let the host own titles, breadcrumbs, page actions | Render a page header from a nested component |
| Bound height with `min-h-0` + `overflow-hidden` | Cap a table with a fixed `max-h-*` |
| `style={{ zIndex }}` from `overlay/zIndex.ts` | `z-[N]` or dynamic arbitrary classes |
| Generated `Ui*` icons via `icon-selections.json` | Raw Iconify name strings; hand-written icon files |
| Conditional spread for optional props | `prop={undefined}` |
| Reuse `modalStack` for Escape/z-index | A parallel overlay stack |
| Verify in a browser at both resolutions | Ship layout changes reviewed only as a diff |
| Delete and replace the old path | Keep a fallback "in case", or a deprecated alias |
