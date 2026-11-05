# playground

A scratch surface for one-page TSX artifacts — try a layout, show it to someone, collect anchored feedback, hand it to a coding agent.

Where `apps/kitchen-sink` is a curated catalog of shipped components (every demo hand-registered in `demo-catalog.tsx`), the playground has **no registration step at all**.

The root URL opens the **Comments** dashboard, showing unresolved threads across artifact and external pages. Its shared FilterBar filters by status, projects, pages, author, assignee, or screenshot availability; search comment text and sort using the list's **Sort by** control. Projects follow the first page-path segment; external captures belong to **External pages**. Projects and pages support multiple include/exclude selections: included values match any choice within that filter, exclusions take precedence, and both filters must match. Options include pages with no comments yet so they can be selected for watching. Filters, search, and sorting persist in `comments.*` URL parameters, including repeated `comments.project` / `comments.page` inclusions and their `.exclude` parameters. Each comment uses two rows: the author avatar, page, status, timestamps and actions above a large screenshot and comment body. Screenshot previews expand on hover or keyboard focus and link to the full capture. Each row shows who holds a thread ("Assigned to …"), and the table has an **Assignee** column plus an **Assignee** filter (everyone, **Unassigned**, or a person or agent; persisted as `comments.assignee`). Row icons open the page, acknowledge it, assign it to a person or agent, reopen, resolve, close, or delete a thread; deletion confirms before removing the thread, replies, and capture. **Comments** in the sidebar returns to the dashboard.

**Copy for LLM** copies the current matching threads, replies, source context, screenshots, and instructions for watching the filtered set. Its split-button menu offers **Copy for Claude** and **Copy for Codex** with the corresponding agent attribution. The copied Node reader uses the dashboard's own filter function to select live comments; the instructions poll every ten seconds, keep watching an empty queue, recheck status before editing and resolving, reply with verification evidence before resolving, and leave human closing/reopening decisions untouched. Copy remains available for an empty filtered set so a watcher can wait for its first comment.

Screenshot previews automatically trim uniform light, dark, or transparent margins and faint panel borders, retaining padding around the content. Cropping applies to the preview and hover expansion; the full-capture link opens the original file. Inline mini-threads show the latest two replies, with older replies available to expand. Comments and replies refresh every five seconds while the page is visible.

The `?page=flanksource/brands/flanksource` route is the canonical Flanksource design-system hub. Its tracked foundation and pattern pages document colors, type, spacing, icons, tones, page anatomy, collections, forms with preview, object arrays, and feedback states using the actual shared components.

```bash
pnpm run dev:playground     # http://localhost:5274
```

For a compiled, optimized playground shell with live page editing, run this from the repository root or `apps/playground`:

```bash
pnpm run playground:prod
```

This builds the shell, shared UI, React, and bookmarklet into `apps/playground/dist`, then serves them on port **5275**. React itself is compiled from its development build so Design mode's live preview keeps `overrideProps`; everything else is a production build. Page components, Markdown, metadata, guidance, and Tailwind styles remain live through Vite. Saving a page or its helper publishes a change notice; the **Page reloads** setting controls when updates are applied. Adding, moving, or deleting a page updates the catalog on the next reload without rebuilding the shell. Comments, source editing, and agent-session APIs remain available. Pages compile when opened, so an unrelated broken scratch page does not prevent the shell from building.

Restart the command after changing the shell, shared providers, library code, or dependency configuration. This is a local editing server with a production build of its base UI; dev-server-only actions documented below also work in this mode. Hashed assets are minified, cached, and served with gzip compression. The regular playground uses port **5274**, so both commands can run together. Override the production port with `pnpm run playground:prod --port 5276`; `--host 127.0.0.1` restricts it to loopback.

Load additional comment vocabularies with `PLAYGROUND_VOCABULARY_DIRS=/absolute/path/to/vocabs pnpm run playground:prod` (comma-separated directories). Catalog folders contain `catalog.ts` metadata and `Preview.tsx`; new catalogs and edits refresh at runtime without rebuilding the shell. See [the vocabulary format and runnable example](src/vocabularies/README.md).

**Page reloads** defaults to **Manual**: source changes show **Updates available · Reload**. **Automatic when idle** waits while comment drafts, submissions, or unsaved source edits exist. This preference is saved in localStorage for all pages on the same origin; different ports have separate preferences. Comment drafts and open-thread state use sessionStorage, surviving reloads independently in each tab until it closes. **Saved drafts** provides Copy and Discard actions even when an edited artifact no longer contains the original target. Other apps can opt in by giving `CommentProvider` a document-specific `persistenceKey`; without it, comment UI state stays in memory.

The toolbar's **Playground status** dot includes Gavel and Captain connections alongside comment vocabularies. Open it for each server's address, connection state, error, and **Refresh connections**. Checks refresh every ten seconds while visible and on window focus. Gavel uses `PLAYGROUND_GAVEL_URL` or its on-demand launch address; Captain uses the agent runtime's server. Status checks do not start Gavel: it may show **Disconnected** until a feature starts the launch server. `GET /__playground/connections` returns both checks independently.

