# Page host

A static browser editor for TSX, JSX and MDX pages. The host uses Clicky UI’s AppShell, Workspace, Tree, Tabs, form controls and Monaco editor. Page compilation, package resolution, styles and rendering run inside `PageFrame` on a separate runtime origin. The host serves no compiler or renderer API.

## Local development

Run commands from `/Users/moshe/go/src/github.com/flanksource/clicky-ui`. Dependencies are already installed by the workspace owner.

Build the workspace libraries and runtime static files first. The linked facet checkout is `../facet`; both libraries must ship `dist/runtime/importmap.json` and `dist/runtime/barrels.json`:

```bash
pnpm --filter @flanksource/clicky-ui build
```

Build facet's components, CSS and runtime in order:

```bash
pnpm --dir ../facet run build:components
pnpm --dir ../facet run build:css
pnpm --dir ../facet run build:runtime
```

The static runtime bundles `@flanksource/*` dependencies such as facet. Build with `--dev` to take them from sibling checkouts of this workspace (each `../<repo>` or `../<repo>/packages/*` whose `package.json` declares the package) instead of the installed releases:

```bash
pnpm --filter @flanksource/page-runtime build --dev
```

Start these in separate terminals:

```bash
pnpm --filter page-host dev:runtime
```

```bash
pnpm --filter page-host dev
```

Open `http://localhost:5810`. The runtime serves `@flanksource/page-runtime/static/*` at `http://localhost:5811`, with `bootstrap.html` at `/frame/*` and a development `profile.json` at the origin root. Its first visit registers the service worker and reloads once. The iframe sandbox allows scripts, its separate origin’s storage and print dialogs; exports are downloaded by the host.

`dev:runtime` also starts the [workspace package registry and origin](../../packages/page-runtime/src/dev/README.md) on `http://127.0.0.1:5812`, configured explicitly with `packages/ui` and `../facet`. Both profile endpoints point there. Their actual package names and versions are read from disk; local metadata uses the explicit development release date `2000-01-01T00:00:00.000Z` to pass the seven-day minimum release age. The server checks that both libraries' runtime fragments exist before listening. Missing artifacts fail startup. Package files are unchanged build bytes; the frame uses no local source aliases. Other packages and transitive files proxy to npm/unpkg.

Set **both** `PAGE_PACKAGE_ORIGIN` and `PAGE_REGISTRY` to use an external package service instead of starting the workspace server. These must serve real, matching library artifacts, including integrity bytes. `PAGE_PACKAGE_PORT` changes the local package port; `PAGE_UPSTREAM_REGISTRY` and `PAGE_UPSTREAM_ORIGIN` configure its upstreams. `PAGE_RUNTIME_PORT` changes the static runtime port and `PAGE_HOST_ORIGIN` changes its allowed embedder. Set `VITE_PAGE_RUNTIME_ORIGIN` to that exact origin when starting/building the host. The host and runtime origins must differ.

## CommonJS additional packages

Managed libraries and their dependency closures always use published runtime sets. Additional packages that ship ESM come unchanged from the package origin. To allow CommonJS-only additional packages, configure the runtime's `profile.json` with a converter origin:

```json
{
  "policy": {
    "dependencies": "strict",
    "allow": ["date-fns", "react-copy-to-clipboard"]
  },
  "convert": { "origin": "https://esm.internal.example" }
}
```

`convert.origin` must be an HTTP(S) origin without credentials, a path, query or fragment. Conversion works under any `policy.dependencies`; direct package requests still obey the policy: `any` allows every declared package, while `strict` and `ask` allow only the names or `*` globs in `policy.allow`. Dependencies resolve recursively and peers must accept the managed base set. Omitting `convert` retains the CommonJS-only error.

Use a self-hosted esm.sh image at a fixed `ghcr.io/esm-dev/esm.sh:<version>` tag for deployments. Replace `<version>` with the exact image release selected for the deployment; do not use `latest` or a moving tag. Set `CORS_ALLOW_ORIGINS` to the tenant runtime origins that fetch converted modules, rather than the embedding host. For example, with `ESM_SH_VERSION` set to that fixed release:

```bash
docker run --name page-runtime-esm -p 8080:8080 -e CORS_ALLOW_ORIGINS=https://tenant.pages.example.com "ghcr.io/esm-dev/esm.sh:${ESM_SH_VERSION:?Set an exact esm.sh image release}"
```

