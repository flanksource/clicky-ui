# playground

A scratch surface for one-page TSX artifacts — try a layout, show it to someone, collect anchored feedback, hand it to a coding agent.

Where `apps/kitchen-sink` is a curated catalog of shipped components (every demo hand-registered in `demo-catalog.tsx`), the playground has **no registration step at all**.

The default `?page=flanksource` route is the canonical Flanksource design-system hub. Its tracked foundation and pattern pages document colors, type, spacing, icons, tones, page anatomy, collections, forms with preview, object arrays, and feedback states using the actual shared components.

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
- **`meta`** is optional; without it the title is derived from the filename. Canonical pages can also provide a generated `Ui*` icon plus explicit `groupOrder` and `navOrder` values.
- Files and folders prefixed with `_`, plus `*.test.tsx` / `*.stories.tsx`, are skipped — use them for shared helpers.

Artifacts may use the full `@flanksource/clicky-ui` library and its theme tokens, plain Tailwind, and offline-generated icons imported from `@flanksource/clicky-ui/icons`. Pages are type-checked by `pnpm run typecheck` at the repo root, so scratch code still has to compile.

## Editing in the browser

**Edit** opens the artifact's source in Monaco beside the live preview. `⌘S` (or the Save button) writes the file to disk; Vite's HMR then refreshes the preview — there is no separate "apply" step, and your own editor sees the same file.

Monaco is configured for TSX but **not** wired to the real type graph: pulling `@flanksource/clicky-ui` types into the browser would cost megabytes, so "cannot find module" diagnostics are suppressed. Syntax, JSX and local type errors still surface; authoritative type checking stays with `pnpm run typecheck` and the dev-server overlay.

Writes go through `plugins/sources-server.ts` and are confined to `src/pages/**`: slugs must match `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`, and the resolved path is re-checked for containment before anything is written. Like the comment backend, it is dev-server only.

## Feedback

Two complementary tools:

**react-grab** — hover any element, press `⌘C`. Copies the element plus its React component stack and source location, formatted for a coding agent. Dev-only, loaded behind `import.meta.env.DEV` in `src/main.tsx`.

**Comment pins** — press `c` (or the Comment button), click an element, write a note. The note is anchored to that element by a CSS path and persisted to `.playground/comments.json` (gitignored), so it survives reloads and can be read straight off disk by an agent.

**Copy feedback** is a split button. The primary half copies the current page's notes as markdown; its dropdown widens the net:

| Action | Copies |
|---|---|
| *Copy feedback* (primary) | every note on the current page |
| *Copy open comments (this page)* | unresolved notes on the current page |
| *Copy all open comments* | unresolved notes from **every** page |
| *Copy all comments* | every note from every page, resolved included |

Anchor labels (`button.btn.primary "Approve"`) are read from the live DOM, so they only exist for the page you are looking at; the cross-page actions fall back to the raw CSS path, which is still what an agent needs to find the element.

If an anchored element disappears (you edited the artifact), the note is *kept* and flagged as an orphan in a banner and in the rail — never silently dropped or moved.

## Comment API

The same comments are a REST API, so a coding agent can read feedback, act on it, reply and resolve it without a browser. Like the source editor it is **dev-server middleware — `vite build` output has no comment backend**.

`GET /__playground/comments/schema` describes every endpoint as tool metadata (name, description, JSON-Schema input, MCP-style `readOnlyHint` / `idempotentHint` / `destructiveHint`), so a model can discover the API rather than being told about it:

```bash
curl -s localhost:5274/__playground/comments/schema | jq '.tools[] | {name, description}'
```

| Method | Path | Body | Purpose |
|---|---|---|---|
| `GET` | `/__playground/comments` | — | List; `?page=`, `?status=` (repeat or comma-separate), `?unresolved=true` |
| `POST` | `/__playground/comments` | `{page, body, author, anchor?, status?}` | Start a thread |
| `POST` | `/__playground/comments/{id}/replies` | `{body, author}` | Reply — page and anchor inherited from the root |
| `POST` | `/__playground/comments/{id}/resolve` | `{status?}` | Mark done (defaults to `resolved`) |
| `PATCH` | `/__playground/comments/{id}` | `{body?, status?}` | Edit text or move status |
| `DELETE` | `/__playground/comments/{id}` | — | Remove, cascading to replies |

Statuses are `open`, `in_progress`, `resolved`, `closed`; the first two count as unresolved. Anything else is a 400 naming the valid values — the same for a missing `author`, which is never inferred so an agent's reply cannot show up as "You". Every comment is addressed by id alone; only `POST /__playground/comments` needs a page.

```bash
# What still needs doing, and where
curl -s 'localhost:5274/__playground/comments?unresolved=true' \
  | jq -r '.comments[] | select(.parentId == null) | "\(.page)\t\(.id)\t\(.body)"'

# Answer a note, then close it out
curl -s -XPOST localhost:5274/__playground/comments/$ID/replies \
  -H 'content-type: application/json' \
  -d '{"body":"Fixed in `PricingTable.tsx`.","author":{"name":"Claude","kind":"agent"}}'
curl -s -XPOST localhost:5274/__playground/comments/$ID/resolve
```

Replies land one level deep: replying to a reply attaches to the thread root, matching how the rail renders threads.

## How it fits together

| Concern | Where |
|---|---|
| Page discovery | `src/registry.ts` — pure derivation helpers + one `import.meta.glob` |
| Chrome, routing, comment mode | `src/App.tsx`, `src/PlaygroundShell.tsx` |
| Click → anchor string | `src/comments/dom-anchor.ts` |
| Anchor ↔ library registry | `src/comments/useDomAnchors.ts` |
| Pins and element picker | `src/comments/CommentOverlay.tsx` |
| Comment persistence | `plugins/comments-store.ts`, `plugins/comments-server.ts` |
| Comment API tool schema | `plugins/comments-schema.ts` |
| Feedback → markdown for an agent | `src/comments/markdown.ts` |
| Source editing | `src/editor/`, `plugins/pages-store.ts`, `plugins/sources-server.ts` |

The comment *UI* — threads, composer, statuses, the rail — is the library's own `CommentProvider` / `CommentSidePanel`. The playground only supplies the DOM-anchor adapter and the storage backend, which is dev-server middleware and therefore absent from `vite build` output by design.

```bash
pnpm --filter playground test    # unit tests
pnpm --filter playground check   # icons → tsc → oxlint
```
