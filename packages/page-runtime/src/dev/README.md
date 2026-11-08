# Workspace package registry and origin

This Node-only development server exposes built workspace packages in the same layouts the browser resolver uses. It serves registry metadata at `/<name>` (including URL-encoded scoped names) and exact package files at `/<name>@<version>/<path>`. Package names, versions and the complete version manifest come from each configured directory's real `package.json`. Files, including runtime fragments at `dist/runtime/{importmap,barrels}.json`, are served byte-for-byte without rewriting integrity or imports.

Local metadata deliberately declares the release date **`2000-01-01T00:00:00.000Z`** (`LOCAL_RELEASE_TIME`). This is a development-only synthetic publication date, explicitly old enough for the reference host's seven-day `minReleaseAgeDays` policy. It is not the package's real npm publication date. No age calculation or current-time default is used.

Build the packages before starting the server. It never compiles a library, generates fragments or substitutes source for missing dist files. Rebuild runtime fragments whenever the dist bytes change, because the worker checks their integrity. Local responses use `Cache-Control: no-store`; files and manifests are read again on every request. A package identity change requires restarting the server. Existing browser locks and worker caches still obey the runtime's own cache policy.

## CLI

From the clicky-ui repository root (dependencies are already installed):

```bash
pnpm --filter @flanksource/page-runtime exec tsx scripts/serve-packages.ts --package ../ui --package ../../../facet --upstream-registry https://registry.npmjs.org --upstream-origin https://unpkg.com --port 5812
```

`--package <dir>` is repeatable and required; directories are relative to the process working directory (`packages/page-runtime` with the command above). `--upstream-registry` defaults to `https://registry.npmjs.org`, `--upstream-origin` to `https://unpkg.com`, and `--port` to `5812`. Port `0` selects a free port. Invalid configuration and duplicate names fail startup. The server binds only `127.0.0.1` and prints its actual origin.

Unknown package metadata is proxied to the upstream registry. Unknown package files, including transitive closure files, are proxied to the upstream origin with their query string and status preserved. A configured local package requested at a different version returns **404 naming the available local version**. Missing local files return 404 and never fall through to npm. Traversal and symlink escapes are rejected. Proxy transport errors return 502 with the failing URL. GET, HEAD and OPTIONS are supported, with CORS on successful responses, preflights and errors. JavaScript, CSS, JSON, fonts and image assets carry their appropriate content types.

## Programmatic API for browser-only playground prod

Until the shared `./dev` package export is added, import `packages/page-runtime/src/dev/index.ts` by its workspace path. Node 24 supports these erasable TypeScript modules directly; `tsx` also works.

```ts
import { createPackageHandler, servePackages } from "./packages/page-runtime/src/dev/index.ts";

const options = {
  packages: ["/workspace/clicky-ui/packages/ui", "/workspace/facet"],
  upstreamRegistry: "https://registry.npmjs.org",
  upstreamOrigin: "https://unpkg.com",
};
const local = await servePackages({ ...options, port: 0 });
// Use local.origin for both profile.registry and profile.packageOrigin.
await local.close();

// Or mount the same handler on a Node HTTP server at the origin root.
const handler = await createPackageHandler(options);
// await handler(request, response);
```

`PackageOriginOptions` requires all three configuration properties. `createPackageHandler(options)` asynchronously validates packages and returns `(IncomingMessage, ServerResponse) => Promise<void>`, which owns the complete response, including error handling. Route package requests to it from a containing server; unrelated API/static routes stay with that server. If mounting below a prefix, strip that prefix from `request.url` before calling it and use the prefix in the profile URLs. `servePackages({ ...options, port })` wraps the handler in a loopback HTTP server and returns `{ origin, close }`; `close()` closes active connections and resolves after shutdown. Register application shutdown handlers in the caller. No signal handlers are installed by the programmatic API.

## Focused tests

```bash
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- src/dev
```