Gavel shows **Incompatible** when its OpenAPI document lacks the linter catalog, filtering, or ignore APIs required by repository review. Rebuild and restart that server; the launch-schema endpoint alone does not prove compatibility. Set `PLAYGROUND_GAVEL_BINARY=/absolute/path/to/gavel/.bin/gavel` in the gitignored local environment to use a sibling build for on-demand launches. It defaults to `gavel` on PATH; `PLAYGROUND_GAVEL_URL` takes precedence and selects an externally managed server. Neither compatibility checks nor connection polling stop an incompatible server.

The toolbar's **Agent** menu holds playground session grouping, the default model, and **Auto-run new comments**, followed by active Captain and playground sessions. Select a session to inspect it; **All sessions…** opens history and page-target controls. The top-right **Preferences** avatar groups theme, density, and page reloads. Reload monitoring stays active while the menu is closed. On phones, **Copy feedback** lives in **More actions** so Agent and Preferences remain visible.

Repository failures use the shared error wrapper. **Copy** includes the operation, method, endpoint, HTTP status, response content type, complete response body, and available stack details while **More details** remains collapsed. Non-JSON and malformed JSON responses retain their original body for diagnosis; network failures retain their endpoint and cause.

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

### Navigation metadata and loading

Navigation defaults to source edits or feedback activity within the last seven days. **Show older (N)** reveals older artifacts; **Show recent only** restores the default. The selected page remains visible even when old, and search covers the entire catalog. The age selection persists in `sidebar.age=recent|all` across page navigation and browser history. Markdown documents participate in source-update tracking; external captures use feedback activity.

Page metadata loads on demand for visible and selected pages. Showing older pages, searching globally, and opening the global Comments dashboard may load additional metadata, while page implementations remain lazy. Sidebar badges and pending-review labels use `GET /__playground/comments/activity`, a lightweight per-page projection containing timestamps, root counts and pending assignees without bodies, captured HTML or screenshot context. Activity refreshes every five seconds while visible and immediately after feedback mutations. Viewing an artifact or external capture fetches full feedback only for that page; the Comments dashboard, resolved-review queue and cross-page copy actions fetch global feedback when requested.

Vite serves each page's `meta` through a small `?playground-meta` projection. The sidebar loads these projections without importing page components, fixtures, styles, or unrelated top-level effects. Page implementations load when opened; diagram example implementations load when their tab is selected.

Keep metadata declarative: an exported `const` object, optionally with `satisfies PageMeta`, may reference other local constants, functions, and imported helpers. Generated `Ui*` icons, local icon components, and lightweight factories such as `designSystemPage()` retain their component references. Imported metadata helpers should contain only metadata or small rendering primitives; split an icon out of a full page helper when necessary. A mutable binding, destructuring dependency, or unsupported metadata export reports its source location instead of importing the page as a fallback. Declared metadata must return an object. Omitting `meta` intentionally keeps filename-derived defaults.

The original file remains the single source of metadata. Vite watches the projection source and its normal imported dependencies. With `server.hmr: false`, reload to pick up edited metadata or added, moved, and deleted pages; automatic refresh follows the configured HMR behavior. Rename/move/delete operations keep their existing optimistic navigation updates.

## Editing in the browser

**Edit** opens the artifact's source in Monaco beside the preview. `⌘S` (or the Save button) writes the file to disk, and your own editor sees the same file. HMR is off, so the preview shows the save after a reload: `playground:prod` offers **Updates available · Reload** (see **Page reloads**), and the dev server needs a manual reload.

Helper modules open in the same editor. **Open source** in Design mode (below) opens the module that renders a diagram node, such as `src/pages/flanksource/_facet-diagrams/layouts/capability-map.tsx`, at the node's line. `GET`/`PUT /__playground/sources/files?file=<path under src/pages>` reads and writes `.ts`, `.tsx` and `.css` files there, including `_` helpers. Each read returns a content hash, and a write with a stale `expectedHash` is refused with `409`, so a save never overwrites a change made since the file was opened.

### Design mode: visual editing of facet diagrams

**Design** (beside **Edit**) edits facet diagrams in place. Hover a box or container to show its style chip; pick a value to change its `variant` (`BOX_STYLES`, `CONTAINER_STYLES`) or, for `Tile`/`Zone`, its `role`. Click a title, description, footer, tag or label to edit the text inline; Enter or blur saves, Escape cancels. Each change is written to the TSX that renders the node. **Applies to N nodes** means several rendered nodes share that call site, so the change applies to all of them. Design and Edit are mutually exclusive, and Design cannot start while the editor has unsaved changes.

How a change reaches the source:

- Facet nodes carry stable markers: `data-editable-box` / `data-editable-container` (naming the style prop) and `data-editable-text` (naming the text prop), documented in facet's README under "Editable markers". Any component can emit them.
- `plugins/editable-source-plugin.ts` stamps each facet node call site in `src/pages/**/*.tsx` with `data-editable-source="<file>:<line>:<col>#<ordinal>@<hash>"` at compile time, in dev and `playground:prod`.
- `POST /__playground/visual-edits` with `{page, source, edit: {kind:"style", prop, value} | {kind:"text", prop, from, to}, choose?}` rewrites the source:
  - **Style edits** set a literal attribute at the call site.
  - **Text edits** change the literal attribute on the call site, or else the unique matching string literal or JSX text in the page's module graph. This covers text mapped from arrays and text passed as children of a wrapper.
