# Developer library links

A link replaces a managed library's published entries with checkout source and uses that checkout's runtime fragment, converted CommonJS modules, constants, and generated files. Both `profile.links: "allow"` and the host's `developerOverrides: true` are required. Overrides are session state: keep the published lock and pass a composed copy to `PageFrame.open.lock`.

## Build a checkout

Build the library normally first. For clicky-ui, generate icons with `pnpm --filter @flanksource/clicky-ui build:icons`. Link preparation calls the existing `buildLibraryRuntime` and writes `dist/runtime/link.json` alongside its fragment, barrels, and the development runtime.

Provide an entrypoints JSON file mapping published specifiers to checkout source paths. For example:

```json
{
  "@flanksource/clicky-ui/data": "src/data.ts",
  "@flanksource/clicky-ui/icons": "src/icons.ts"
}
```

Provide a build-inputs JSON file containing the checkout's actual constants (`__CLICKY_COMMIT__`, `__CLICKY_TAG__`, `__CLICKY_DATE__`, and `__CLICKY_DIRTY__` for clicky-ui). They are injected into linked source modules. Values must be strings, booleans, or numbers. Missing generated icons fail with the icon-generation command.

From the repository root:

```sh
pnpm --filter @flanksource/page-runtime exec tsx src/link/build-cli.ts --library /absolute/checkout --entries /absolute/entrypoints.json --defines /absolute/build-inputs.json
pnpm --filter @flanksource/page-runtime exec tsx src/link/examples/server.ts /absolute/checkout 8790
```

For facet, add `--base /absolute/clicky-ui/dist/runtime/importmap.json` so preparation inherits clicky-ui's singletons. The source server binds to loopback, supports CORS, and serves unchanged checkout files. Both transports use the same link manifest. Source edits within the existing import graph need no build; adding imports, changing exports, or changing dependencies requires running the link build again and reinstalling the link.

The Node API is `buildLinkRuntime({ libraryDir, outDir, entries, defines, base?, generated? })` from `src/link/build.ts`. `generated` maps additional required checkout paths to the commands that create them. `base` is the base library's fragment. `entries` explicitly names the source entry points to expose; `defines` comes from the checkout, and `outDir` should be its `dist/runtime` directory.

## Host API

The typed host entry point is `src/host/link/index.ts`, exported as `@flanksource/page-runtime/host/link`.

```ts
import { connectLinkRuntime, createLinkHost } from "@flanksource/page-runtime/host/link";

const connection = await connectLinkRuntime({ runtimeOrigin, profile, developerOverrides: true });
const links = createLinkHost({ profile, developerOverrides: true, transport: connection.request });
await links.restore();
await links.server({ id: "ui", url: "http://127.0.0.1:8790/" });
const lock = links.override({ lock: publishedLock, ids: ["ui"] });
const unregister = links.registerFrame({ id: pageId, links: ["ui"], reload: reloadPreviewUntilReady });
const watcher = links.watch("ui");
await watcher.start({ onError: showLinkError });
```

Activate the runtime service worker with a runtime frame before calling `connectLinkRuntime`. The connection opens a hidden runtime-origin relay and validates the parent origin, source window, session, and deployment policy. Pass `lock` into the existing open message or `PageFrame.open`. Reinstalling a checkout clears its compiled pointers. `restore()` reloads descriptors and directory handles from host-origin IndexedDB and reconnects their worker state; invoke it on host startup. `list()` returns installed links.

For a folder button, call `links.pickFolder({ id: "ui" })` directly from the click handler. An existing granted handle can be passed to `links.folder({ id: "ui", directory })`. Directory handles stay in host-origin IndexedDB. The worker asks for file bytes over a session-bound relay; no cross-origin handle transfer is attempted. Revoked permissions and disconnected hosts produce errors. Chromium's native `FileSystemObserver` is used when available; otherwise the same content-hash polling path is used. Servers always use polling, at 25 ms by default. Change detection watches source modules actually served by the worker and compares against their served hashes, including edits before the first scan.

`invalidate(id, paths)` invalidates only those modules before reloading registered frames using that link. The `reload` callback should send the existing bridge reload message and return a promise that resolves on the frame's ready status; polling then waits for rendering to finish. Unrelated frames retain their documents. Runtime-version and content hashes key compiled cache entries. Canonical URLs name no page: the worker takes each request's page and link context from the frame (or page-spawned worker) that made it, so the frame import map and rewritten imports use the same singleton URLs in every page. Library modules are cached compiled but not yet rewritten, keyed by their source and link build, and shared by every page; each page rewrites the module's imports through its own import map once, and that rewrite is cached by page context and source hash. Page modules are cached whole per page context. Page candidates feed the existing runtime CSS candidate endpoint.

