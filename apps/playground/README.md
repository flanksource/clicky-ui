# playground

A scratch surface for one-page TSX artifacts — try a layout, show it to someone, collect anchored feedback, hand it to a coding agent.

Where `apps/kitchen-sink` is a curated catalog of shipped components (every demo hand-registered in `demo-catalog.tsx`), the playground has **no registration step at all**.

The root URL opens the **Comments** dashboard, showing unresolved threads across artifact and external pages. Its shared FilterBar filters by status, projects, pages, author, or screenshot availability; search comment text and sort using the list's **Sort by** control. Projects follow the first page-path segment; external captures belong to **External pages**. Projects and pages support multiple include/exclude selections: included values match any choice within that filter, exclusions take precedence, and both filters must match. Options include pages with no comments yet so they can be selected for watching. Filters, search, and sorting persist in `comments.*` URL parameters, including repeated `comments.project` / `comments.page` inclusions and their `.exclude` parameters. Each comment uses two rows: the author avatar, page, status, timestamps and actions above a large screenshot and comment body. Screenshot previews expand on hover or keyboard focus and link to the full capture. Row icons open the page, reopen, resolve, close, or delete a thread; deletion confirms before removing the thread, replies, and capture. **Comments** in the sidebar returns to the dashboard.

**Copy for LLM** copies the current matching threads, replies, source context, screenshots, and instructions for watching the filtered set. Its split-button menu offers **Copy for Claude** and **Copy for Codex** with the corresponding agent attribution. The copied Node reader uses the dashboard's own filter function to select live comments; the instructions poll every ten seconds, keep watching an empty queue, recheck status before editing and resolving, reply with verification evidence before resolving, and leave human closing/reopening decisions untouched. Copy remains available for an empty filtered set so a watcher can wait for its first comment.

Screenshot previews automatically trim uniform light, dark, or transparent margins and faint panel borders, retaining padding around the content. Cropping applies to the preview and hover expansion; the full-capture link opens the original file. Inline mini-threads show the latest two replies, with older replies available to expand. Comments and replies refresh every five seconds while the page is visible.

The `?page=flanksource` route is the canonical Flanksource design-system hub. Its tracked foundation and pattern pages document colors, type, spacing, icons, tones, page anatomy, collections, forms with preview, object arrays, and feedback states using the actual shared components.

```bash
pnpm run dev:playground     # http://localhost:5274
```

## Adding an artifact

For coding agents, open **Agent instructions** in the toolbar. **Copy playground instructions** copies the current page URL, feedback API schema address, and the playground workflow. **Copy skill installation instructions** copies a prompt that asks your agent to save the reusable `clicky-ui-playground` skill in your workspace. Both use the canonical [playground skill](../../.agents/skills/clicky-ui-playground/SKILL.md), including page creation, shared component usage, browser verification, and feedback handling.

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

## Verification cookbook