Expose that service through the HTTPS origin configured in `convert.origin`. The runtime adds that origin to frame CSP `connect-src`. Requests use `/*package@version?dev&target=es2022`, keeping dependencies bare so React resolves to the managed singleton. The worker serves converted files under `/esm/`, pins each raw file's SHA-384 and a digest of the crawled listing in the page lock, and rejects Node polyfills and internal imports leaving the package's own path. Converted output can change across converter releases. An integrity mismatch requires re-resolving the page lock, or pinning the converter to a fixed self-hosted image; it never silently accepts new bytes.

For a live development check with the public service, start the runtime explicitly:

```bash
PAGE_HOST_PROFILE=developer PAGE_ESM_SH_ORIGIN=https://esm.sh pnpm --filter page-host dev:runtime
```

The environment variable adds `react-copy-to-clipboard` to the `strict` policy allowlist. It is rejected outside the developer profile. With no variable set, the default profile allows no additional packages. Add `"react-copy-to-clipboard": "5.1.1"` to the project's `package.json` dependencies, then render this page and check that its button appears without React hook or context errors:

```tsx
import CopyToClipboard from "react-copy-to-clipboard";

export default function Page() {
  return <CopyToClipboard text="Page runtime"><button>Copy page text</button></CopyToClipboard>;
}
```

Recorded esm.sh responses and spike findings live in [the esm.sh spike](../../packages/page-runtime/spikes/esm-sh/README.md). The Chromium regression serves those recordings from a local fixture converter; CI makes no requests to esm.sh. Run it separately when verification is permitted:

```bash
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- --config vitest.browser.config.ts src/sw/converted.browser.ts
```

## Sources and saves

The source tree lists text modules and assets: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.md`, `.mdx`, `.json`, `.css`, `.txt`, `.svg`. Dependency directories and `.git` are excluded. Each project requires `package.json` with a `dependencies` object and at least one TSX, JSX or MDX page. Binary source assets are not supported by the runtime’s text-buffer protocol.

- **Host buffers:** the initial diagram project. Edits reach the frame before saving. “Save browser copy” stores the project in IndexedDB.
- **Browser project:** “Open browser project” reads OPFS under the host origin’s `page-host` directory. An empty project is initialized with the diagram. “Save files” writes its sources and metadata. OPFS availability is checked explicitly.
- **Local folder:** “Open folder” asks for a read/write directory through File System Access. This needs a supported Chromium browser and user activation. “Save files” writes the selected folder. The browser grants access only to the chosen directory.
- **URL:** a CORS-enabled raw TSX/JSX/MDX file or a multi-file project JSON document. Raw sources use the current project’s library defaults. “Save browser copy” stores edits and locks under the source URL in IndexedDB; it does not write to the remote endpoint. Reopening fetches the remote endpoint first and then restores the explicitly saved browser copy.
- **URL hash:** “Create share URL” stores the full project, including all source buffers and per-page locks, in a deflate-compressed UTF-8/base64url `#page=` payload. “Save to URL” updates it. Anyone with that URL receives its source and lock. Browser URL size limits apply.

Directory projects keep their name, selected entry and locks in `.page-runtime.json`. Frame lock messages update that metadata without writing unsaved source buffers. A lock resolved from unsaved library declarations is persisted only when those declarations are saved. Runtime errors leave the editor available. Invalid `package.json` pauses the preview until it is corrected. Save or create a share URL before switching source providers to preserve edited buffers.

The **Libraries** tab writes only the preview page’s overrides under `pageRuntime.pages` in `package.json`. Selecting a clicky-ui version selects its React runtime too. Applying an override invalidates only that page’s lock; other pages keep theirs. Folder defaults remain in `dependencies`.

Project JSON documents have this shape:

```json
{
  "format": 1,
  "name": "Report",
  "entry": "report.tsx",
  "files": {
    "package.json": "{\"dependencies\":{\"@flanksource/clicky-ui\":\"^0.3\",\"@flanksource/facet\":\"^0.1\"}}",
    "report.tsx": "export default () => <h1>Report</h1>;"
  },
  "locks": {}
}
```

## Export and print

After readiness, “Export HTML” requests a frame snapshot and saves the returned HTML on the host. The runtime owns CSS/asset inlining and script removal. “Print” requests the frame’s `window.print()`, preserving page and library print styles. Both controls are disabled until ready. Export and print errors remain visible on the host.

## Runtime activity

