# playground

A scratch surface for one-page TSX artifacts — try a layout, show it to someone, collect anchored feedback, hand it to a coding agent.

Where `apps/kitchen-sink` is a curated catalog of shipped components (every demo hand-registered in `demo-catalog.tsx`), the playground has **no registration step at all**.

The default `?page=flanksource` route is the canonical Flanksource design-system hub. Its tracked foundation and pattern pages document colors, type, spacing, icons, tones, page anatomy, collections, forms with preview, object arrays, and feedback states using the actual shared components.

```bash
pnpm run dev:playground     # http://localhost:5274
```

## Adding an artifact

Either choose **New → New page** in the toolbar (pick a folder, filename, and title), or create a file under `src/pages/` with a default export in your own editor:

```tsx
// src/pages/pricing-table.tsx
export const meta = {
  title: "Pricing table",
  description: "Three-tier layout",
};

export default function PricingTable() {
  return <div className="p-6">…</div>;
}
```

It appears in the sidebar immediately — `import.meta.glob` is HMR-aware, so no restart.

- **Slug** comes from the path: `src/pages/nested/thing.tsx` → `?page=nested/thing`.
- **Hierarchy** comes only from the filesystem path: root files sit under "Pages", while `src/pages/dashboards/overview.tsx` appears inside the `dashboards` folder. Empty folders created from the toolbar remain visible.
- **`meta`** is optional presentation data; without it the title is derived from the filename. Canonical pages can also provide a generated `Ui*` icon plus explicit `groupOrder` and `navOrder` values, but metadata does not move a page between folders.
- Files and folders prefixed with `_`, plus `*.test.tsx` / `*.stories.tsx`, are skipped — use them for shared helpers.

Artifacts may use the full `@flanksource/clicky-ui` library and its theme tokens, plain Tailwind, and offline-generated icons imported from `@flanksource/clicky-ui/icons`. Pages are type-checked by `pnpm run typecheck` at the repo root, so scratch code still has to compile.

## Editing in the browser

**Edit** opens the artifact's source in Monaco beside the live preview. `⌘S` (or the Save button) writes the file to disk; Vite's HMR then refreshes the preview — there is no separate "apply" step, and your own editor sees the same file.

Choose **New → New folder** to create a visible folder. The active page header also exposes **Rename**, **Move**, and **Delete**. Right-click a page for those same page actions, or right-click a folder to create a page or nested folder there; the Context Menu key and Shift+F10 provide the same keyboard access. Rename updates the filename and a simple string-literal `export const meta = { title: "…" }`; derived metadata fails loudly instead of being rewritten. Move and rename rebase the page's relative module and `import.meta.url` references, update incoming TypeScript imports and static `?page=` links under `src/`, and carry feedback to the new slug as one rollback-protected operation. They do not create an alias for the old URL or rewrite prose and comments. Delete confirms the exact `.tsx` path and removes its feedback. These filesystem actions are disabled while the Monaco buffer has unsaved changes and are available only under `vite dev`.

Monaco is configured for TSX but **not** wired to the real type graph: pulling `@flanksource/clicky-ui` types into the browser would cost megabytes, so "cannot find module" diagnostics are suppressed. Syntax, JSX and local type errors still surface; authoritative type checking stays with `pnpm run typecheck` and the dev-server overlay.

Filesystem operations go through `plugins/sources-server.ts` and are confined to `src/pages/**`: slugs must match `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`, parents may not be symbolic links, and every resolved path is re-checked for containment before anything is changed. Filesystem actions are dev-server only.

## Feedback

Two complementary tools:

**react-grab** — hover any element, press `⌘C` to copy it with its React component stack and source location, formatted for a coding agent. It loads in development and built preview.

**Comment pins** — select an element through react-grab and choose **Comment** or **Comment with screenshot**. Write one draft in the focused rail, then choose **Post comment** or **Post with screenshot**. Plain comments never request screen capture. Successful PNGs live under `.playground/screenshots/` (gitignored); cancellation or browser limitations are recorded when capture was requested. Use **Comment on page** for a whole-page note. Every new root persists source context and up to 4 KB of raw HTML.

Comments move through **open → resolved → closed**. An agent or human resolves work after implementing it; only a human can close the resolved thread after review. **Review resolved** opens the global queue, stores the selected thread in `?review=resolved&comment=<id>`, navigates across artifact pages, and advances after **Close & next** or a feedback reply through **Comment & reopen**. The regular rail keeps Open, Resolved, and Closed as separate views.

Comments can carry a positive or negative rating, with or without text. `BestPractice` and `ReviewVariant` in `src/review/ReviewComponents.tsx` build on that same store: each requires a stable fragment id, exposes a permalink, and renders aggregate rating controls. Variants additionally require an explicit discard handler.

**Copy feedback** is a split button. The primary half copies the current page's notes as markdown; its dropdown widens the net:

| Action                            | Copies                                                    |
| --------------------------------- | --------------------------------------------------------- |
| _Copy feedback_ (primary)         | every note on the current page                            |
| _Copy open comments (this page)_  | unresolved notes on the current page                      |
| _Copy all comments (this folder)_ | every note on the current page folder and its descendants |
| _Copy all open comments_          | unresolved notes from **every** page                      |
| _Copy all comments_               | every note from every page, resolved included             |