- Responses:
  - `200` applied.
  - `409` stale: the file changed outside Design mode since the page rendered, so reload.
  - `422` refused: for a computed `variant={…}`, a later spread, an entity in JSX text, or text outside `src/pages`. It names `file:line`, and **Open source** goes there.
  - `422` ambiguous: lists candidates to choose from.

The change is previewed immediately by re-rendering the node through the React DevTools renderer's `overrideProps`. The hook is installed by a classic `<head>` script (`plugins/react-devtools-hook.ts`, bippy's `install-hook-only.iife.js`), which runs before any module, however the shell is bundled. `overrideProps` exists only in React's development build, so `playground:prod` compiles `react` and `react-dom` from their development builds while the shell, every other dependency and the pages stay production builds. Live preview works on both :5274 and :5275. A preview lasts until the page re-renders from source; arrows re-measure on reload.

Design mode needs the local facet checkout (`PLAYGROUND_EXTERNAL_ALIASES`) until a facet release with the editable markers, `Tile`/`Zone` and the style API replaces the pinned `@flanksource/facet@0.1.74`.

Choose **New → New folder** to create a visible folder. The active page header also exposes **Rename**, **Move**, and **Delete**. Right-click a page for those same page actions, or right-click a folder to create a page or nested folder there; the Context Menu key and Shift+F10 provide the same keyboard access. Rename updates the filename and a simple string-literal `export const meta = { title: "…" }`; derived metadata fails loudly instead of being rewritten. Move and rename rebase the page's relative module and `import.meta.url` references, update incoming TypeScript imports and static `?page=` links under `src/`, and carry feedback to the new slug as one rollback-protected operation. They do not create an alias for the old URL or rewrite prose and comments. Delete confirms the exact `.tsx` path and removes its feedback. These filesystem actions are disabled while the Monaco buffer has unsaved changes and are available only under `vite dev`.