Expand **Runtime activity** below the preview to inspect the current frame load. Collection continues while the panel is collapsed, with host updates batched every 40 ms and the panel mounted only when expanded. Each navigation starts a fresh request list and timeline; Summary keeps the previous load's totals for comparison. Frame timeline delivery is scheduled after visible/ready notifications so diagnostics do not delay them.

- **Libraries** groups requested files by package and version, with origin URLs, file counts, declared transferred payload bytes, decoded sizes, cache ratios and managed-library/base-set/additional-package roles. React and React DOM have their actual runtime versions and sizes even when their files ship inside clicky-ui's runtime set.
- **Requests** filters by route kind, package and source. The virtualized table sorts by transferred/decoded/output size and elapsed time. Select a request to inspect its full URL, package path, cache layer, origin, phase timings, error and response headers. Generated JSON/stylesheet modules retain their download source and identify their transform separately.
- **Timeline** shows navigation-relative boot phases, library-set Tailwind compilation, candidate counts, CSS sizes and cache hits. After an editor change it also shows input-to-visible reload time; programmatic buffer changes start at the source push. The frame's `visible` mark is taken after its first rendered paint, independently of full readiness.
- **Summary** shows request and byte totals, cache hits, compilation time, time to ready, resolved versions, base-set mappings and the actual inline import-map size and scope count.

Every intercepted worker response includes `Server-Timing` metrics for fetch, integrity, compile, rewrite, total and cache hit/miss, visible in Chromium's Network panel. Request records are delivered per controlled client in batches of at most 32, normally every 40 ms. The worker retains early requests until the frame subscribes after its first paint; boot failures subscribe too, preserving failed-request diagnostics. The frame batches records with its timeline and Tailwind updates before forwarding them. The session-bound bridge validates bounded records, strings, headers, timelines and runtime metadata; it excludes cookies and authorization headers.

Transferred sizes are the package origin's declared encoded body length, excluding HTTP headers. They display **Unavailable** when the origin omits `Content-Length`; decoded and transformed sizes remain measured independently. The workspace package server reports the bytes it serves. Opaque cross-origin responses remain opaque: the browser exposes neither sizes nor response headers, and forbids adding `Server-Timing` to them. Linked routes measure fetch, integrity, compile and rewrite independently, retain these costs on failures, and identify memory versus Cache Storage hits. Folder reads transfer zero network bytes. A warm output hit reports zero fetch/compute work and retains the original source size; a content hit after reading a source retains that request's actual transfer/fetch cost.

`RuntimeActivity`, `appendActivity`, `emptyActivity` and the activity types are exported from `@flanksource/page-runtime/host`. A host accumulates validated `activity` messages with `appendActivity({ state, message, editStartedAt? })` and renders `<RuntimeActivity activity={state} />` in a bounded-height container. Include the package's `src/host` files in the host's Tailwind source scanning; this app declares that source in `src/styles.css`.

`clearPageRuntimeCache({ runtimeOrigin, scope })` is exported from `@flanksource/page-runtime/host` for hosts that offer a "clear the page runtime cache and try again" recovery. It unregisters the runtime service worker registered with `scope` (for example `/frame/`), deletes every `page-runtime-*` Cache Storage cache and the `page-runtime` IndexedDB database, and resolves with the names it removed (`{ caches, databases, registrations }`). It rejects if a browser API is unavailable, refuses, or the database deletion is blocked by another open connection; it never touches `localStorage` or the host-origin `page-runtime-links` store of linked checkouts. Reopen the page afterwards: the host re-registers the worker and the next `open` stores a fresh page record.

The focused panel E2E uses agent-browser with Chrome on isolated local ports 5910–5912, verifies the diagram, libraries, npm filtering, request headers, edit/reset behavior and both desktop layouts, and writes screenshots and evidence under `.tmp/U-runtime-activity/`:

```bash
gavel test --work-dir ./apps/page-host --framework vitest --recursive=false -- --config vitest.activity.config.ts src/activity.browser.ts
```

The worker/frame browser contract is verified separately:

```bash
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- --config vitest.browser.config.ts src/frame/activity.browser.ts
```

## Comments and screenshots

“Comment on element” opens the rail and enables the frame's picker. Select an element to compose a thread; “Whole-page comment” selects the page. The rail uses `@flanksource/clicky-ui/comments` for the composer, threads, statuses, assignment and draft recovery. Pins, highlights, scroll requests and keyboard shortcuts use the validated page-agent bridge. Recovered pins remain visible as found, moved or orphaned. Element HTML is displayed as text.

