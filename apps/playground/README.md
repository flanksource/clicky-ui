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

Browser-mode pages expose lint-style runtime problems, previewed dependency fixes saved to YAML page headers, and browser-local filesystem package overrides. See [Runtime problems and page dependencies](docs/runtime-dependencies.md) for the header format, folder preparation, permission recovery, and reload behavior.

Artifact comments open in a resizable right sidebar on desktop. **Close** or **Hide** minimizes the entire sidebar into the bottom-right **Open comments** floating button, which shows the number of open threads. On phones, that button opens a comments dialog; closing it or pressing Escape returns to the floating button. Comments never take a row below the artifact. Shared consumers can opt in with `<CommentRail open={open} onOpenChange={setOpen} launcherLabel="Open comments">`; the controlled rail uses the shared `Modal` when its host is narrow.

The comment composer's filled paper-plane icon sends a plain comment; **Send options** offers **Post with screenshot**. Submitted comments appear immediately, and the send button shows its loading indicator until saving finishes. A failed send keeps the text in a failed comment card and restores the composer draft, with error details in the card and a notification.

The toolbar's **Playground status** dot includes Gavel and Captain connections alongside comment vocabularies. Open it for each server's address, connection state, error, and **Refresh connections**. Checks refresh every ten seconds while visible and on window focus. Gavel is reached at `PLAYGROUND_GAVEL_URL`, `http://127.0.0.1:9330` by default; Captain at the agent runtime's server. The playground never starts, stops or restarts either: run them yourself, for Gavel `gavel launch serve --root <repo> --local-root <repo>` (add `--addr` to move it off `127.0.0.1:9330`). `GET /__playground/connections` returns both checks independently as `{name, url, status, error?}`.

Gavel and Captain are external: the status menu shows their address and state with no start or restart action, and a server that is down shows **Disconnected** with the connection error until you start it and choose **Refresh connections**. After rebuilding Gavel, restart it where you run it; the playground picks the new build up on its next request.

