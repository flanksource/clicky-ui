# Frame styles and runtime Tailwind

Every page loads its libraries' published stylesheets. A page that opts in also builds Tailwind utilities in the browser.

## Library recipes

A managed library publishes `<name>/page-styles`, a `PageStylesRecipe` (see `schema.ts`):

- `base`: published precompiled stylesheet specifiers (clicky-ui: `@flanksource/clicky-ui/styles.css`). The frame links them with `<link rel="stylesheet">` on every page, in library order, through `resolveStyleImport`, which enforces the integrity-checked package route. The frame awaits every link's load before mounting, and a failed or timed-out stylesheet is an error naming it.
- `entry`: compiler inputs only (`tailwindcss/theme.css` in `layer(theme)`, `tailwindcss/utilities.css` in `layer(utilities)` with `source(none)`, `@config`, `@plugin`, `@theme`). `validateRecipe` rejects an `entry` that mentions any `base` stylesheet, so generated CSS never repeats the base.
- `extends`: managed libraries whose preset this library's preset extends (facet extends clicky-ui). Only the most-derived recipe goes into `compile()`; every library's `base` is still linked.
- `transform`: optional post-processing of generated CSS, applied for every library in library order.

Library order is deterministic and independent of `profile.managed` key order: a library that is extended comes before its extender, and ties are sorted by name. An `extends` naming an unmanaged library, or a cycle, is an error.

## Opting in

A page module opts in to runtime Tailwind with:

```tsx
export const meta = { tailwind: "dynamic" };
```

Only a page that opts in loads the compiler, fetches `/__runtime/candidates`, opens storage and runs the `MutationObserver`. Any other `meta.tailwind` value, or a `meta` that is not an object, throws an error naming the page. A page that does not opt in is styled by the base links alone.

## Cache identity and storage

- `libraryKey` is `[runtimeVersion, ...libraries.map(name, version, integrity)]`. The integrity is the recipe module's entry in `lock.integrity`. It is independent of the page: the recipe URL's `?page=` parameter, stylesheet bodies and the `transform` function are not part of it. A recipe module without a lock integrity (a linked module) cannot be cached and fails when the page opts in.
- `cssKey` is `sha256(libraryKey, sorted unique source candidates)`. Classes the DOM adds later do not change the key; they are recorded in the stored record's `domClasses`, and a warm load restores them so a remount rebuilds nothing.

| Where | What |
|---|---|
| IndexedDB `page-runtime` (`storage/db.ts`, shared by the worker and the frame) | `candidates` store: key `[page, module]`, value `{ sourceHash, candidates }`, index `page`. `tailwind` store: key `cssKey`, value `{ libraryKey, candidates, domClasses, bytes, url, createdAt, lastUsedAt }`, index `[libraryKey, lastUsedAt]`. |
| Cache Storage `page-runtime-<version>-tailwind` | The generated CSS as a plain `text/css` response at `/__runtime/tailwind/<cssKey>.css`. The worker serves that URL from this cache; a miss is a 404 with `x-page-runtime-error`. |

Write order: `cache.put`, then the IndexedDB record, which is the commit point. A record whose cached response is missing is an invariant violation: the read throws with the key and URL, with no silent rebuild. A warm read is an IndexedDB `get`, a `fetch` of the record's URL, and an insert into the `#runtime-tailwind` `<style>` before the first render. DOM-driven rebuilds are inserted synchronously before paint, but persisted once per idle period; `ready()` and `stop()` flush a pending write.

Eviction runs in the write transaction: it keeps the newest `TAILWIND_ENTRIES_PER_LIBRARY` (32) records per library key, and clears every record of other library keys the first time a new library key writes. The evicted responses are deleted from Cache Storage after the transaction commits. A read counts as a use.

The worker writes each compiled module's candidates to the `candidates` store, and `/__runtime/candidates?page=` is `index("page").getAll(page)`. On `activate` the worker deletes `page-runtime-tailwind-v2`, other versions' `-tailwind` caches and the old `/__runtime/candidates/` Cache Storage entries.

## Partitioning

The frame runs on the runtime origin inside the host's page, so browsers partition its IndexedDB and Cache Storage by top-level site. The cache is shared per (embedder site, runtime origin), not across embedders, and `link/storage.ts` keeps its own host-origin `page-runtime-links` database because it lives on a different origin.

## Tests

- `pnpm --filter @flanksource/page-runtime test tailwind` runs the recipe, key, store, runtime and bootstrap unit tests against `fake-indexeddb`.
- `pnpm --filter @flanksource/page-runtime test:browser src/frame/tailwind/tailwind.browser.ts` renders the facet example pages in Chrome through `agent-browser` and compares them with a reference build, and checks the storage layout cold and warm. It needs the clicky-ui and facet builds (`packages/ui/dist`, facet `dist`).
