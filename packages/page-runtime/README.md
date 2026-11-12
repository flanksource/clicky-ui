# @flanksource/page-runtime

A browser-only runtime for facet and clicky-ui pages. Pages written as `.mdx` or `.tsx` are resolved, fetched, compiled and linked entirely in the browser: a service worker on a dedicated runtime origin acts as the module server and compiler, a sandboxed frame boots React from a shared, integrity-checked runtime set, and the host application embeds the frame with a single `PageFrame` component. No per-page bundler, dev server or server-side build is involved.

- [Benefits](#benefits)
- [Architecture](#architecture)
- [How to use](#how-to-use)
- [Structure of a runtime package](#structure-of-a-runtime-package)
- [How it differs from other packaging formats](#how-it-differs-from-other-packaging-formats)
- [The compiler in the worker](#the-compiler-in-the-worker)
- [WebAssembly](#webassembly)
- [Security model](#security-model)
- [Caching and storage](#caching-and-storage)
- [Testing](#testing)
- [Further reading](#further-reading)

## Benefits

- **No build per page.** Page source goes in, a rendered page comes out. An edit recompiles only the changed module; linked-source edits become visible in roughly 150 ms (p50).
- **One React for everything.** clicky-ui, facet, every other library and the page itself share a single React, React DOM and renderer instance. Hooks and context work across library boundaries, and a duplicated React is treated as a build failure rather than a runtime surprise.
- **Exact npm semantics in the browser.** Installed versions, nested dependency versions and package `exports` conditions are preserved. A page sees the same dependency graph the library was built and tested against.
- **Reproducible.** Every opened page produces a serializable `PageLock` (versions, import map, integrity, remaps, barrel index). Supplying the lock again skips registry resolution entirely, so a saved page renders identically later.
- **Integrity everywhere.** Every traced and converted file carries a `sha384` subresource-integrity hash, verified when the worker fetches it.
- **Fine-grained loading.** Barrel imports (`import { Button } from "@flanksource/clicky-ui/components"`) are rewritten to the defining modules when the package's `sideEffects` allows it, cutting requests by around 90%. Warm loads of real facet and clicky-ui pages land in 60–100 ms.
- **Isolation by default.** Pages run on a separate origin under a strict nonce-based CSP with no `eval` and no WebAssembly, behind an origin- and session-validated message bridge, with an explicit network egress allowlist and a dependency policy.
- **Runtime Tailwind v4.** Pages that opt in get Tailwind utilities generated in the browser with no computed-style differences against a build-time Tailwind build, cached across loads.
- **Developer-grade output in every frame.** React always runs as its development build, and the compiler stamps `data-source` locations into host JSX. Owner metadata, source locations and warnings power element picking, commenting and agent edits even in deployed apps.
- **Local checkout links.** A developer can swap a published library for a local checkout for one session, without republishing anything.
- **Static, cacheable artifacts.** Libraries publish plain files under `dist/runtime/`; any unpkg-layout origin (unpkg, a mirror, or the bundled local origin) can serve them.

## Architecture

```
 Host application (app.example.com)
 ┌───────────────────────────────────────────────┐
 │  <PageFrame runtimeOrigin open theme data />   │
 │        ▲  postMessage bridge "page-runtime-v1" │
 └────────┼──────────────────────────────────────┘
          │  origin + session validated envelopes
 ┌────────▼──────────────────────────────────────┐   Runtime origin (pages.example.com)
 │  Frame  /frame/<page>                          │
 │   bootstrap.html → boot.js → page module       │
 │   page-agent.js (picking, comments, review)    │
 └────────┬──────────────────────────────────────┘
          │  fetch /src/  /npm/  /link/  /__runtime/
 ┌────────▼──────────────────────────────────────┐
 │  Service worker  sw.js  (scope /frame/)        │
 │   resolve → fetch + verify → compile → cache   │
 └────────┬───────────────────────┬──────────────┘
          │                       │
   package origin           npm registry
   /<name>@<ver>/<file>     metadata for resolution
```

The host never loads page code. It sends `open` (page path, folder manifest, source files, optional lock), `theme` and `data` over the bridge. The frame asks the worker for the page entry; the worker resolves bare specifiers through the composed import map, fetches package files from the package origin, verifies integrity, compiles source, rewrites imports to canonical URLs and serves the result. The frame mounts the page's default export with `{ data }`, waits for readiness signals and reports status back.

Static assets produced by `pnpm --filter @flanksource/page-runtime build` in `dist/static/`:

| File | Role |
|---|---|
| `bootstrap.html` | Frame document served for `/frame/*`; registers the worker on first visit and reloads once |
| `sw.js` | Service worker: resolver, compiler, module router, caches |
| `boot.js` | Frame bootstrap: bridge, React runtime set, styles, page mount, readiness |
| `page-agent.js` | Element picking, comments, review and agent overlays inside the frame |
| `export-compiler.js` | Loaded only for HTML/PDF export; runs library-declared remark plugins |
| `devtools-hook.js` | React devtools hook installed before React loads |
| `editing.js` | Shared editing helpers served at `/__runtime/editing.js` |

## How to use

### Install

```sh
pnpm add @flanksource/page-runtime @flanksource/clicky-ui react react-dom
```

`@flanksource/clicky-ui` (`^0.3.57`), `react` and `react-dom` (18.3 or 19) are peer dependencies. The library-build half is published separately as `@flanksource/page-runtime-build`, so build machines don't pull browser host dependencies.

### 1. Build and host the runtime origin

```sh
pnpm --filter @flanksource/page-runtime build          # uses installed @flanksource/* releases
pnpm --filter @flanksource/page-runtime build -- --dev # bundles sibling workspace checkouts instead
```

Serve `dist/static/` over HTTPS on an origin separate from the host (localhost is fine for development):

- `bootstrap.html` for every `/frame/*` path.
- `/sw.js`, `/boot.js`, `/page-agent.js`, `/export-compiler.js`, `/devtools-hook.js` and `/profile.json` from the origin root.
- Keep `/frame/` reserved for runtime documents — it is the worker's scope.

### 2. Configure `profile.json`

The profile is required and validated on worker start; a change requires a worker upgrade/reload.

```json
{
  "runtimeDomain": "pages.example.com",
  "embedders": ["https://app.example.com"],
  "packageOrigin": "https://unpkg.com",
  "registry": "https://registry.npmjs.org",
  "managed": { "@flanksource/clicky-ui": "^0.3", "@flanksource/facet": "^0.1.74" },
  "policy": { "dependencies": "strict", "allow": ["date-fns", "d3-*", "zod"] },
  "convert": { "origin": "https://esm.internal.example" },
  "minReleaseAgeDays": 3,
  "network": { "allow": ["https://api.example.com/*"] },
  "csp": { "add": {} },
  "links": "deny",
  "sources": ["host", "opfs", "folder", "url", "hash"],
  "readinessTimeoutMs": 15000
}
```

| Field | Meaning |
|---|---|
| `runtimeDomain` | The origin this runtime is served from |
| `embedders` | Host origins allowed to embed frames |
| `packageOrigin` | unpkg-layout origin serving `/<name>@<exact-version>/<file>` (and `?meta` listings) |
| `registry` | npm registry used to resolve version ranges |
| `managed` | Libraries that publish runtime fragments, with allowed ranges; they define the page's shared import map |
| `dependencies` | Optional extra page dependencies with ranges |
| `policy` | `any` allows any declared package; `ask` and `strict` allow only names or `*` globs in `allow` |
| `convert` | Optional CommonJS→ESM converter origin for unmanaged packages without ESM entries (also added to `connect-src`) |
| `minReleaseAgeDays` | Refuse versions published more recently than this |
| `network.allow` | Egress allowlist for page `fetch`es |
| `csp` | `add` appends sources to any directive; `wasm: true` opts frames into WebAssembly (see [WebAssembly](#webassembly)) |
| `links` | `allow` permits developer checkout links (also needs the host's `developerOverrides`) |
| `sources` | Where page sources may come from |
| `readinessTimeoutMs` | Upper bound for each readiness step (data, fonts, stylesheets, diagrams…) |

### 3. Embed a page in the host

```tsx
import { PageFrame, type PageBridge } from "@flanksource/page-runtime/host";
import type { PageLock } from "@flanksource/page-runtime/schema";

function Report({ source, lock, saveLock }: { source: string; lock?: PageLock; saveLock: (l: PageLock) => void }) {
  const [bridge, setBridge] = useState<PageBridge | null>(null);
  return (
    <PageFrame
      runtimeOrigin="https://pages.example.com"
      open={{
        page: "report.mdx",
        manifest: { dependencies: { "@flanksource/facet": "^0.1.74" } },
        files: { "report.mdx": source },
        ...(lock ? { lock } : {}),
      }}
      theme={{ theme: "light", density: "comfortable" }}
      data={{ cluster: "prod-eu", window: "24h" }}
      onMessage={(m) => { if (m.type === "lock") saveLock(m.lock); }}
      onError={(error) => console.error(error)}
      onBridge={setBridge}
    />
  );
}
```

- **Lifecycle.** The frame reports `status` messages: `connecting` (the frame asks for `open`), `booting` (it asks for `theme` and `data`), then readiness steps (`mounted`, `fonts`, `images`, `stylesheets`, `diagrams`, `hook`, `quiescence`) and finally `ready`.
- **Locks.** On first open the frame emits a validated `lock`. Persist it next to the page source (or in a URL/hash, or browser state) and pass it back as `open.lock` for reproducible renders.
- **Live updates.** Changing `theme` or `data` props sends them over the bridge without reloading. To change source, call `bridge.send({ type: "sources", files: { "report.mdx": next } })`.
- **Persistent frames.** Keep `PageFrame` mounted across edits. Data updates retain React component state; `await bridge.request({ type: "data", data: next })` completes after rendering and readiness. With imperative data updates, set `dataUpdates={false}` to avoid also sending prop changes; the initial boot still receives the latest `data` prop. Source updates compile versioned local modules and reconcile them through the same React root without reloading the document, worker or agent. Optional `sources.data` supplies data for that same source update. The previous render stays visible during compilation; an edited component can remount, while unchanged layouts are retained for page-only edits. Dependency changes still require opening the page again.
- **Layouts.** Optional `open.layout` names a JavaScript/TypeScript module in `open.files`. Its default React component receives `{ data, children }` and wraps both the live page and its HTML/print export. The layout can declare `meta.tailwind`; page metadata overrides matching layout keys. Keep Markdown/MDX as `open.page` when it needs export-time remark plugins, rather than importing it through a TSX entry.
- **CSS updates.** Source messages containing only `.css` files replace loaded stylesheets after their new version loads, preserving the mounted React tree. Library base stylesheets load in their recipe's cascade layer, so ordinary page CSS can override them consistently with the Node build. HTML export retains those layers.
- **Export.** After `ready`, `bridge.send({ type: "export", format: "html" })` returns a `snapshot` message; `format: "print"` prints to PDF.
- **Errors** arrive as `{ type: "error", error: { phase, message, file, line?, column? } }`, where `phase` is one of `resolve`, `fetch`, `compile`, `link`, `render`, `readiness`.

`RuntimeActivity`, `BuildLog` and `clearPageRuntimeCache` from the same entry give hosts a live compile/fetch log and a cache reset.

### 4. Write a page

A page is an `.mdx` or `.tsx` module whose default export receives `{ data }`. It imports managed libraries and allowed dependencies by their normal npm specifiers:

```mdx
import { Gauge } from "@flanksource/clicky-ui/data";
import { DataFlowDiagram } from "@flanksource/facet";

export const meta = { tailwind: "dynamic" };

# Cluster {props.data.cluster}

<Gauge value={72} max={100} className="w-48" />
```

`export const meta = { tailwind: "dynamic" }` opts the page into runtime Tailwind; without it the page is styled by its libraries' published stylesheets alone. A page may also export `ready` (a promise or function) to extend readiness.

### 5. Publish a library as a runtime package

Build the library's normal ESM `dist`, then generate its fragment:

```ts
import { buildLibraryRuntime } from "@flanksource/page-runtime-build";

await buildLibraryRuntime({
  libraryDir: "/workspace/my-library",
  outDir: "/workspace/my-library/dist/runtime",
  base: clickyUiFragment,               // inherit clicky-ui's React family
  aliases: { "@example": "my-library" }, // optional page-facing aliases
});
```

Or from this package's directory:

```sh
pnpm exec tsx scripts/build-library-runtime.ts /workspace/my-library ../ui/dist/runtime/importmap.json
pnpm run check-fragment /workspace/my-library ../ui/dist/runtime/importmap.json
```

The checker re-traces `dist` and fails on missing mappings, Node built-ins, unconverted CommonJS or a base remap. Libraries can additionally declare export-time remark plugins (`pageRuntime.compiler` in `package.json`) and a `./page-styles` recipe for runtime Tailwind. See [src/build/README.md](src/build/README.md) and [src/frame/tailwind/README.md](src/frame/tailwind/README.md).

### Local development

- **Local package origin.** `pnpm --filter @flanksource/page-runtime run serve-packages --package ../ui --package ../../../facet` serves built workspace packages in the registry and unpkg layouts, proxying everything else upstream. See [src/dev/README.md](src/dev/README.md) and [PACKAGE_PUBLICATIONS.md](PACKAGE_PUBLICATIONS.md) for atomic, generation-pinned publications.
- **Same-origin mode.** `origin="same-origin-local"` on `PageFrame` allows `runtimeOrigin={location.origin}` on localhost only. It is a convenience, not an isolation boundary.
- **Checkout links.** Replace a managed library with checkout source for one session; see [src/link/README.md](src/link/README.md).

### Subpath exports

| Export | Contents |
|---|---|
| `./host` | `PageFrame`, bridge, validation, activity/build log, cache clearing, remote review |
| `./host/link` | Host side of developer checkout links |
| `./frame`, `./frame/agent` | Frame bootstrap and in-frame agent (bundled into `dist/static`) |
| `./sw` | Service worker (bundled into `dist/static/sw.js`) |
| `./build`, `./build/dependencies` | Library fragment builder and installed-dependency runtimes (also `@flanksource/page-runtime-build`) |
| `./publication`, `./publication/cli`, `./catalog` | Atomic local package publications and their catalog schema |
| `./dev` | Node package registry/origin for development |
| `./link`, `./link/build` | Link channel and link builder |
| `./schema` | Shared contracts: `Fragment`, `PageLock`, `RuntimeProfile`, bridge messages |
| `./markers`, `./editing` | Source-location markers and editing helpers |
| `./static/*` | Built runtime origin files |

## Structure of a runtime package

A runtime package is **an ordinary npm package plus a `dist/runtime/` directory**. Nothing about the package's own ESM files changes: the browser loads them byte-for-byte from the package origin. What the runtime directory adds is the metadata a browser needs to link those files into an exact, locked dependency graph, plus ESM conversions of any CommonJS dependencies.

```
@flanksource/clicky-ui@0.3.57/
├── package.json             # exports, sideEffects, pageRuntime.compiler
├── dist/
│   ├── index.js, data.js, components.js, …   # normal ESM build, served as-is
│   ├── styles.css
│   └── runtime/
│       ├── importmap.json   # the fragment
│       ├── barrels.json     # barrel export index
│       ├── react@18.3.1/            # CommonJS dependencies converted to ESM
│       ├── react-dom@18.3.1/
│       ├── scheduler@0.23.2/
│       ├── prop-types@15.8.1/
│       ├── …
│       └── _chunks/                 # shared chunks of the converted set
```

### The fragment (`importmap.json`)

```jsonc
{
  "fragment": 1,
  "name": "@flanksource/clicky-ui",
  // top-level specifiers a page may import → package-relative URL at an exact version
  "imports": {
    "@flanksource/clicky-ui/data": "@flanksource/clicky-ui@0.3.57/dist/data.js",
    "react": "@flanksource/clicky-ui@0.3.57/dist/runtime/react@18.3.1/index.js"
  },
  // one scope per package version: the bare imports that package's own files make
  "scopes": {
    "@ai-sdk/gateway@3.0.127/": {
      "@ai-sdk/provider": "@ai-sdk/provider@3.0.10/dist/index.mjs",
      "zod": "zod@4.6.7/index.js"
    }
  },
  // ESM files that import their own CommonJS build by relative path → converted URL
  "remaps": {
    "@opentelemetry/api@1.9.1/build/esm/api/context": "@opentelemetry/api@1.9.1/build/esm/api/context.js"
  },
  "aliases": {},     // page-facing prefixes, e.g. facet's "@facet"
  "inherits": [],    // specifiers left to a base fragment's top level (facet inherits React from clicky-ui)
  "integrity": {     // sha384 for every traced and converted file
    "@ai-sdk/gateway@3.0.127/dist/index.mjs": "sha384-d7rdZc8N…"
  },
  "compiler": { "remark": [] } // optional export-time remark plugins
}
```

For scale, clicky-ui's fragment currently has 40 top-level imports, 203 scopes, 329 remaps and about 4,600 integrity entries.

| Field | Why it exists |
|---|---|
| `imports` | The public surface: every subpath export plus the shared React runtime set |
| `scopes` | npm installs nested versions (`react-is@16` and `react-is@17` side by side). A flat import map can't express that; per-package-version scopes can |
| `remaps` | Published packages often contain extensionless or CommonJS-targeting relative imports that name no real file; remaps point them at the real or converted file |
| `aliases` | Lets a library expose a short page-facing prefix without a second package |
| `inherits` | Declares which specifiers a dependent library takes from its base, so it can't ship a second React |
| `integrity` | Doubles as the file listing the resolver checks against, and the SRI hash the worker verifies |
| `compiler` | Remark plugins applied only when exporting HTML/PDF |

### The barrel index (`barrels.json`)

```jsonc
// positions are illustrative
{
  "modules": ["@flanksource/clicky-ui@0.3.57/dist/lib/utils.js", "…"],
  "barrels": {
    "@flanksource/clicky-ui/data": { "Gauge": 412, "Badge": 37, "Tag": [55, "Badge"] }
  }
}
```

For each entry barrel, every named export maps to its defining module (`modules[pos]`) or to `[pos, importName]` when re-exported under another name. The worker rewrites `import { Gauge } from "@flanksource/clicky-ui/data"` to import the defining module directly, so a page touching one component doesn't load the whole barrel graph. This happens only where the package's `sideEffects` declaration permits skipping the forwarding module; a direct side-effect import keeps the module intact.

### The base set and inheritance

clicky-ui's fragment defines the base set: React, `react/jsx-runtime`, `react/jsx-dev-runtime`, React DOM and `react-dom/client`, scheduler, React Query and jotai, always built with `NODE_ENV=development`. A library built with `base: clickyUiFragment` lists those specifiers under `inherits` and imports them through the base; it can't remap them. That is what guarantees one React and one renderer across every library on a page.

### Composition into a `PageLock`

When a page opens without a lock, the worker resolves each `managed` library and page dependency against the registry and profile policy, fetches the fragments, and merges them in deterministic library order (a base before the libraries that extend it, ties by name) into a lock:

```ts
type PageLock = {
  lock: 2;
  packageOrigin: string;                 // generation-bound origin used for every fetch
  page: string;
  versions: Record<string, string>;      // exact resolved versions
  map: { imports; scopes };              // the composed browser import map
  integrity: Record<string, string>;
  remaps: Record<string, string>;
  barrels: BarrelIndex;
  listings?: Record<string, string>;     // file listings for plain ESM extras
  compiler?: Record<string, CompilerPlugins>;
};
```

Unmanaged ESM dependencies (for example `date-fns`) don't need a fragment: the worker reads their `?meta` file listing from the package origin and resolves their files directly.

## How it differs from other packaging formats

The runtime package is **not a new module format**. Its modules are standard ESM. The difference is where linking happens and what metadata travels with the package.

| | Unit shipped | Who resolves bare specifiers | Nested versions | Shared singletons (one React) | Integrity | CommonJS | Granularity | Build per page |
|---|---|---|---|---|---|---|---|---|
| **Plain ESM package** | Source modules | A bundler or Node at install/build time | Yes, via `node_modules` | Only after bundling/dedupe | Lockfile, not in the browser | Unsupported in browsers | Per module, after bundling | Yes |
| **CommonJS package** | `require` modules | Node/bundler | Yes | Bundler dedupe | Lockfile | Native | Whole file | Yes |
| **UMD / IIFE bundle** | One file per package, globals | Nobody (globals) | No | Fragile (`window.React`) | Optional SRI per file | Pre-bundled | Whole bundle | No, but no tree-shaking or versioning |
| **App bundle (Vite/webpack)** | Chunks of the whole app | The bundler, ahead of time | Flattened/deduped | Yes, within one bundle | Per chunk if configured | Converted at build | Tree-shaken | Yes, every change |
| **Transforming CDN (esm.sh-style)** | Per-request rebuilt ESM | The CDN, at request time | Partly; CDN-chosen versions | Needs `?external`/`?deps` hints | Rarely | Converted on the fly by the CDN | Per package | No, but output is CDN-controlled |
| **Import-map CDN (jspm-style)** | Original ESM + generated map | The browser, via an import map | Yes, via scopes | Only if the map is generated together | Optional | CDN conversion | Per module | No |
| **Runtime package** | Original ESM + fragment + converted CJS | The browser, via the composed `PageLock` map | Yes, one scope per package version | Guaranteed by the base set and `inherits` | `sha384` on every file, verified by the worker | Converted once at library build time, published with the library | Per defining module, via the barrel index | No |

The practical differences:

- **Linking moves to the browser, but stays deterministic.** Unlike a bundle, nothing is precompiled per page. Unlike a transforming CDN, the bytes the browser runs are exactly the published package files or conversions the library author built and tested, with hashes to prove it.
- **The library author owns its closure.** The fragment records the dependency closure as installed by the library's own lockfile, nested versions included. A page can't accidentally get a different `react-is` than the library was tested with.
- **Singletons are a contract, not a dedupe heuristic.** `inherits` plus the base set make "one React" a property checked at build time (`check-fragment`), rather than something a bundler's dedupe may or may not achieve.
- **CommonJS is handled once, offline.** Converted modules ship inside `dist/runtime/` with their own integrity; there is no converter in the hot path unless the profile configures `convert` for unmanaged packages.
- **Tree-shaking without a bundler.** The barrel index gives the browser the information a bundler would use, at the granularity of the defining module.
- **Composable.** Fragments stack: facet inherits clicky-ui, a product library can inherit facet, and the worker composes them per page.

## The compiler in the worker

The service worker compiles page sources and linked library sources on request:

1. **Lexing.** `es-module-lexer` finds every static and dynamic import.
2. **TS/TSX/JSX.** Sucrase strips types and transforms JSX in development mode. Before Sucrase runs, a pass over Sucrase's tokenizer writes `data-source="file:line:col"` into each host JSX element.
3. **MDX.** `@mdx-js/mdx` with `remark-gfm`, `remark-frontmatter`, GitHub alerts and `rehype-raw` compiles straight to JavaScript with its own `jsxDEV` positions; Sucrase never runs after MDX, so `.mdx` source positions survive.
4. **JSON and CSS** become modules inside the worker.
5. **Import rewriting.** Specifiers are resolved through the lock's import map, scopes, remaps and barrel index, and rewritten to canonical runtime URLs (`/src/…`, `/npm/…`, `/link/…`).
6. **Tailwind candidates.** Class candidates are extracted per module and stored so the frame can generate CSS before first render.

Compiled output is cached by source hash, so an edit recompiles one module.

## WebAssembly

WebAssembly is used where it is safe and fast, kept out of frames by default, and available to pages that explicitly opt in.

### Inside the runtime

- **Service worker: WASM.** The worker uses `es-module-lexer`'s WebAssembly build (`await init()`, then `parse`) to scan imports for every compiled module and every converted file. The worker is not governed by the frame's CSP, so it gets the fast lexer.
- **Frames: no WASM.** Frame documents ship with `script-src 'self' 'nonce-…'` and no `'wasm-unsafe-eval'`. Anything that runs inside a frame therefore must not compile WebAssembly:
  - `export-compiler.js` is built against `es-module-lexer/js`, the asm.js build of the same lexer, through a resolve plugin in `scripts/build-static.ts`.
  - Runtime Tailwind uses the pure-JavaScript `tailwindcss` compiler in the frame, not the native/WASM oxide scanner. Candidates come from the worker's lexer pass instead of a filesystem scan.
- **Library builds: native, not WASM.** `@flanksource/page-runtime-build` traces dependency closures with rolldown's native resolver and parser in Node. None of that reaches the browser.

The runtime itself never needs `'wasm-unsafe-eval'`.

### Letting pages use WebAssembly

Page code that depends on WebAssembly (a parser, a compression or image library, a query engine) can be enabled per deployment in `profile.json`:

```json
{ "csp": { "add": {}, "wasm": true } }
```

This adds `'wasm-unsafe-eval'` to the frame's `script-src`. It permits `WebAssembly.compile`/`instantiate` only; it never enables JavaScript `eval` or `new Function`. It is off when omitted, and because the profile is read at worker start, changing it requires a worker upgrade/reload.

`.wasm` files from packages are served with `Content-Type: application/wasm`, so streaming instantiation works:

```tsx
import wasmUrl from "some-wasm-package/dist/engine.wasm?url";

export default function Page() {
  const [result, setResult] = useState<number>();
  useEffect(() => {
    WebAssembly.instantiateStreaming(fetch(wasmUrl)).then(({ instance }) =>
      setResult((instance.exports.compute as (n: number) => number)(42)));
  }, []);
  return <p>{result}</p>;
}
```

Treat `wasm: true` as a widening of the sandbox: enable it only for deployments whose pages need it, and keep `network.allow` tight, since WebAssembly modules can still `fetch` through their JavaScript glue.

## Security model

- **Separate runtime origin.** Page code never runs on the host origin; the frame is sandboxed (`allow-scripts allow-same-origin allow-modals`) on `runtimeDomain`, embeddable only by `embedders`.
- **Strict CSP.** `script-src 'self'` plus a per-document nonce; no `eval`, no WebAssembly unless `csp.wasm`; extra sources only through `csp.add`.
- **Validated bridge.** Every message is a `page-runtime-v1` envelope checked for exact origin, source window and a fresh per-embedding session.
- **Egress control.** Page network access is limited to `network.allow`.
- **Supply chain.** `policy` restricts which packages may be resolved, `minReleaseAgeDays` refuses freshly published versions, and integrity is verified on every file.
- **Links are double-gated.** Checkout links require both `profile.links: "allow"` and the host's `developerOverrides: true`, and they are session-only.

Hosting details are in [static/README.md](static/README.md).

## Caching and storage

- **Cache Storage**, versioned by runtime version: opened pages and their locks (reused while the folder manifest is unchanged), fetched and compiled modules, and generated Tailwind CSS under `/__runtime/tailwind/<key>.css`. Old versions' caches are deleted when a new worker activates.
- **IndexedDB `page-runtime`**, shared by worker and frame: per-module Tailwind candidates and Tailwind CSS records with bounded per-library eviction.
- **Partitioning.** Browsers partition the frame's storage by the embedding site, so caches are per (host site, runtime origin), not global.

`clearPageRuntimeCache` from `./host` resets them. Details: [src/frame/tailwind/README.md](src/frame/tailwind/README.md).

## Testing

From `packages/page-runtime`:

```sh
pnpm run check                  # tsc + oxlint
pnpm test                       # vitest unit tests (jsdom, fake-indexeddb)
pnpm test tailwind              # one slice by name
pnpm run test:browser           # real-browser tests (worker, frame, links, Tailwind parity)
gavel test --work-dir . --framework vitest --recursive=false -- src/build
```

The browser suites need built `packages/ui/dist` (and facet's `dist` for the Tailwind parity pages).

## Further reading

- [src/build/README.md](src/build/README.md) — library fragments, dependency runtimes, export compiler plugins, publishing `@flanksource/page-runtime-build`
- [static/README.md](static/README.md) — hosting the runtime origin, profile, CSP, bridge, locks
- [src/frame/tailwind/README.md](src/frame/tailwind/README.md) — page-styles recipes, runtime Tailwind, cache identity and storage
- [src/link/README.md](src/link/README.md) — developer checkout links
- [src/dev/README.md](src/dev/README.md) — local registry and package origin
- [PACKAGE_PUBLICATIONS.md](PACKAGE_PUBLICATIONS.md) — atomic local package publications and generations
- [src/frame/agent/README.md](src/frame/agent/README.md) — in-frame agent, picking and design edits
- [src/host/review/README.md](src/host/review/README.md) — remote review
- [spikes/README.md](spikes/README.md) — measurements behind the design