Anchor labels (`button.btn.primary "Approve"`) are read from the live DOM, so they only exist for the page you are looking at; cross-page actions fall back to the raw CSS path for the heading. New comments include their persisted React component/source path, HTML snapshot, and screenshot result when requested. Every copied root also includes absolute `POST` URLs for adding a reply and marking the thread resolved.

Each root comment menu is ordered **Delete**, **Resolve** (or **Reopen**), **Copy**, **Maximise**. Copy serializes the whole thread with its page, component/source, HTML, replies, screenshot link, and reply/resolve URLs. Maximise opens that same thread with **Thread** and rendered **Markdown** tabs, so the exact copied Markdown can be reviewed first.

Sidebar pages with feedback show their open root-comment count in a badge. Replies and resolved or closed comments do not increase the badge.

If an anchored element disappears (you edited the artifact), the note is _kept_ and flagged as an orphan in a banner and in the rail — never silently dropped or moved.

## Comment API

The same comments are a REST API, so a coding agent can read feedback, act on it, reply and resolve it without a browser. The middleware runs under `vite dev` and local `vite preview`; static hosting must supply its own API.

`GET /__playground/comments/schema` describes every agent-accessible endpoint as tool metadata (name, description, JSON-Schema input, MCP-style `readOnlyHint` / `idempotentHint` / `destructiveHint`), so a model can discover the API rather than being told about it. Human-only close and reopen routes are intentionally omitted:

```bash
curl -s localhost:5274/__playground/comments/schema | jq '.tools[] | {name, description}'
```

| Method   | Path                                  | Body                                               | Purpose                                                                         |
| -------- | ------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `GET`    | `/__playground/comments`              | —                                                  | List; `?page=`, `?status=` (repeat or comma-separate), `?unresolved=true`       |
| `POST`   | `/__playground/comments`              | `{page, author, body?, rating?, anchor?, element}` | Start an open thread with component and HTML context; screenshot is optional    |
| `POST`   | `/__playground/comments/{id}/replies` | `{body, author}`                                   | Reply — page and anchor inherited from the root                                 |
| `POST`   | `/__playground/comments/{id}/resolve` | `{}`                                               | Move an open or in-progress thread to resolved                                  |
| `POST`   | `/__playground/comments/{id}/close`   | `{author:{name,kind:"user"}}`                      | Human approval: move resolved to closed and record attribution                  |
| `POST`   | `/__playground/comments/{id}/reopen`  | `{author:{name,kind:"user"}, body?}`               | Human review: optionally reply, then return resolved or closed feedback to open |
| `PATCH`  | `/__playground/comments/{id}`         | `{body?, status?, rating?}`                        | Edit text/rating or move between active work statuses                           |
| `DELETE` | `/__playground/comments/{id}`         | —                                                  | Remove, cascading to replies                                                    |

Statuses are `open`, `in_progress`, `resolved`, `closed`; the first two are active work. Close and reopen reject non-user actors and invalid stage transitions. The machine-readable tool schema intentionally omits those human-only operations. Ratings are `positive` or `negative`. Every new root's `element` is `{componentName?, source, html, screenshot?}`; `html` is capped at 4 KB and optional `screenshot` is either `{status:"captured", dataUrl:"data:image/png;base64,…"}` or `{status:"unavailable", reason:"unsupported"|"cancelled"|"failed"}`. Invalid or missing context is a 400. A missing `author` also fails because identity is never inferred, so an agent's reply cannot show up as "You". Every comment is addressed by id alone; only `POST /__playground/comments` needs a page.

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

| Concern                          | Where                                                                |
| -------------------------------- | -------------------------------------------------------------------- |
| Page discovery                   | `src/registry.ts` — pure derivation helpers + one `import.meta.glob` |
| Chrome, routing, comment actions | `src/App.tsx`, `src/PlaygroundShell.tsx`                             |
| Grab → anchor string             | `src/comments/dom-anchor.ts`, `src/comments/useReactGrabComments.ts` |
| Anchor ↔ library registry        | `src/comments/useDomAnchors.ts`                                      |
| Comment pins                     | `src/comments/CommentOverlay.tsx`                                    |
| Comment persistence              | `plugins/comments-store.ts`, `plugins/comments-server.ts`            |
| Persisted element context        | `plugins/comments-model.ts`, `src/comments/element-context.ts`       |
| Comment API tool schema          | `plugins/comments-schema.ts`                                         |
| Feedback → markdown for an agent | `src/comments/markdown.ts`                                           |
| Routable review components       | `src/review/ReviewComponents.tsx`                                    |
| Source editing                   | `src/editor/`, `plugins/pages-store.ts`, `plugins/sources-server.ts` |

The comment _UI_ — threads, composer, statuses, the rail — is the library's own `CommentProvider` / `CommentSidePanel`. The playground supplies the React Grab anchor adapter and storage middleware for Vite dev and preview.

```bash
pnpm --filter playground test    # unit tests
pnpm --filter playground check   # icons → tsc → oxlint
```