Comments are written immediately to `.page-comments.json`, independently of unsaved source buffers. OPFS and local-folder projects keep it beside their sources; other providers use `page-host-comments/<provider and project name>/.page-comments.json` in host-origin OPFS. Each file stores separate page-path entries. Sidecars are excluded from the editor and frame source buffers. Share URLs carry sources and published locks, not comments or identity.

“Capture selection” asks to capture this host tab, checks the capture handle, and crops the tab image using the frame offset and the agent's selection rectangle. “Capture screenshot on pick” starts the same host capture from a frame click's activation. Only the host stores the PNG. Neither display capture nor clipboard access is delegated to the frame. Chromium is the supported capture target; Firefox and WebKit capture remains unverified and reports an explicit unsupported error. The commenting E2E uses native Chromium tab capture and writes `e2e/results/page-host-comment-selection.png` only after successful capture.

## Developer library links

Both sides default to denying links. Enable the developer profile explicitly in separate terminals:

```bash
PAGE_HOST_PROFILE=developer pnpm --filter page-host dev:runtime
```

```bash
VITE_PAGE_HOST_PROFILE=developer pnpm --filter page-host dev
```

Prepare the checkout with the runtime's [link build instructions](../../packages/page-runtime/src/link/README.md). Expand “Library links” above the preview, then provide its CORS file-server URL or choose “Link checkout folder” in Chromium. The host connects through `connectLinkRuntime` and `createLinkHost`, restores descriptors from IndexedDB, applies the checkout fragment to a session copy of the page lock, and watches served modules. A detected edit invalidates those paths and waits for the affected preview to become ready. “Unlink checkout” stops watching and reopens its published lock. Do not publish a host built with developer overrides enabled.

The link E2E copies the existing workspace build and source into `.tmp/T-host-e2e/`, prepares its link manifest with the documented CLI, and edits that copy through a CORS file server. It starts separate developer host/runtime origins on ports 5820–5822, checks the default profile's rejection, and writes `e2e/results/page-host-link.json` only after rendering and measurement succeed. The native folder picker still requires manual Chromium verification.

## Build and deploy

```bash
pnpm --filter page-host build
```

Deploy `apps/page-host/dist` to a static host. Deploy the runtime’s `dist/static` to a separate origin, supply that deployment’s validated `profile.json`, and serve `bootstrap.html` for `/frame/*`. Build the host with `VITE_PAGE_RUNTIME_ORIGIN` set to that runtime origin. The local runtime server’s profile is a development example, not a deployment configuration.

## Focused verification

```bash
gavel test --work-dir ./apps/page-host --framework vitest --recursive=false -- src/project.test.ts src/preview-update.test.ts src/providers
```

```bash
pnpm --filter page-host exec tsc -p tsconfig.json --noEmit
```

```bash
E2E_PAGE_HOST=1 gavel test --work-dir ./e2e --framework playwright --recursive=false -- --project=page-host --workers=1 tests/page-host
```

The phase fixture invokes `pnpm --filter e2e test:page-host`. The project starts the host and static runtime, which starts the local package origin over both linked builds. The E2E project reads the real workspace versions into its manifest and verifies those versions in the resulting lock. It covers providers, the requested viewport sizes, workspace facet readiness, saved/unsaved editing, HTML export and print. A successful latency run writes `e2e/results/page-host-latency.json`; old measurements are removed before the run. The budgets remain ≤300 ms edit-to-visible p50 and ≤400 ms warm-open-to-ready.

The timing recorder writes errors and resource snapshots taken at each frame's actual ready mark to `.tmp/T-host-e2e/timings`. It does not evaluate frames during teardown, when they may already be navigating. Set `PAGE_HOST_TIMING_REQUESTS=1` on a focused Gavel E2E run to include complete worker request/phase records in those artifacts for profiling. Keep shared library builds exclusive while measuring: a build replaces `dist`, including the fragments the development origin serves.

Per-page version switching requires two distinct Clicky UI versions that both ship runtime sets. Only one workspace version exists today. The scenario deliberately fails with the names of the two required versions (current workspace version and `PAGE_HOST_CLICKY_VERSION_ALT`, default `0.3.41`) before attempting the switch. It is neither skipped nor given a synthetic second build. Release two runtime-equipped versions and configure the external registry/origin to verify this scenario; the local origin correctly rejects a different version of a configured local package.

The native folder picker and an actual print dialog need a manual Chromium check; browser E2Es verify the directory adapter and print request/style contract without operating native dialogs. Live layout review uses agent-browser on Chrome at 1920×1080 and 2560×1440.