Gavel shows **Incompatible** when its OpenAPI document (`/api/launch/openapi`) lacks the linter catalog, filtering, or ignore APIs required by repository review. Rebuild and install it (`make install` in the gavel checkout) and restart it where it runs. The launch-schema endpoint alone does not prove compatibility, and neither compatibility checks nor connection polling stop an incompatible server. Comment delivery is not probed: it needs `/api/v1/comments/agent-sessions` (including the scope's managed sessions), `/{id}/deliver`, the batch `/deliver` and the comment agent settings at `/api/v1/comments/agent`, and a Gavel without them fails those requests with its own status (`404`, or `501` for a comments host without agent settings).

The toolbar's **Agent** menu holds playground session grouping, the default model, and **Auto-run new comments on this page**, followed by active Captain and playground sessions. Select a session to inspect it; **All sessions…** opens history and page-target controls. The top-right **Preferences** avatar groups theme, density, and page reloads. Reload monitoring stays active while the menu is closed. On phones, **Copy feedback** lives in **More actions** so Agent and Preferences remain visible.

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

Component authors: see [Making components editable](../docs/src/content/docs/guides/editable-components.md) for the current marker/source contract, authoring examples, verification steps, and the proposed generic component integration.

**Design** (beside **Edit**) edits facet diagrams in place. Hover a box or container to show its style chip; pick a value to change its `variant` (`BOX_STYLES`, `CONTAINER_STYLES`) or, for `Tile`/`Zone`, its `role`. Click a title, description, footer, tag or label to edit the text inline; Enter or blur saves, Escape cancels. Each change is written to the TSX that renders the node. **Applies to N nodes** means several rendered nodes share that call site, so the change applies to all of them. Design and Edit are mutually exclusive, and Design cannot start while the editor has unsaved changes.

Design also discovers source-marked SVG shapes and groups. Click a shape to open its attribute form, preview a change, then **Save** or **Revert**. SVG text and individual `tspan` elements expose **Text content** without flattening nested spans. **Tailwind & theme** offers semantic color and typography utilities alongside the element’s computed values; `className` preserves custom classes and variants. New utilities compile before saving, and theme colors continue to follow light/dark changes. **Reset** removes a presentation attribute, allowing classes or inheritance to control it. Text, attributes and classes save as one draft; computed labels use the existing literal resolver and unsafe edits offer **Request change**. **Show editable** counts visible Facet nodes and SVG targets together, excluding SVG definitions and resources. A marked child shape takes priority over its group. Switching targets with an unsaved or invalid draft keeps the current panel open and asks you to save or revert first. Escape or Close explicitly discards the preview; a save in progress must finish before closing.

Color, font-size, stroke-width and opacity properties use the shared `TailwindColorPickerField` and `TailwindNumberPickerField` controls. Type a literal value or search Tailwind classes in the same input; reset is built into the field. Colors offer theme tokens and the standard palette with swatches; font sizes offer `text-xs` through `text-9xl` with their dimensions. Switching between classes and literals preserves unrelated utilities and responsive variants. **Delete SVG element** asks for confirmation, then removes the selected element and its children in place while saving the source. Failed deletion restores the preview and reports the error. Shared call sites disclose how many rendered instances will be removed. An **Unsaved SVG edits** badge and page banner expose pending drafts with **Save** and **Discard** actions. Navigation and editor closure ask you to **Save and leave**, **Discard and leave**, or **Stay**; reload and tab closure use the browser's warning. The **Saving changes…** banner remains until persistence completes, with success or error notifications. Save or discard a draft before deleting; stale source is refused.

React Grab's **Style element** toolbar and context-menu action use the same selection and editor as Design. Other DOM elements retain React Grab's CSS editor. The playground consumes the React picker at `@flanksource/clicky-ui/react-grab`; `prepare:editor` builds this Clicky UI subpath before startup, build and check. The fork lives in `packages/ui/react-grab` and uses Tailwind v4 for isolated shadow styles.

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

The playground's **Search artifacts** button and **Command+K** (**Ctrl+K** on Windows/Linux) search pages, repository documents, and external captures across the full catalog. Select a result with the arrow keys and Enter. This search is available only in the playground app; the bookmarklet does not bind these shortcuts.

The bookmarklet starts with its comment rail visible. **Minimize** folds it into a bottom-right floating button; restoring it retains the current draft and thread. Element comments open a floating input beside the selected element, following scrolling and fitting within the viewport. Posting opens the saved thread in the rail; discard or Escape clears the draft, while posting failures preserve it. **Comment on page** continues using the rail.

Local `file://` HTML documents are supported alongside HTTP(S) pages. Open the file in your browser and activate the same bookmarklet. Comments are associated with the full file host/path and URL fragment; moving or renaming a file creates a different identity. The playground must be running to load the script and comment rail. The bridge uses the file document's opaque message origin with parent-window and session checks.

Start the playground with `pnpm run dev:playground`, open **Bookmarklet** in the toolbar, and drag **Playground grabber** to your bookmarks bar. **Copy bookmarklet** provides the same `javascript:` URL for manual bookmark installation. Activate the bookmark on an HTTP(S) page, then choose **Select element** or **Comment on page** in its injected rail. Comments, replies, resolution, human closing and reopening use the same persisted store and API as artifact feedback. React source context is included when available; plain HTML captures retain the actual document URL, selector and HTML. Screenshot comments use the selected page's existing optional capture flow.

The grabber starts minimized. Drag its FAB to move it, or focus it and use arrow keys (Shift for larger steps). Click it for compact actions: select an element, select with screenshot, comment on the page, switch the project/session, create a new session, or **Open sidebar**. The sidebar is opt-in; posting or cancelling a floating comment returns to the previous presentation. The FAB position, selected project, active agent session per project, and last successfully used runtime configuration are stored in playground-origin localStorage, subject to browser storage partitioning. Reloading or navigating reuses that project's session; an unavailable session requires an explicit switch or new session. Session creation and switching never send existing feedback.

External pages are grouped by origin, path and URL fragment. The first URL creates a comment set. An unseen query variant automatically joins the first compatible set, with query keys sorted and repeated-value order preserved. Existing exact associations and historical sets remain intact, and captures retain their full URL. Agent-session reuse is independent of these comment sets. Missing or ambiguous anchors remain unavailable with their comments retained.

The playground sidebar lists **External pages** with the original HTML in a sandboxed preview beside captured feedback and resolved threads. HTTP(S) pages load directly and remain subject to their site's framing policy. Registered local `.html`/`.htm` documents load through `GET /__playground/external-pages/html?page=<external-id>&url=<encoded-file-url>`; this serves only the exact file associated with that set, with no arbitrary-path access or sibling asset serving. Local previews support self-contained HTML with inline styles, scripts and embedded assets. Open the original-page link and reactivate the bookmarklet to inspect live anchors or create new captures. Full navigation requires reactivation; repeated activation focuses the existing grabber, and **Close** removes the injected UI and restores existing React Grab settings. The playground must stay reachable. Development and `pnpm --filter playground preview` both serve the loader and storage APIs; build assets with `pnpm --filter playground build` before preview.

This is a bookmarklet, so page CSP can block its script or iframe (use the Chrome extension below on such pages), and browsers may require local-network permission when reaching a local playground from an HTTPS site. Browser internal pages, cross-origin iframe contents and closed shadow roots are outside v1 support. The bookmarklet bypasses no browser policy. The injected host exchanges validated, session-bound messages with a playground-origin iframe; that frame makes same-origin storage requests. Catalog metadata lives in `.playground/external-pages.json`; comments and screenshots use Gavel. The loader is `GET /__playground/bookmarklet.js`; `GET /__playground/external-pages` lists sets, `GET /__playground/external-pages?url=<encoded-url>` resolves an association and returns compatible candidates, and `POST /__playground/external-pages` accepts `{url,title,mergeInto?}` to create or associate a set. Comment requests use the returned `external:<uuid>` page key and include the captured `element.pageUrl`.

**Chrome extension** — the Gavel extension now lives in the [Gavel repository's extension workspace](https://github.com/flanksource/gavel/tree/main/extension). Build and load `extension/dist` there. It connects directly to a Gavel dashboard, supports page comments and agent sessions, and captures todos offline in IndexedDB with cached projects, labels and runtime controls. It has no playground backend. See its README for setup and queue recovery.

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
| `POST`   | `/__playground/comments/{id}/agent-run` | `{author:{name,kind:"user"}, runtime?:{spec:{model,…}, presets?}, target?:{kind:"captain"\|"managed", sessionId, label}, fresh?}` | Human only: have gavel deliver the thread to the live session in `target`, which the browser chose for the thread's page, or to the playground agent when there is none (see below); answers `202 {comment}`. `runtime` is required only when no runtime was saved and no `target` is sent; `409` when the `target` session is no longer there |
| `POST`   | `/__playground/comments/agent-run/batch` | `{author:{name,kind:"user"}, page, runtime?, target?, fresh?}` | Human only: one gavel delivery (`POST /api/v1/comments/deliver`) of every open root of `page` to one target, with the same `target`/`runtime`/`fresh` rules as `agent-run`; roots already delivered to that session (unless that delivery failed) and resolved ones are left out. Answers `202 {comments}`; `409` when no open thread is left, and gavel fails the whole batch (`409`) when a thread went stale |
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

### Run agent: gavel delivery, shared or per page

**Run agent** (a comment's **Assign…** menu, or the dashboard row's Assign menu) hands a thread to an agent without copying anything. The playground does not deliver threads itself: it asks gavel's shared comment delivery (`POST /api/v1/comments/{id}/deliver`, the same path `gavel edit`, the dashboard and the Chrome extension use). Gavel assigns the thread to the agent, acknowledges it as that agent, delivers it, and records the hand-off under the comment's `agentRun`. Settings and the sessions the playground started itself (explicit targets, below) are recorded in `.playground/agent-sessions.json`:

```json
{
  "settings": { "grouping": "shared", "runtime": { "spec": { "model": "…" } } },
  "sessions": [{ "runId": "…", "sessionId": "…", "page": "…", "purpose": "target", "runtime": {}, "startedAt": "…", "state": "running" }]
}
```

`state` is `running`, `ended`, `stopped` or `failed`. A file that still holds `settings.autoRun` or `settings.targets` is refused with a message saying so: auto-run moved to gavel's comment agent settings and a page's session target moved to the browser (see below), and there is no migration, so delete those keys and set the page's target and auto-run again.

The toolbar's **Agent** menu edits the settings:

- **Sessions: Shared | Per page** (`grouping`). Where the playground agent is used, `shared` makes every page's threads share one gavel-managed session (`groupKey` `playground:shared`); `page` gives each page its own (`playground:page:<page id>`). Switching leaves existing sessions alone.
- **Auto-run new comments on this page**. The page's comment agent in gavel's settings: turning it on saves an agent `{enabled: true, prompt: "editor-comments", presets?, spec, instructions, group}` as the page's entry in the project layer (`comments.agents.pages.page/<encodeURIComponent(page id)>`), built from the model and grouping below; gavel then delivers every new top-level comment a human makes on the page, as soon as it is stored, exactly as if **Run agent** had been chosen for the playground agent. Turning it off removes that entry, or saves `{enabled: false}` there when a default agent in another entry or layer would still enable it. The switch reads the page's resolved agent (`agent.agent.enabled`), so it also shows an agent you enabled by editing the settings. It needs a page, so it is disabled where there is none, and it requires a runtime. A change of model or grouping rewrites every enabled page entry of the project layer. Auto-run always starts the playground agent's gavel-managed session; it never delivers into a live session. A failed delivery shows on the thread as `agentRun.state: "error"`. Gavel routes only human-authored roots, so a prompt run's result is not delivered automatically; use **Run agent** on it.
- **Model** (`runtime`). Every new gavel-managed session starts with it; running sessions keep theirs. The first **Run agent** without one asks for it. Select the model in **Agent → Playground agent** to edit it through clicky-ui's `SpecRuntimeBar`, limited to captain's available agent-mode runtimes (`/__playground/runtime-profiles/runtimes`) and their models (`/__playground/runtime-profiles/models`, proxying captain's `/api/chat/models`).

How a thread reaches its agent, by the session the browser sends with **Run agent**:

- **Playground agent** (the default). The server sends gavel `{kind:"run", prompt:"editor-comments", groupKey, runOptions:{spec, presets?, instructions}}`. Gavel starts a managed Captain session from that prompt in its workspace root, with the playground skill and a note about the session's scope in `instructions`, and gives it `list_threads`, `reply_to_thread` and `resolve_thread` tools for the page's threads. The first thread for a `groupKey` starts the session and later ones are delivered into it while it is live; a finished session is replaced. `editor-comments` is gavel's library prompt for working comment threads in a project directory (gavel has no more generic one); its file-specific wording is not load-bearing. A repository document cannot start one (`409`): gavel runs sessions in its own workspace root, not the document's repository, so send its threads to a live session.
- **A live session** (a Claude Code or Codex agent you already run, or an explicit session below), chosen for the page in this browser. The request carries it as `target`, and the server checks it is still there before asking gavel: a playground-created managed session must still be running, a captain session must be in Captain's live list, or either must be a session gavel manages that is running or resumable, else `409` with nothing recorded. Then the server sends gavel `{kind:"session", sessionId}`. Gavel checks the session is still live, assigns the thread to `<source>:<sessionId>` and acknowledges it as that agent, then delivers the thread through Captain's channel for that session: Claude Code's messaging socket, then `codex queue --thread`, and otherwise typing into the agent's cmux pane. The message carries the `gavel comments` commands for replying and resolving as that agent. A session Captain lists but gavel no longer sees live fails the delivery (`502`, recorded on the thread as `agentRun.state: "error"`); the picker marks a vanished target **No longer live** rather than falling back to the playground agent. A `runtime` or `fresh` in the request is refused, since a session needs neither.
- A handed-off root stores `agentRun: {sessionId?, requestedAt, state, error?, target?}`, where `state` is `queued`, `sent`, `done` (the thread was resolved) or `error` (`error` says why), and `target` is `{label, channel?}`. Gavel keeps it under the comment's top-level `content.agentRun`; the playground's projection reads it from there. Several roots can share one `sessionId`. Reopening a thread clears it. The thread shows a "Sent to agent session · state" chip that opens the **Agent sessions** panel on that session: a list of every session and, for the selected one, a live `SessionTail` with an **Inspect** toggle for the full `SessionInspector`. Sessions gavel started are followed through Captain's session transcript like any other.

Gavel-managed sessions are headless runs that end when done, so they would vanish from Captain's live list. Every session picker, **Agent → Active sessions** and each thread's **Assign…** menu (**Send to … · resumes** for an ended one) list them from the merged `captain` listing; choosing an ended one sends `{kind:"session", sessionId}` and gavel resumes it. Gavel records `agentRun.sessionId` after the delivery returns, so after a **Run agent** that started a run, the provider adopts the session once the thread's hand-off (a newer `requestedAt` than before the send) names one: it becomes the page's target, `{kind:"managed", sessionId, label:"<page> · <model>"}` in `playground.page-agent-targets`, and later threads go into it. A failed hand-off adopts nothing.

**Agent → Active sessions** on an artifact page also assigns every open thread at once: **Assign all** on a session row (resuming an ended one), or **Assign all to a new session** (a `fresh` run from the playground runtime, which asks for one if none is saved), through `POST /__playground/comments/agent-run/batch`. The buttons are disabled while the page has no open thread. Choosing a session makes it the page's target; a new session becomes it once adopted as above. A gavel refusal (a stale thread fails the whole batch) shows in the menu and nothing is delivered. Project-scoped bookmarklet panels do not offer it.

Failed sends show **Send failed**. Opening the chip shows the target and a short explanation, with the complete error and command in collapsed, scrollable **Technical details**. **Retry send** sends the same thread through the existing agent-run endpoint using the page's current target and runtime settings. It is disabled while sending, closes the dialog on success, and keeps the latest error available after a failed retry. Initial send failures open the same dialog. **Copy** includes the complete diagnostics even while details are collapsed.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/__playground/agent-sessions` | `{settings, sessions, pages}` — running sessions verified against captain first. With `?page=<page id>`, `pages` is `{<page id>: {autoRun}}` from gavel's resolved comment agent for that page (`GET /api/v1/comments/agent`); without it `pages` is `{}` and gavel is not asked. No session target is stored or returned |
| `PUT`  | `/__playground/agent-sessions/settings` | Patch `{grouping?, runtime?}`; `400` on unknown fields (`autoRun` included) or bad values. A change rewrites every enabled page entry of gavel's project layer, which embeds the runtime and grouping |
| `PUT`  | `/__playground/agent-sessions/auto-run` | `{page, autoRun}`. Saves (`autoRun: true`) or removes (`false`) the page's comment-agent entry through `PUT /api/v1/comments/agent` at the project layer and answers `{autoRun}`; `409` for auto-run without a runtime or on a repository document, `403` when gavel refuses a non-human actor, `501` when the gavel host has no agent settings |
| `GET`  | `/__playground/agent-sessions/captain` | `{sessions:[{id, captainId?, source, title, cwd?, model?, status?, detailAvailable?, inCmux, managed?, resumable?}]}` — Captain's live sessions without their process environment, merged with the sessions gavel launched for threads in this scope (`GET /api/v1/comments/agent-sessions`, `managed: true`), each once; an ended managed session has `status: "ended"` and `resumable: true`, and delivering to it resumes it. Optional `?page=<page id>` scopes Captain's sessions to that page/folder (managed ones run in gavel's workspace, so they are always listed), and repeated `&linked=<session id>` adds the sessions the browser chose for it, which may work elsewhere |
| `DELETE` | `/__playground/agent-sessions/sessions/{runId}` | Stop the session if it is running and forget it (the panel's **Forget**) |
| `GET`  | `/__playground/agent-runs/runs/{runId}` and `.../stream` | Proxy to captain's run snapshot and SSE stream |
| `POST` | `/__playground/agent-runs/runs/{runId}/stop` | Proxy to captain's stop; the stored session becomes `stopped` |
| `GET`  | `/__playground/agent-runs/sessions/{sessionId}` (`?follow=1` for SSE) | Proxy to captain's session transcript, streamed unbuffered; the contract `SessionTail` and `SessionInspector` read |

#### Per-page session target (browser) and auto-run (gavel settings)

Pages and repository folders show compact running-session bars beneath their header. Pages include sessions working in their containing directory and descendants; folders include their directory and descendants, with complete directory boundaries (`arb` excludes `arb-other`). The sessions this browser chose as page targets also appear, deduplicated against live Captain sessions. Each bar shows the agent/model, process status, session ID and latest activity. Select its identity to inspect the session without changing the comment target. Entries awaiting a transcript remain inspectable and say **Transcript unavailable**. Finished sessions disappear on the next refresh; historical sessions remain available through **Agent → All sessions…**. Discovery refreshes every ten seconds while visible and on window focus; failures appear above the bars.

The **Send comments to** popup includes **Project** and **Agent** filters, combined with text search. Projects use full directory paths so equally named directories remain distinct. The selected target and Playground agent remain available while filtering.

Choose **New session…** to select a project from Captain's catalog and an agent/model, then create a managed chat session and choose it as the page's target. Creation primes the agent to wait; existing comments are not sent. Explicit sessions are captain chats the playground starts itself (with the playground's own session tools), receive later comments through gavel like any live session, and support Inspect, Stop, and Forget. An ended or forgotten target requires choosing another target. `GET /__playground/agent-sessions/projects` returns `{projects, defaultProject}`. `POST /__playground/agent-sessions/sessions` accepts `{page, project, runtime}` and returns `{session}` after startup succeeds; startup failures preserve the previous selection.

Each page chooses where its threads go: the **Playground agent**, or a **live session**. Open **Agent → All sessions…** on an artifact page to change its **Send comments to** target; the bookmarklet rail exposes the same picker for external pages. The choice is a browser preference: it lives in `localStorage` (`playground.page-agent-targets`, a map from page id to `{kind, sessionId, label}`; the last session chosen for any page is `playground.agent-target`) and is never written to gavel's settings or to `.playground`. It follows the browser, not the page or the repository, and a storage failure shows a message and sends to the playground agent. The browser sends the page's target with every **Run agent** and **Retry send**. The page's auto-run is the other half: a comment-agent entry in gavel's settings (see **Auto-run** above), which never names a live session, so a page with auto-run on and a live session chosen still has gavel start the playground agent for new comments, while **Run agent** goes to the chosen session. Changing the picker does not resend existing comments or stop existing sessions.

In a failed-send dialog, **Retry send** is a split button. Its primary action retries the page's current target; **Send to another target** lists the playground agent and live Captain sessions. Choosing an entry remembers it as the thread's page target in this browser, then resends that thread with it. If remembering fails, nothing is sent; the dialog retains the chosen target for another retry. This also works for failed threads opened from the global Comments dashboard.

Gavel must be a build with shared delivery and comment agent settings, run outside the playground (see the status menu above). A request for a thread that gavel could not deliver is the status gavel gave it (`502` for a failed delivery, `409` for a stale version, `501` for a comments host without delivery or agent settings), with its message. Captain is `http://localhost:9020` (`captain serve`), the same base the runtime-profile routes and the session proxies use; if it cannot be reached those routes answer `502` naming that URL, and there is no fallback. Register `playgroundAgentRuns` before `playgroundComments` (as `vite.config.ts` does): the comments middleware answers every other `/__playground/comments/*` path with `405`. Nothing in `playgroundComments` watches for new comments: gavel's comment agent does that.

### Prompt: run a saved captain prompt on an element

Right-click an element → **Prompt…** picks one of captain's saved prompts (e.g. `diagram-smells`), fills in its arguments and runs it one-shot (`chat:false`). The argument form comes from the prompt's declared input schema, else its listed variables, else the `{{placeholders}}` in its template; `files` is seeded with the element's source file and `input` with its component, source and HTML. **Presets** default to `lint`, which gives lint-style prompts their `{violations:[…]}` output schema.

When the run finishes, the server adds one root comment on the element, authored `{name:"captain", kind:"agent", via:"prompt:<name>"}`:

- lint violations → a body listing each finding, one `checklist` item per violation (`status: "open"`), `refs` with the flagged `file:line`s, and the raw `lint: {violations}`;
- other structured output → a fenced JSON body; free text → the text;
- no violations → no comment (the toast says so); a failed run → no comment, the toast shows captain's error.

Each result also records `promptRun: {promptId, promptName, runId, sessionId?, variables}`. The checklist and provenance are part of the thread markdown an agent receives. Gavel routes only human-authored comments, so the result is not delivered automatically even where the page has auto-run; use **Run agent** on it. Clients cannot set `checklist`, `refs`, `promptRun` or `lint` through `POST /__playground/comments`.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/__playground/prompts` | `{prompts}` — captain's saved prompts |
| `GET`  | `/__playground/prompts/{id or name}` | `{prompt, variablesSchema}` — the prompt and the schema its arguments are entered with |
| `POST` | `/__playground/prompt-runs` | Start a run: `{promptId, variables, presets, page, anchor, element, author}` (human author; element without screenshot) → `202 {run}` |
| `GET`  | `/__playground/prompt-runs` | `{runs}` — recent runs, `state` `running`, `done` (with `commentId`), `empty` or `failed` (with `error`); kept in memory, so a playground restart forgets them |

Prompts are discovered and run through Gavel's launch API (`gavel launch serve`), which you run yourself: `gavel launch serve --root <repo> --local-root <repo>` listens on `127.0.0.1:9330`, where the playground looks for it. Set `PLAYGROUND_GAVEL_URL` in `.env.local` to use another address; an unreachable URL is a `502` naming it, and the playground never starts or restarts the server.

## Comments storage

Comments use Gavel's PostgreSQL comments service. Run a recent Gavel binary with a configured local PostgreSQL database, explicitly provision its new comments tables, then start the playground:

```bash
gavel comments provision
pnpm run dev:playground
```

Threads live under the scope of the registered gavel project holding the workspace, `gavel://project/<escaped-project-name>`, which the playground looks up in Gavel's `GET /api/projects` (the most specific project directory containing the workspace) on first use; an unregistered workspace is a `422`. Each page's target URI is `<scope>/pages/<encoded page>`, and its comment-agent entry is keyed `pages/<encoded page>` in the project layer. Roots map page identity to that target URI; anchors, captured HTML, locator alternatives, ratings, vocabulary definitions, review decisions and prompt provenance are structured comment content. Replies use Gavel messages. Screenshots use Gavel attachments and its blob store. Lifecycle transitions, final human outcomes, versions and audit events belong to Gavel.

The Vite `/__playground/comments` API projects this model for the existing UI and agent tools. Its adapter forwards local actor attribution to Gavel over loopback; remote clients cannot assert actors against this local host. A failed backend operation returns an error and leaves the draft mounted. Page moves and review updates use an atomic batch of versioned comment actions. Deleting a thread hides it and its attachments from normal reads while retaining its audit history.

Existing `.playground/comments.json` files and screenshot directories are left untouched. No old comments are imported or read as a fallback. External-page catalogs, agent-session preferences and prompt associations remain host metadata.

Comments need a Gavel server that hosts project-scoped comments and `GET /api/projects`, such as `gavel serve` (`http://localhost:9092`); set `PLAYGROUND_GAVEL_URL` in `apps/playground/.env.local` to it and rebuild and restart it after upgrading Gavel. `gavel launch serve` only accepts its own `gavel://workspace/<hash>` scope, so it cannot hold the playground's threads. The server must expose `/api/v1/comments`, its batch/actions/attachments routes, the agent delivery routes (`/api/v1/comments/agent-sessions`, `/{id}/deliver`, the batch `/deliver`), the comment agent settings (`GET`/`PUT /api/v1/comments/agent`) and `/api/v1/comments/openapi.json`; there is no `/api/v1/comments/routes`. Restart the playground after changing its backend configuration.

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
| Agent delivery (gavel comment agents), browser session targets and captain sessions | `plugins/agent-runs-server.ts`, `plugins/comments-client.ts`, `plugins/captain-client.ts`, `src/agent-runs/` |
| Feedback → markdown for an agent | `src/comments/markdown.ts`                                           |
| Routable review components       | `src/review/ReviewComponents.tsx`                                    |
| Source editing                   | `src/editor/`, `plugins/pages-store.ts`, `plugins/sources-server.ts` |
| Design mode (visual edits)       | `src/visual-edit/`, `plugins/editable-source-plugin.ts`, `plugins/editable-jsx.ts`, `plugins/visual-edit-source.ts`, `plugins/visual-edits-server.ts`, `plugins/page-module-graph.ts` |

The comment _UI_ — threads, composer, statuses, the rail — is the library's own `CommentProvider` / `CommentSidePanel`. The playground supplies the React Grab anchor adapter and storage middleware for Vite dev and preview.

```bash
pnpm --filter playground test    # unit tests
pnpm --filter playground check   # icons → tsc → oxlint
```
