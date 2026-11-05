# Comment vocabularies

Type `@` in a comment or reply to browse vocabulary types, then Enter or Tab to browse their items. Type a path such as `@box/header` to filter directly. Up/Down changes the preview; Enter/Tab inserts the highlighted item. Escape dismisses the picker first. Shift+Enter adds a line; Enter posts when the picker is closed.

Selections are atomic inline chips with a miniature specimen and a larger preview on hover or keyboard focus. The stored body remains Markdown: `[box/header](/?vocabulary=facet%3Abox%2Fheader)`. These links open the tracked vocabulary reference view. API writes resolve selections against the catalog and save server-owned `vocabularyRefs`; clients cannot supply that field. Copy feedback and both agent-delivery paths include saved definitions and source references from roots and replies, deduplicated per thread. Editing a body recomputes its references. Existing plain comments need no migration.

## Add an item

Add an entry to the appropriate `facet/data/*.ts` module and a matching specimen in `facet/specimens/vocabulary/`. An entry has `catalog` (namespace), `type` (picker group), `id` (stable path), `label`, `description` (meaning and usage guidance), `references` (source or documentation pointers), and Facet's renderer-specific `section`. The existing gallery delegates to these tracked specimen modules. Picker types are derived from data rather than an enum.

## Add another vocabulary

Create a directory named after the catalog ID, containing `catalog.ts` and `Preview.tsx`. The metadata module must export exactly one non-empty array of items (default or named export). Provide a default React component in `Preview.tsx` accepting `{item: CommentVocabularyItem}`. Do not import scratch pages or browser components into the metadata module: the server evaluates metadata, while Vite compiles previews in the browser. Only load trusted local code.

The playground discovers built-in catalogs under `src/vocabularies`. Set `PLAYGROUND_VOCABULARY_DIRS` to a comma-separated list of absolute directories to load additional catalogs. Each directory can contain several catalog folders, or be a single catalog folder itself. The runnable [shapes example](../../examples/vocabularies/shapes/catalog.ts) includes metadata and a preview. From `apps/playground`:

```bash
PLAYGROUND_VOCABULARY_DIRS="$PWD/examples/vocabularies" pnpm run playground:prod
```

The same setting works with `pnpm run dev`. Configure directories before starting the server; adding/removing catalogs or editing their metadata, previews and local helpers needs no restart or shell rebuild. The browser refreshes the catalog every five seconds while visible and on window focus. No additional persistent directory watcher is installed. `GET /__playground/vocabularies` returns the current revision, items and versioned preview URLs. Previews share the playground's React instance and can use its existing dependency aliases. External preview styles should use inline CSS or imported stylesheets; the playground's Tailwind scan does not include arbitrary external directories.

Every item needs non-empty `catalog`, `type`, `id`, `label`, `description` and `references`. `catalog` must match its folder name, and IDs must be unique within the catalog. Additional JSON metadata is preserved, including renderer-specific fields. Duplicate namespaces, invalid metadata, unreadable directories and symlink traversal fail explicitly. The header's vocabulary status dot opens catalog counts, refresh controls and shared error diagnostics with Copy, More details and Retry. Loading failures turn the dot red and disable new vocabulary selections while keeping navigation, pages and drafts mounted. Preview failures stay inside their specimen, turn the dot amber and expose diagnostics in that dropdown; Reload page recovers cached failed imports. The dropdown stays closed until opened. Server comment validation still rejects invalid catalogs. Saved selections include the resolved definition and references used when the comment was written. If an item is later removed, its saved definition remains readable and the chip explicitly reports that its live preview is unavailable.

For example, an item `{catalog:"shapes", type:"shape", id:"shape/decision", label:"Decision", description:"A branching decision", references:["docs/shapes.md#decision"]}` appears under `@shape/`. Its preview component renders that stable ID. New type names automatically appear without changes to the editor. Runtime loading requires the live development or `playground:prod` server; a static `vite preview` deployment cannot compile external TSX modules.

## OIPA kit vocabulary

The visual vocabulary of `@flanksource/oipa-kit` is owned by oipa-cli in `packages/oipa-kit/examples/vocabularies/oipa/`, loaded through `PLAYGROUND_VOCABULARY_DIRS=<absolute-oipa-cli-path>/packages/oipa-kit/examples/vocabularies`. It has two kinds of type:

- **Rendering variants:** `@oipa-symbol/badge`, `@oipa-fields/cards`, `@oipa-calculation/equations`, `@oipa-diff/inline` and `@oipa-matrix/verification`, in `oipa/data/styles.ts`.
- **The kit's glyph tables:** `@oipa-entity`, `@oipa-element`, `@oipa-transport`, `@oipa-field-type`, `@oipa-verification` and `@oipa-state`, in `oipa/data/glyphs.ts`. This file is generated from the kit's `MARKS`, `ELEMENTS`, `TRANSPORTS`, `FIELD_TYPES`, `VERIFICATION` and `STATE_CHANGES`. Regenerate it when the kit changes those tables.

The external preview imports the kit's own `examples/vocabulary.tsx` directly and owns its styles (see oipa-cli `packages/oipa-kit/README.md`). No vocabulary-specific alias or OIPA source remains in this playground. Its 103 stable IDs and source references are unchanged, so existing comment selections continue to resolve when the directory is configured. An unknown kit key throws in the preview.

## Checks

From the repository root:

```bash
pnpm --filter @flanksource/clicky-ui exec vitest run src/comments/CommentEditor.test.tsx src/comments/comment-vocabulary.test.ts src/comments/CommentComposer.test.tsx src/comments/CommentThreadList.test.tsx
pnpm --filter playground exec vitest run plugins/vocabularies.test.ts plugins/comment-vocabulary.test.ts plugins/comments-server.test.ts src/comments/markdown.test.ts plugins/agent-runs-server.test.ts
pnpm --filter @flanksource/clicky-ui check
pnpm --filter playground build
```

The extracted Facet specimens currently require exports from the sibling Facet source that are absent from published `@flanksource/facet@0.1.74`, including `ContainerNode`, `BOX_STYLES`, and `DiagramStyleProvider`. The existing local playground alias renders them; a Facet release and catalog-version update are required for a portable package build. No new local package override is introduced by this feature.