Open [Every step kind, every state](http://localhost:5274/?page=gavel%2Ftest-results-cookbook&recipe=step-kinds&tab=result) after starting `pnpm run dev:playground`. This is an illustrative native Gavel result with checklist verdicts as a fixture step, a structured summary, and step attempts. Select a step in the tree, then use **Detail** to inspect execution, **Outputs** for its structured result, or **JSON** for the raw selected step result. JSON remains available when a step has no Outputs and follows the selected attempt.

The step-kinds recipe uses the compact wait summary: condition, actual elapsed badge, outcome and final-output preview, with complete values in Outputs. The step-attempt selector lives in the detail header and appears for the retried launch; execution, wait, Outputs and Copy details follow the selected attempt. `step=<node name>&attempt=1` preserves that selection across reloads. [Full run attempts](http://localhost:5274/?page=gavel%2Ftest-results-cookbook&recipe=step-kinds-retry-history&tab=result) has a separate run selector, saved in `runAttempt`, and a summary for each full attempt. The Data tab shows the complete proposed result, including both attempt levels.

The Captain verifier envelope remains under **Captain verifier envelope** for comparison. The **Recorded Gavel runs** recipes show small, labeled projections of four distinct snapshots: the October 15 watcher fixture, the October 18 terminal-ask fixture and Ginkgo test run, and an xero-cli template render benchmark. The xero-cli recipe shows eight representative steps from a 41-step run, with source totals, a benchmark summary, redacted SQL samples, resource metrics, trace references, outputs, and projected JSON. Its saved step attempts and the recorded Ginkgo attempts are initial attempts, not a retry history.

## Feedback

### Bookmarklet for external pages and local files

Local `file://` HTML documents are supported alongside HTTP(S) pages. Open the file in your browser and activate the same bookmarklet. Comments are associated with the full file host/path and URL fragment; moving or renaming a file creates a different identity. The playground must be running to load the script and comment rail. The bridge uses the file document's opaque message origin with parent-window and session checks.

Start the playground with `pnpm run dev:playground`, open **Bookmarklet** in the toolbar, and drag **Playground grabber** to your bookmarks bar. **Copy bookmarklet** provides the same `javascript:` URL for manual bookmark installation. Activate the bookmark on an HTTP(S) page, then choose **Select element** or **Comment on page** in its injected rail. Comments, replies, resolution, human closing and reopening use the same persisted store and API as artifact feedback. React source context is included when available; plain HTML captures retain the actual document URL, selector and HTML. Screenshot comments use the selected page's existing optional capture flow.

External pages are grouped by origin, path and URL fragment. The first URL creates a comment set. A new query variant offers **Merge** into an existing set or **New comment set**; that association is remembered, with query keys sorted and repeated-value order preserved. Merge associates the URL without deleting or moving threads. The rail follows SPA URLs, preserves mounted drafts by comment set, refreshes every five seconds while visible and on focus, and restores pins on reactivation. Missing or ambiguous anchors remain unavailable with their comments retained.

The playground sidebar lists **External pages** with the original HTML in a sandboxed preview beside captured feedback and resolved threads. HTTP(S) pages load directly and remain subject to their site's framing policy. Registered local `.html`/`.htm` documents load through `GET /__playground/external-pages/html?page=<external-id>&url=<encoded-file-url>`; this serves only the exact file associated with that set, with no arbitrary-path access or sibling asset serving. Local previews support self-contained HTML with inline styles, scripts and embedded assets. Open the original-page link and reactivate the bookmarklet to inspect live anchors or create new captures. Full navigation requires reactivation; repeated activation focuses the existing grabber, and **Close** removes the injected UI and restores existing React Grab settings. The playground must stay reachable. Development and `pnpm --filter playground preview` both serve the loader and storage APIs; build assets with `pnpm --filter playground build` before preview.

This is a bookmarklet, so page CSP can block its script or iframe, and browsers may require local-network permission when reaching a local playground from an HTTPS site. Browser internal pages, cross-origin iframe contents and closed shadow roots are outside v1 support. No browser policy is bypassed. The injected host exchanges validated, session-bound messages with a playground-origin iframe; that frame makes same-origin storage requests. Catalog metadata lives in `.playground/external-pages.json`, alongside `comments.json` and screenshots. The loader is `GET /__playground/bookmarklet.js`; `GET /__playground/external-pages` lists sets, `GET /__playground/external-pages?url=<encoded-url>` resolves an association and returns compatible candidates, and `POST /__playground/external-pages` accepts `{url,title,mergeInto?}` to create or associate a set. Comment requests use the returned `external:<uuid>` page key and include the captured `element.pageUrl`.

Two complementary tools:

**react-grab** — hover any element, press `⌘C` to copy it as Markdown for a coding agent: the component, the page URL, a selector for that instance, its React component stack and up to 4 KB of raw HTML (the same body gavel's react-grab plugin writes). **Copy screenshot** puts the element's PNG and that same Markdown on the clipboard as one item. It loads in development and built preview.

**Comment pins** — select an element through react-grab and choose **Comment** or **Comment with screenshot**. Write one draft in the focused rail, then choose **Post comment** or **Post with screenshot**. Plain comments never request screen capture. Successful PNGs live under `.playground/screenshots/` (gitignored); cancellation or browser limitations are recorded when capture was requested. Use **Comment on page** for a whole-page note. Every new root persists source context and up to 4 KB of raw HTML.

**Reviewable elements** — add a stable `data-review-id` to an element, or select it in react-grab and choose **Make reviewable**. The playground adds inline controls for **Approve**, **Reject with comment**, **Request revision**, and **Delete source and feedback**. Rejection and revision require a comment; a newer decision closes the older decision but preserves its rationale. Delete removes the selected JSX element or literal array row from its page source, along with feedback anchored inside it. The source editor must be saved first. Source edits are available only under `vite dev` and fail when the selected source is ambiguous or has changed since selection.

```tsx
<section data-review-id="review-summary-row">Summary row</section>
```

Comments can move through **open → resolved → closed**, or a human can close an open or in-progress thread directly. An agent or human can resolve work after implementing it; the resolved review queue remains available for a separate approval step. Only a human can close or reopen a thread. **Review resolved** opens the global queue, stores the selected thread in `?review=resolved&comment=<id>`, navigates across artifact pages, and advances after **Close & next** or a feedback reply through **Comment & reopen**. The regular rail keeps Open, Resolved, and Closed as separate views.

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

Each root comment menu offers **Close** alongside **Resolve** for active comments, and **Reopen** for closed comments. Expanded root cards also show a tick to close directly or a reopen icon in the header. Copy serializes the whole thread with its page, component/source, HTML, replies, screenshot link, and reply/resolve URLs. Maximise opens that same thread with **Thread** and rendered **Markdown** tabs, so the exact copied Markdown can be reviewed first.

Sidebar pages with feedback show their open root-comment count in a badge. Replies and resolved or closed comments do not increase the badge.

The AppShell sidebar renders its folders and pages through Clicky Tree, including search, expand/collapse controls, page/folder context menus and page drag-and-drop. **Sort by** offers **None** (the configured page order), **Updated** (page source-file modification time), **Commented** (latest root comment or reply), and **Resolved** (latest currently resolved thread). Date sorts put the newest activity first and retain the folder hierarchy. Folder order follows the newest matching descendant.

**Open** includes pages with open or in-progress threads; **Resolved** includes pages with threads waiting for human review. Selecting both matches either status. **Recently updated** restricts those results to page files changed within seven days. Closed threads are separate from resolved threads. External captures have no local source-file timestamp, so they do not match Recently updated. Filters remain available when no pages match, and **Reset view** clears search, sorting and filters.

Sidebar settings persist in `sidebar.sort`, `sidebar.filters`, and `sidebar.q` URL parameters, including navigation between artifact and external pages and browser history. Development refreshes source-file dates and comment activity while the page is visible; built artifacts retain source-file dates from their build. `GET /__playground/page-activity` exposes development page timestamps without source content.

If an anchored element disappears (you edited the artifact), the note is _kept_ and flagged as an orphan in a banner and in the rail — never silently dropped or moved.

## Comment API

The same comments are a REST API, so a coding agent can read feedback, act on it, reply and resolve it without a browser. The middleware runs under `vite dev` and local `vite preview`; static hosting must supply its own API.

`GET /__playground/comments/schema` describes every agent-accessible endpoint as tool metadata (name, description, JSON-Schema input, MCP-style `readOnlyHint` / `idempotentHint` / `destructiveHint`), so a model can discover the API rather than being told about it. Human-only close and reopen routes are intentionally omitted:

```bash
curl -s localhost:5274/__playground/comments/schema | jq '.tools[] | {name, description}'
```

| Method   | Path                                  | Body                                                                | Purpose                                                                           |
| -------- | ------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET`    | `/__playground/comments`              | —                                                                   | List; `?page=`, `?status=` (repeat or comma-separate), `?unresolved=true`         |
| `POST`   | `/__playground/comments`              | `{page, author, body?, rating?, reviewDecision?, anchor?, element}` | Start a thread or a human review decision with component and HTML context         |
| `POST`   | `/__playground/comments/{id}/replies` | `{body, author}`                                                    | Reply — page and anchor inherited from the root                                   |
| `POST`   | `/__playground/comments/{id}/resolve` | `{}`                                                                | Move an open or in-progress thread to resolved                                    |
| `POST`   | `/__playground/comments/{id}/close`   | `{author:{name,kind:"user"}}`                                       | Human close: move open, in-progress, or resolved to closed and record attribution |
| `POST`   | `/__playground/comments/{id}/reopen`  | `{author:{name,kind:"user"}, body?}`                                | Human review: optionally reply, then return resolved or closed feedback to open   |
| `PATCH`  | `/__playground/comments/{id}`         | `{body?, status?, rating?}`                                         | Edit text/rating or move between active work statuses                             |
| `DELETE` | `/__playground/comments/{id}`         | —                                                                   | Remove, cascading to replies                                                      |

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
