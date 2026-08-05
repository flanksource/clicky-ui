# playground

A scratch surface for one-page TSX artifacts — try a layout, show it to someone, collect anchored feedback, hand it to a coding agent.

Where `apps/kitchen-sink` is a curated catalog of shipped components (every demo hand-registered in `demo-catalog.tsx`), the playground has **no registration step at all**.

```bash
pnpm run dev:playground     # http://localhost:5274
```

## Adding an artifact

Either press **New** in the toolbar (type a slug, get a scaffolded file), or create a file under `src/pages/` with a default export in your own editor:

```tsx
// src/pages/pricing-table.tsx
export const meta = { title: "Pricing table", description: "Three-tier layout" };

export default function PricingTable() {
  return <div className="p-6">…</div>;
}
```

It appears in the sidebar immediately — `import.meta.glob` is HMR-aware, so no restart.

- **Slug** comes from the path: `src/pages/nested/thing.tsx` → `?page=nested/thing`.
- **Group** comes from the folder: root files land under "Pages", `src/pages/dashboards/*.tsx` under "Dashboards".
- **`meta`** is optional; without it the title is derived from the filename.
- Files and folders prefixed with `_`, plus `*.test.tsx` / `*.stories.tsx`, are skipped — use them for shared helpers.

Artifacts may use the full `@flanksource/clicky-ui` library and its theme tokens, plain Tailwind, or any Iconify icon via `<iconify-icon icon="…" />`. Pages are type-checked by `pnpm run typecheck` at the repo root, so scratch code still has to compile.

## Editing in the browser

**Edit** opens the artifact's source in Monaco beside the live preview. `⌘S` (or the Save button) writes the file to disk; Vite's HMR then refreshes the preview — there is no separate "apply" step, and your own editor sees the same file.

Monaco is configured for TSX but **not** wired to the real type graph: pulling `@flanksource/clicky-ui` types into the browser would cost megabytes, so "cannot find module" diagnostics are suppressed. Syntax, JSX and local type errors still surface; authoritative type checking stays with `pnpm run typecheck` and the dev-server overlay.

Writes go through `plugins/sources-server.ts` and are confined to `src/pages/**`: slugs must match `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`, and the resolved path is re-checked for containment before anything is written. Like the comment backend, it is dev-server only.

## Feedback

Two complementary tools:

**react-grab** — hover any element, press `⌘C`. Copies the element plus its React component stack and source location, formatted for a coding agent. Dev-only, loaded behind `import.meta.env.DEV` in `src/main.tsx`.

**Comment pins** — press `c` (or the Comment button), click an element, write a note. The note is anchored to that element by a CSS path and persisted to `.playground/comments.json` (gitignored), so it survives reloads and can be read straight off disk by an agent. **Copy feedback** puts the whole page's notes on the clipboard as markdown.

If an anchored element disappears (you edited the artifact), the note is *kept* and flagged as an orphan in a banner and in the rail — never silently dropped or moved.

## How it fits together

| Concern | Where |
|---|---|
| Page discovery | `src/registry.ts` — pure derivation helpers + one `import.meta.glob` |
| Chrome, routing, comment mode | `src/App.tsx`, `src/PlaygroundShell.tsx` |
| Click → anchor string | `src/comments/dom-anchor.ts` |
| Anchor ↔ library registry | `src/comments/useDomAnchors.ts` |
| Pins and element picker | `src/comments/CommentOverlay.tsx` |
| Comment persistence | `plugins/comments-store.ts`, `plugins/comments-server.ts` |
| Source editing | `src/editor/`, `plugins/pages-store.ts`, `plugins/sources-server.ts` |

The comment *UI* — threads, composer, statuses, the rail — is the library's own `CommentProvider` / `CommentSidePanel`. The playground only supplies the DOM-anchor adapter and the storage backend, which is dev-server middleware and therefore absent from `vite build` output by design.

```bash
pnpm --filter playground test    # unit tests
pnpm --filter playground check   # icons → tsc → oxlint
```