A `.md` page renders through the library's `FileReview` (`@flanksource/clicky-ui/file-findings`), with every feature on. It has three views: **Preview** (`view=preview`), **Source** (`view=source`) and **Problems** (`view=problems`). Source is a Monaco editor; `⌘S` saves the file and re-runs `gavel lint` (vale and markdownlint). Findings show as a severity rail and squiggles in Preview, as read-only threads, and as the Problems list. **AI review** adds a Captain grammar and clarity pass; **Lint** runs a Captain prompt on the saved file. To start a comment, select or right-click words. The thread is anchored on the quote (a `q:` anchor: heading path plus surrounding words) and is stored in the playground comment store like any other feedback. It appears in a margin sidebar or inline (⋮ menu), and People/Tools filters threads by author kind. **Hide annotations** removes comment highlights and threads. The shell's generic pins and rail are off on markdown pages, except in the **Review resolved** queue. Try it at [Markdown review](http://localhost:5274/?page=markdown-review); [Annotated markdown](http://localhost:5274/?page=playground%2Fannotated-markdown) shows the same component on fixture documents with comments kept in page state. **Blame** (Source tab) shows who last changed each line, from `git blame` through `/__playground/blame?path=`; it is offered only while the saved file matches the text on screen, and an untracked page says why it has none. [File review](http://localhost:5274/?page=playground%2Ffile-review) opens any tracked workspace file (`?file=`) the same way: syntax-coloured source, blame, and comments anchored on the selected characters (`s:` anchors).

Monaco is configured for TSX but **not** wired to the real type graph: pulling `@flanksource/clicky-ui` types into the browser would cost megabytes, so "cannot find module" diagnostics are suppressed. Syntax, JSX and local type errors still surface; authoritative type checking stays with `pnpm run typecheck` and the dev-server overlay.

Filesystem operations go through `plugins/sources-server.ts` and are confined to `src/pages/**`: slugs must match `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`, helper paths may not be absolute or contain `..`, no path segment may be a symbolic link, and every resolved path is re-checked for containment before anything is changed. Filesystem actions are dev-server only.

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

This is a bookmarklet, so page CSP can block its script or iframe, and browsers may require local-network permission when reaching a local playground from an HTTPS site. Browser internal pages, cross-origin iframe contents and closed shadow roots are outside v1 support. No browser policy is bypassed. The injected host exchanges validated, session-bound messages with a playground-origin iframe; that frame makes same-origin storage requests. Catalog metadata lives in `.playground/external-pages.json`; comments and screenshots use Gavel. The loader is `GET /__playground/bookmarklet.js`; `GET /__playground/external-pages` lists sets, `GET /__playground/external-pages?url=<encoded-url>` resolves an association and returns compatible candidates, and `POST /__playground/external-pages` accepts `{url,title,mergeInto?}` to create or associate a set. Comment requests use the returned `external:<uuid>` page key and include the captured `element.pageUrl`.

Two complementary tools:

**react-grab** — hover any element, press `⌘C` to copy it as Markdown for a coding agent: the component, the page URL, a selector for that instance, its React component stack and up to 4 KB of raw HTML (the same body gavel's react-grab plugin writes). **Copy screenshot** puts the element's PNG and that same Markdown on the clipboard as one item. It loads in development and built preview.

**Comment pins** — activate react-grab's **Comment on element** button and left-click an element to open and focus its floating comment input. Right-click opens the action menu, including **Comment with screenshot**. Write beside the selected element, then choose **Post comment** or **Post with screenshot**. The box follows scrolling and stays open when the pointer leaves. Discard or Escape clears the draft; vocabulary menus consume Escape first. Switching targets preserves drafts for recovery. A failed post keeps the draft and shows an error; a successful post opens the thread in the rail. Plain comments never request screen capture. Successful PNGs are stored as Gavel attachments; cancellation or browser limitations are recorded when capture was requested. Use **Comment on page** for a whole-page note in the rail. Every new root persists source context and up to 4 KB of raw HTML. Bookmarklet comments retain their panel.

Drag the comment rail's left edge to resize it, or focus the divider and use arrow keys (Shift for larger steps, Home/End for the limits). The preferred width survives navigation and reloads. Local rails default to 320px and bookmarklets to 400px, bounded to 280–640px while retaining document space; compact layouts use the full available width. Sidebar comments and replies show three lines, with **Show more / Show less** when needed.

Choose **Maximise** from a comment's actions to open **Thread**, **Capture**, **Agents**, and **Markdown**. Capture holds the screenshot, source and HTML. Agents lists thread-linked and page sessions, retains historical IDs, and loads Captain's existing session inspector on selection. Provider marks use their colors; model labels are compact (for example **Opus 5.5**), with an effort glyph when reported. Full identities remain in tooltips and details. A reply editor stays below every tab, targets the root thread, and retains drafts on failure or closing. Maximizing from a bookmarklet temporarily expands its iframe to the viewport and restores the preferred sidebar width when closed.

**Reviewable elements** — add a stable `data-review-id` to an element, or select it in react-grab and choose **Make reviewable**. The playground adds inline controls for **Approve**, **Reject with comment**, **Request revision**, and **Delete source and feedback**. Rejection and revision require a comment; a newer decision closes the older decision but preserves its rationale. Delete removes the selected JSX element or literal array row from its page source, along with feedback anchored inside it. The source editor must be saved first. Source edits fail when the selected source is ambiguous or has changed since selection.

Source-editable mapped entries must declare a literal `reviewId` in the page's local array; factory-generated IDs cannot identify an editable row. Failed review submissions stay inside the dialog with the draft intact. Review, chat, and comment action errors use `ErrorDetails`: Copy includes the operation identity and available server diagnostics while details remain collapsed. The shared `ActionError` renderer accepts an original error plus labelled context, for example `<ActionError error={error} context={[["Comment", comment.id]]} />`.

```tsx
<section data-review-id="review-summary-row">Summary row</section>
```

Comments move through **open → in progress → resolved → closed**. **Acknowledge** claims an open thread: it becomes in progress with the claimant as its assignee, shown as "Assigned to Claude" on the status chip. A human or an agent can acknowledge; an agent cannot take a thread another holder has, but a human can take over from anyone. A human can also **Assign…** an open or in-progress thread to a configured person or agent, or unassign it to return it to open; the assignee still acknowledges when they start. Resolving keeps the assignee on record, and reopening clears the assignee and acknowledgement along with the close attribution. A human can close an open or in-progress thread directly. An agent or human can resolve work after implementing it; the resolved review queue remains available for a separate approval step. Only a human can close, reopen, or assign a thread. The agent workflow is read, acknowledge, implement, reply, resolve. **Review resolved** opens the global queue, stores the selected thread in `?review=resolved&comment=<id>`, navigates across artifact pages, and advances after **Close & next** or a feedback reply through **Comment & reopen**. The regular rail keeps Open, Resolved, and Closed as separate views.

Comments can carry a positive or negative rating, with or without text. `BestPractice` and `ReviewVariant` in `src/review/ReviewComponents.tsx` build on that same store: each requires a stable fragment id, exposes a permalink, and renders aggregate rating controls. Variants additionally require an explicit discard handler.

**Copy feedback** is a split button. The primary half copies the current page's notes as markdown; its dropdown widens the net:

| Action                            | Copies                                                    |
| --------------------------------- | --------------------------------------------------------- |
| _Copy feedback_ (primary)         | every note on the current page                            |
| _Copy open comments (this page)_  | unresolved notes on the current page                      |
| _Copy all comments (this folder)_ | every note on the current page folder and its descendants |
| _Copy all open comments_          | unresolved notes from **every** page                      |
| _Copy all comments_               | every note from every page, resolved included             |

Anchor labels (`button.btn.primary "Approve"`) are read from the live DOM, so they only exist for the page you are looking at; cross-page actions fall back to the raw CSS path for the heading. New comments include their persisted React component/source path, HTML snapshot, and screenshot result when requested. Every copied root also includes absolute `POST` URLs for acknowledging it, adding a reply and marking the thread resolved, plus its assignee while someone holds it.

Each root comment menu offers **Close** alongside **Resolve** for active comments, and **Reopen** for closed comments. Expanded root cards also show a tick to close directly or a reopen icon in the header. Copy serializes the whole thread with its page, component/source, HTML, replies, screenshot link, and reply/resolve URLs. Maximise opens that same thread with **Thread** and rendered **Markdown** tabs, so the exact copied Markdown can be reviewed first.

Sidebar pages with feedback show their open root-comment count in a badge. Replies and resolved or closed comments do not increase the badge.

The Workspace Explorer pane renders one unified tree (page folders, repository folders and External pages, served by `GET /__playground/navigation`) through Clicky Tree, including search, expand/collapse controls, page/folder context menus and page drag-and-drop. **Sort by** offers **Recent activity** (latest source edit or feedback), **Updated** (page source-file modification time), **Commented** (latest feedback activity), and **Resolved** (latest currently resolved thread). Date sorts put the newest activity first and retain the folder hierarchy. Folder order follows the newest matching descendant.

**Open** includes pages with open or in-progress threads; **Resolved** includes pages with threads waiting for human review. Selecting both matches either status. The default age view includes source edits or feedback within seven days; **Show older** widens it. External captures use feedback timestamps. Closed threads are separate from resolved threads. Filters remain available when no pages match, and **Reset view** restores the recent view and clears search, sorting and filters.

Sidebar settings persist in `sidebar.sort`, `sidebar.filters`, `sidebar.age`, and `sidebar.q` URL parameters, including navigation between artifact and external pages and browser history. Development refreshes source-file dates and comment activity while the page is visible; built artifacts retain source-file dates from their build. `GET /__playground/page-activity` exposes development page timestamps without source content.

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
| `POST`   | `/__playground/comments/{id}/acknowledge` | `{author}`                                                      | Claim an open thread: move it to in progress with `author` as assignee; `409` if another agent holds it or it is resolved/closed |
| `POST`   | `/__playground/comments/{id}/assign`  | `{author:{name,kind:"user"}, assignee:{name,kind?}\|null}`          | Human only: hand an open or in-progress thread to `assignee`, or `null` to unassign and return it to open |
| `POST`   | `/__playground/comments/{id}/agent-run` | `{author:{name,kind:"user"}, runtime?:{spec:{model,…}, presets?}}` | Human only: send the thread into the shared agent session (see below); `runtime` is required only when no session is live |
| `POST`   | `/__playground/comments/{id}/resolve` | `{}`                                                                | Move an open or in-progress thread to resolved                                    |
| `POST`   | `/__playground/comments/{id}/close`   | `{author:{name,kind:"user"}}`                                       | Human close: move open, in-progress, or resolved to closed and record attribution |
| `POST`   | `/__playground/comments/{id}/reopen`  | `{author:{name,kind:"user"}, body?}`                                | Human review: optionally reply, then return resolved or closed feedback to open   |
| `PATCH`  | `/__playground/comments/{id}`         | `{body?, rating?}`                                                  | Edit text or rating; a `status` field is rejected with `400`                      |
| `DELETE` | `/__playground/comments/{id}`         | —                                                                   | Remove, cascading to replies                                                      |

Statuses are `open`, `in_progress`, `resolved`, `closed`; the first two are active work. `in_progress` is reached only through acknowledge or assign, never by editing `status`. A root being worked on carries `assignee`, `acknowledgedBy` and `acknowledgedAt` (an assigned thread has no acknowledgement until its assignee acknowledges); these fields are projected from Gavel's comment and structured content. Repeating acknowledge as the holder changes nothing. Close, reopen and assign reject non-user actors and invalid stage transitions. The machine-readable tool schema lists `acknowledge_comment` but intentionally omits the human-only close, reopen and assign operations. Ratings are `positive` or `negative`. Every new root's `element` is `{componentName?, source, html, screenshot?}`; `html` is capped at 4 KB and optional `screenshot` is either `{status:"captured", dataUrl:"data:image/png;base64,…"}` or `{status:"unavailable", reason:"unsupported"|"cancelled"|"failed"}`. Invalid or missing context is a 400. A missing `author` also fails because identity is never inferred, so an agent's reply cannot show up as "You". Every comment is addressed by id alone; only `POST /__playground/comments` needs a page.

```bash
# What still needs doing, and where
curl -s 'localhost:5274/__playground/comments?unresolved=true' \
  | jq -r '.comments[] | select(.parentId == null) | "\(.page)\t\(.id)\t\(.body)"'

# Claim a note, answer it, then close it out
curl -s -XPOST localhost:5274/__playground/comments/$ID/acknowledge \
  -H 'content-type: application/json' \
  -d '{"author":{"name":"Claude","kind":"agent"}}'
curl -s -XPOST localhost:5274/__playground/comments/$ID/replies \
  -H 'content-type: application/json' \
  -d '{"body":"Fixed in `PricingTable.tsx`.","author":{"name":"Claude","kind":"agent"}}'
curl -s -XPOST localhost:5274/__playground/comments/$ID/resolve
```

Replies land one level deep: replying to a reply attaches to the thread root, matching how the rail renders threads.

### Run agent: captain sessions, shared or per page

**Run agent** (a comment's **Assign…** menu, or the dashboard row's Assign menu) hands a thread to an agent without copying anything. Settings and sessions are recorded in `.playground/agent-sessions.json`:

```json
{
  "settings": { "autoRun": false, "grouping": "shared", "runtime": { "spec": { "model": "…" } } },
  "sessions": [{ "runId": "…", "sessionId": "…", "page": null, "runtime": {}, "startedAt": "…", "state": "running" }]
}
```

`state` is `running`, `ended`, `stopped` or `failed`.

A session is a captain chat whose prompt declares three inline tools (`SESSION_TOOLS`): `list_feedback` reads unresolved threads, and `reply_to_thread` and `resolve_thread` post as the session's agent author. They call this playground's comments API at the origin the session was started from, so the agent never builds those HTTP calls itself. The tools need `curl` and `jq` on the host running captain, and a captain release whose chats bind inline tools.

The toolbar's **Agent** menu edits the settings:

- **Sessions: Shared | Per page** (`grouping`). `shared` keeps one session for every page (`page: null`); `page` gives each page its own session (`page: "<page id>"`), primed to handle only that page's threads. Switching leaves existing sessions alone; they stay listed until stopped or forgotten.
- **Auto-run new comments** (`autoRun`). Every new top-level comment by a human (not review decisions) is sent to its session right after it is stored, exactly as if **Run agent** had been chosen, starting the session if none is live. A failed hand-off shows on the thread as `agentRun.state: "error"` and is logged. Turning it on requires a runtime.
- **Model** (`runtime`). Every new or replacement session starts with it; running sessions keep theirs. The first **Run agent** without one asks for it. Select the model in **Agent → Playground agent** to edit it through clicky-ui's `SpecRuntimeBar`, limited to captain's available agent-mode runtimes (`/__playground/runtime-profiles/runtimes`) and their models (`/__playground/runtime-profiles/models`, proxying captain's `/api/chat/models`).

How a thread reaches its session:

- With no live session for the thread's page (or the shared one), the server starts one with `POST <captain>/api/v1/prompt/run`. The prompt is a draft: the playground skill is the system prompt, the thread is the first message, and the agent runs in the repository root with edit/Bash tools allowed.
- Every later thread for that session is sent as a new message into the same run (`POST <captain>/api/captain/prompt/runs/{runId}/message`).
- The server checks the session against captain before each use. If it finished, failed, was stopped, or captain forgot it (a restart), the next thread starts a replacement with the configured runtime.
- Before sending, the server hands the thread to the agent: it assigns the thread to the session's agent author `{name: <model>, kind:"agent", via:"playground", sessionId}` (a human action, so it can take a thread over) and acknowledges as that author. The message tells the agent its author name, so it must not acknowledge again and must reply and resolve as that author. Completion comes from the agent's own reply and resolve; the server posts no summary.
- A handed-off root stores `agentRun: {sessionId?, requestedAt, state, error?, target?}`, where `state` is `queued` (the agent was busy), `sent`, `done` (the thread was resolved) or `error` (the hand-off failed; `error` says why, and `sessionId` is absent when no session was started). Several roots can share one `sessionId`. Reopening a thread clears it. The thread shows a "Sent to agent session · state" chip that opens the **Agent sessions** panel on that session: a list of every session (page, state, model, **Stop**, **Forget**) and, for the selected one, a live `SessionTail` with an **Inspect** toggle for the full `SessionInspector`.

Failed sends show **Send failed**. Opening the chip shows the target and a short explanation, with the complete error and command in collapsed, scrollable **Technical details**. **Retry send** sends the same thread through the existing agent-run endpoint using the page's current target and runtime settings. It is disabled while sending, closes the dialog on success, and keeps the latest error available after a failed retry. Initial send failures open the same dialog. **Copy** includes the complete diagnostics even while details are collapsed.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/__playground/agent-sessions` | `{settings, sessions}` — running sessions verified against captain first |
| `PUT`  | `/__playground/agent-sessions/settings` | Patch `{autoRun?, grouping?, runtime?}`; `400` on unknown fields or bad values, `409` for `autoRun: true` without a runtime |
| `PUT`  | `/__playground/agent-sessions/targets` | `{page, target}` with `target` `{kind:"playground"}` or `{kind:"captain", sessionId, label}`; answers `{settings}` |
| `GET`  | `/__playground/agent-sessions/captain` | `{sessions:[{id, captainId?, source, title, cwd?, model?, status?, detailAvailable?, inCmux}]}` — Captain's live sessions without their process environment; optional `?page=<page id>` scopes the list to that page/folder |
| `DELETE` | `/__playground/agent-sessions/sessions/{runId}` | Stop the session if it is running and forget it (the panel's **Forget**); the next thread for it starts a new one |
| `GET`  | `/__playground/agent-runs/runs/{runId}` and `.../stream` | Proxy to captain's run snapshot and SSE stream |
| `POST` | `/__playground/agent-runs/runs/{runId}/stop` | Proxy to captain's stop; the stored session becomes `stopped` |
| `GET`  | `/__playground/agent-runs/sessions/{sessionId}` (`?follow=1` for SSE) | Proxy to captain's session transcript, streamed unbuffered; the contract `SessionTail` and `SessionInspector` read |

#### Per-page target: the playground agent or a live captain session

Pages and repository folders show compact running-session bars beneath their header. Pages include sessions working in their containing directory and descendants; folders include their directory and descendants, with complete directory boundaries (`arb` excludes `arb-other`). Explicit page targets and running page/shared playground sessions also appear, deduplicated against live Captain sessions. Each bar shows the agent/model, process status, session ID and latest activity. Select its identity to inspect the session without changing the comment target. Entries awaiting a transcript remain inspectable and say **Transcript unavailable**. Finished sessions disappear on the next refresh; historical sessions remain available through **Agent → All sessions…**. Discovery refreshes every ten seconds while visible and on window focus; failures appear above the bars.

The **Send comments to** popup includes **Project** and **Agent** filters, combined with text search. Projects use full directory paths so equally named directories remain distinct. The selected target and Playground agent remain available while filtering.

Choose **New session…** to select a project from Captain's catalog and an agent/model, then create a managed chat session as the page's target. Creation primes the agent to wait; existing comments are not sent. Explicit sessions are separate from automatic shared/per-page sessions, receive later comments through their managed run, and support Inspect, Stop, and Forget. An ended or forgotten target requires choosing another target.

`GET /__playground/agent-sessions/projects` returns `{projects, defaultProject}`. `POST /__playground/agent-sessions/sessions` accepts `{page, project, runtime}` and returns `{session, settings}` after startup succeeds. Managed targets persist as `{kind:"managed", sessionId, label}`; startup failures preserve the previous selection.

Each page chooses where its threads go: the **Playground agent** (the sessions above), or a **live captain session** — a Claude Code or Codex agent you already run, which captain lists under `GET <captain>/api/captain/sessions/live`. Open **Agent → All sessions…** on an artifact page to change its **Send comments to** target; the bookmarklet rail exposes the same picker for external pages. The choice is stored per page as `settings.targets["<page id>"] = {kind:"captain", sessionId, label}` and applies to **Run agent** (shown as **Send to <label>**) and auto-run alike. Choosing **Playground agent** removes the page's entry. Changing the picker does not resend existing comments or stop existing sessions.

In a failed-send dialog, **Retry send** is a split button. Its primary action retries the configured target; **Send to another target** lists the playground agent and live Captain sessions. Choosing an entry saves it as the thread's page target, then resends that thread. If saving fails, nothing is sent; the dialog retains the chosen target for another retry. This also works for failed threads opened from the global Comments dashboard.

Sending a thread to a captain target:

- The server first checks the session is still in captain's live list. If not, the request is a `409` and the thread is left untouched: the picker marks the target **No longer live** rather than falling back to the playground agent.
- It assigns and acknowledges the thread as `{name: <session model>, kind:"agent", via:"captain", sessionId}`, then `POST <captain>/api/captain/sessions/{id}/deliver` with the thread. The message carries `curl` commands for the thread's reply and resolve URLs, since that session has no playground tools.
- Captain delivers into the running process through its own channel and never resumes the session in a second process: Claude Code's messaging socket (`CLAUDE_CODE_MESSAGING_SOCKET`, read off the live process at delivery time and never stored), then `codex queue --thread`, and otherwise typing into the agent's cmux pane. A session with no live process is `409`; one with no channel is `422`.
- `agentRun.target` records `{label, channel}`, and the chip reads "Sent to <label> via <channel> · state". A `runtime` in the request is refused with `409`, since the target needs none.

Captain is `http://localhost:9020` (`captain serve`), the same base the runtime-profile routes use. If it cannot be reached the route answers `502` naming that URL; there is no fallback. Register `playgroundAgentRuns` before `playgroundComments` (as `vite.config.ts` does): the comments middleware answers every other `/__playground/comments/*` path with `405`. Both share one `createAgentRuns(...)` instance; auto-run is wired as `playgroundComments({dir, onCreated: agentRuns.autoRunComment})`.

### Prompt: run a saved captain prompt on an element

Right-click an element → **Prompt…** picks one of captain's saved prompts (e.g. `diagram-smells`), fills in its arguments and runs it one-shot (`chat:false`). The argument form comes from the prompt's declared input schema, else its listed variables, else the `{{placeholders}}` in its template; `files` is seeded with the element's source file and `input` with its component, source and HTML. **Presets** default to `lint`, which gives lint-style prompts their `{violations:[…]}` output schema.

When the run finishes, the server adds one root comment on the element, authored `{name:"captain", kind:"agent", via:"prompt:<name>"}`:

- lint violations → a body listing each finding, one `checklist` item per violation (`status: "open"`), `refs` with the flagged `file:line`s, and the raw `lint: {violations}`;
- other structured output → a fenced JSON body; free text → the text;
- no violations → no comment (the toast says so); a failed run → no comment, the toast shows captain's error.

Each result also records `promptRun: {promptId, promptName, runId, sessionId?, variables}`. The checklist and provenance are part of the thread markdown an agent receives. With **Auto-run new comments** on, the result is handed to the agent session on behalf of whoever ran the prompt; otherwise use **Run agent** on it. Clients cannot set `checklist`, `refs`, `promptRun` or `lint` through `POST /__playground/comments`.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/__playground/prompts` | `{prompts}` — captain's saved prompts |
| `GET`  | `/__playground/prompts/{id or name}` | `{prompt, variablesSchema}` — the prompt and the schema its arguments are entered with |
| `POST` | `/__playground/prompt-runs` | Start a run: `{promptId, variables, presets, page, anchor, element, author}` (human author; element without screenshot) → `202 {run}` |
| `GET`  | `/__playground/prompt-runs` | `{runs}` — recent runs, `state` `running`, `done` (with `commentId`), `empty` or `failed` (with `error`); kept in memory, so a playground restart forgets them |

Prompts are discovered and run through Gavel's launch API (`gavel launch serve`). The playground starts it on demand: the first prompt request starts `gavel launch serve --root <repo> --local-root <repo> --addr 127.0.0.1:9330` (needs `gavel` on `PATH`), unless a launch server already answers there, as one another playground started does. The playground stops only the server it started, when it shuts down, and starts a new one if that one exits. Set `PLAYGROUND_GAVEL_URL` in `.env.local` to use a launch server you run yourself; the playground then never starts one, and an unreachable URL is a `502` naming it.

## Comments storage

Comments use Gavel's PostgreSQL comments service. Run a recent Gavel binary with a configured local PostgreSQL database, explicitly provision its new comments tables, then start the playground:

```bash
gavel comments provision
pnpm run dev:playground
```

The playground and its launch server use one workspace namespace, `gavel://workspace/<sha256-of-workspace-path>`. Roots map page identity to a target URI; anchors, captured HTML, locator alternatives, ratings, vocabulary definitions, review decisions and prompt provenance are structured comment content. Replies use Gavel messages. Screenshots use Gavel attachments and its blob store. Lifecycle transitions, final human outcomes, versions and audit events belong to Gavel.

The Vite `/__playground/comments` API projects this model for the existing UI and agent tools. Its adapter forwards local actor attribution to Gavel over loopback; remote clients cannot assert actors against this local host. A failed backend operation returns an error and leaves the draft mounted. Page moves and review updates use an atomic batch of versioned comment actions. Deleting a thread hides it and its attachments from normal reads while retaining its audit history.

Existing `.playground/comments.json` files and screenshot directories are left untouched. No old comments are imported or read as a fallback. External-page catalogs, agent-session preferences and prompt associations remain host metadata.

Set `PLAYGROUND_GAVEL_BINARY` in `apps/playground/.env.local` to a rebuilt sibling binary, or `PLAYGROUND_GAVEL_URL` to a separately managed launch server. The server must expose `/api/v1/comments`, its batch/actions/attachments routes, and `/api/v1/comments/openapi.json`. Restart the playground after changing its backend configuration.

Backend integration tests use Gavel's `comments/testhost` and isolated commons-db test databases. A sibling Gavel checkout is required. Run one test worker at a time:

```bash
gavel test --work-dir apps/playground --framework vitest --recursive=false --concurrency 1 -- plugins/comments-server.test.ts plugins/comments-store.test.ts --maxWorkers=1 --no-file-parallelism
```

## How it fits together

| Concern                          | Where                                                                |
| -------------------------------- | -------------------------------------------------------------------- |
| Page discovery                   | `src/registry.ts` — pure derivation helpers + one `import.meta.glob` |
| Chrome, routing, comment actions | `src/App.tsx`, `src/PlaygroundShell.tsx`                             |
| Grab → anchor string             | `src/comments/dom-anchor.ts`, `src/comments/useReactGrabComments.ts` |
| Anchor ↔ library registry        | `src/comments/useDomAnchors.ts`                                      |
| Comment pins                     | `src/comments/CommentOverlay.tsx`                                    |
| Comment persistence              | `plugins/comments-client.ts`, `plugins/comments-projection.ts`            |
| Persisted element context        | `plugins/comments-model.ts`, `src/comments/element-context.ts`       |
| Comment API tool schema          | `plugins/comments-schema.ts`                                         |
| Shared agent session (captain)   | `plugins/agent-runs-server.ts`, `plugins/captain-client.ts`, `src/agent-runs/` |
| Feedback → markdown for an agent | `src/comments/markdown.ts`                                           |
| Routable review components       | `src/review/ReviewComponents.tsx`                                    |
| Source editing                   | `src/editor/`, `plugins/pages-store.ts`, `plugins/sources-server.ts` |
| Design mode (visual edits)       | `src/visual-edit/`, `plugins/editable-source-plugin.ts`, `plugins/editable-jsx.ts`, `plugins/visual-edit-source.ts`, `plugins/visual-edits-server.ts`, `plugins/page-module-graph.ts` |

The comment _UI_ — threads, composer, statuses, the rail — is the library's own `CommentProvider` / `CommentSidePanel`. The playground supplies the React Grab anchor adapter and storage middleware for Vite dev and preview.

```bash
pnpm --filter playground test    # unit tests
pnpm --filter playground check   # icons → tsc → oxlint
```