Linked responses carry per-request `x-link-activity` metadata, which the outer router validates and projects into `Server-Timing` and the host activity stream. Fetch, integrity, compile and rewrite timings include work completed before a failure. Cache entries persist source/output sizes, never elapsed timings: the first persistent read reports `storage`, later reads report `memory`, and a content hit after invalidation preserves the fresh source-read cost. Server/package origins use their actual URLs and expose encoded transfer bytes when `Content-Length` is available; native folder reads have no network origin and transfer zero bytes. Generated agent and JSX shim modules report their generation and rewrite work separately.

Generated agent/shim output is cached by the link context and original source hash. The agent source is still fetched and hashed on each request, so changed runtime files invalidate the transform; a cache hit retains that fetch/transfer cost and reports zero rewrite work. Installed context links are reused for policy checks rather than rescanning the complete import map for every cached module.

On teardown, call `await watcher.stop()`, `unregister()`, `await links.close()`, and `connection.close()`. To unlink, stop its watcher, call `await links.remove(id)`, and reopen affected frames with their published lock.

## Verification

Focused unit checks:

```sh
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- src/link/overrides.test.ts src/sw/link-route.test.ts
```

Chromium checks (agent-browser owns the browser and Gavel holds the test slot):

```sh
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- --config src/link/vitest.browser.config.ts src/link/link.browser.ts
```

The browser fixture copies the real clicky-ui source, builds its runtime set, renders DataTable and Version, checks a cold and warm load, edits Version twelve times, checks exact recompile sets and the unlinked control, and then verifies folder reads using an IndexedDB-persisted OPFS directory handle. It writes `.tmp/H-link/browser-results.json` and a screenshot. This does not automate the native folder picker.

For the manual Chromium check, start the standalone fixture:

```sh
pnpm --filter @flanksource/page-runtime exec tsx src/link/testing/server.ts
```

1. Open the printed **Link verification host** URL in desktop Chromium.
2. Click **Link folder**.
3. Select the printed **Folder to select** directory, click **Open**, and grant read access if Chromium asks.
4. Confirm the **Folder linked** status and the DataTable and Version preview.
5. In that copied directory, edit `src/data/Version.tsx`, changing `revision-0` to another visible value. Confirm the linked preview changes and the **Unlinked control** frame stays loaded.
6. Reload the host and grant read access again if Chromium requires it. Confirm the persisted directory can be reconnected. Cancel or deny the picker once and confirm the error is visible.

The historical spike reported an occasional approximately three-second warm/early-edit stall. The product fixture guards warm reload and the first two edits below one second in addition to the 300 ms edit p50 and 15 s cold budget. A passing guard demonstrates its absence in that run; it does not establish the cause of the historical spike's stall.

## Reference host

The reference host's library controls use this API. See [the page-host link documentation](../../../../apps/page-host/README.md#developer-library-links) for setup and usage. Its P6 fixture writes `e2e/results/page-host-link.json`; the standalone fixture writes independent measurements under `.tmp/H-link/`.

## Frame-scoped local relay and page roots

For a same-origin-local host, pass `relayPath: "/frame/_link-relay"` to `connectLinkRuntime`. The default remains `/frame/__runtime-link-relay`, matching the runtime's `/frame/` worker scope for existing hosts. Relay documents are dispatched before generic frames; the local relay never requires widening the service-worker scope beyond `/frame/`.

A source link declares `build.pageSources`, an array of `{ root, prefix, editable }`. `root` is a checkout-relative directory, `prefix` is its page-relative mount (empty for the primary pages directory), and `editable` grants editable marker projection. `composeLinkOverrides` adds the link ID to each declaration in `lock.pageSources`; worker compilation checks these against the installed link. `pageSourceModule({ page, roots })` selects the linked entry without a host-buffer snapshot. `pageSourcePath({ path, roots })` projects only editable roots; library links and read-only roots keep their noneditable locations. Noncanonical paths and overlapping declarations fail. Compiler markers retain the hash of the original UTF-8 bytes.

`buildLinkRuntime` accepts `pageSources` and prepares CommonJS source entries with the published runtime-set converter and its evaluated named-export analysis. The manifest's `commonjs[path]` stores `{ hash, target }`; the worker forwards the original source to that converted ESM entry only while the original hash matches. Rebuild the link metadata/runtime set after a CommonJS source edit. TypeScript/JSX source edits continue compiling in the worker normally.

For a declared library alias without a `dist` build, use `prepareCommonJsSources` from `@flanksource/page-runtime/link/build`:

```ts
const prepared = await prepareCommonJsSources({
  libraryDir: iconsDirectory,
  outDir: conversionDirectory,
  runtimePath: "dist/runtime/source-commonjs",
  paths: ["mi/index.js"],
  base: clickyFragment,
});
```

`prepared.fragment` supplies the converted closure, `prepared.commonjs` supplies source-to-ESM metadata, and `prepared.files` maps checkout-relative generated URLs to physical output files. Merge these into the declared library link and serve the generated files at those exact URLs. The alias still targets `/link/<id>/mi/index.js`; user imports stay intact. This prepares library artifacts with the existing Node build tool, never page TSX compilation on the server. `compileCommonJsSource` in the worker validates original bytes and emits the forwarding module; missing or stale artifacts fail.
