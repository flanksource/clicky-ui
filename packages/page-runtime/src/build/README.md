# Library runtime build

The shared builder ships compiled JavaScript and declarations as `@flanksource/page-runtime-build`. Build its distribution from the clicky-ui workspace before packing it:

```sh
pnpm --dir packages/page-runtime run build:builder
mkdir -p .tmp
pnpm --dir packages/page-runtime/dist/build --config.ignoreScripts=true pack --out ../../../../.tmp/page-runtime-build.tgz
```

The package is assembled from `builder-package.json`; it excludes browser host dependencies. The parent clicky-ui repository publishes it through `.github/workflows/release.yml` on pushes to `main`, alongside the Clicky UI release matrix. The workflow selects the next stable patch from registry history, updates `builder-package.json`, builds and tests the compiler, publishes `dist/build` with provenance, then commits the version and creates a `page-runtime-build@<version>` tag. First publication uses the version already declared in the manifest. Registry authentication and network failures stop the release.

The parent CI workflow's `runtime-builder` job builds and tests the same package on pull requests and uploads `page-runtime-build.tgz` for inspection. Downstream dependency and lockfile updates follow a successful CI publication. The workspace's `@flanksource/page-runtime/build` export uses the same compiled implementation.

Configure the npm trusted publisher for `@flanksource/page-runtime-build` with organization `flanksource`, repository `clicky-ui`, and workflow filename `release.yml`. The package's repository metadata matches that parent repository for provenance. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Installed dependency runtimes

```ts
import { buildDependencyRuntime, runtimeEntries } from "@flanksource/page-runtime-build/dependencies";

const root = "/workspace/render-environment";
await buildDependencyRuntime({
  root,
  outDir: `${root}/page-runtime/browser`,
  entries: runtimeEntries({ root, libraries: ["@flanksource/facet"] }),
  target: "browser",
});
```

`root` contains the installed dependency environment and its lockfile. `entries` contains package specifiers and subpaths; `runtimeEntries` combines the React base set with a library's published fragment. `target` selects Node or browser resolution conditions. `outDir` receives relocatable ESM chunks, styles, assets and `runtime.json` with entry mappings, integrity and input hashes. CommonJS entry facades expose both named exports and the original default value. `external` maps shared base entries to precompiled modules, preserving React identity across additional dependency closures. `exports` optionally limits an entry to requested bindings; published barrel indexes allow unrelated optional features to stay outside that closure.

`ensureDependencyRuntime` takes the same options with `cacheDir` in place of `outDir`. It serializes competing processes, keys compilation by the lockfile, compiler, ABI, target and entry selection, validates library input hashes on reuse, and publishes immutable generations. Older generations remain available to active readers. Compilation failures leave the previous pointer intact.

`dependencyRuntimePlugin({ root, cacheDir, base })` connects a prepared runtime to Vite or Rolldown. The base includes its manifest plus `root`. Node builds import its modules externally; browser development serves its ESM modules directly. Additional package imports compile into the shared cache and reuse the base's React family. CSS imports are passed to the host's stylesheet pipeline.

## Library fragments

Build the library's normal ESM dist first, then call `buildLibraryRuntime` from `@flanksource/page-runtime-build`. It traces the installed dependency closure, preserving installed versions and nested dependency scopes. Converted CommonJS packages import other packages through the fragment, so the React family stays shared. Browser files under dist are checked even when an entry barrel does not reach them.

```ts
import { buildLibraryRuntime } from "@flanksource/page-runtime-build";

const { fragment, barrels } = await buildLibraryRuntime({
  libraryDir: "/workspace/my-library",
  outDir: "/workspace/my-library/dist/runtime",
  base: clickyUiFragment,
  aliases: { "@example": "my-library" },
});
```

`libraryDir` contains package.json, the built dist and the installed dependencies selected by the library's lockfile. `outDir` receives importmap.json, barrels.json and development modules. Publish that directory as dist/runtime; fragment URLs name the actual published dist/runtime paths. `base` is the optional fragment whose top-level packages this library inherits. A dependent library cannot replace those packages. `aliases` declares optional page-facing aliases for this library's own specifier prefixes.

The clicky-ui package defines the base set: React, its JSX runtimes, React DOM and its client entry, scheduler, React Query and jotai. Normal npm exports and React peers keep their existing behavior. Barrel shortcuts require the containing package's sideEffects declaration to permit skipping the forwarding module; a direct side-effect import keeps that module intact.

The runtime always builds React and its dependency closure with `NODE_ENV=development`, including published runtime sets and frames embedded in deployed applications. Runtime modules live directly under `dist/runtime/`, without environment subdirectories or URL placeholders. Owner metadata, source locations and warnings remain available in every frame.

Run from packages/page-runtime:

```sh
pnpm exec tsx scripts/build-library-runtime.ts ../ui
pnpm run check-fragment ../ui
gavel test --work-dir . --framework vitest --recursive=false -- src/build
```

A library inheriting clicky-ui can pass its fragment to either CLI:

```sh
pnpm exec tsx scripts/build-library-runtime.ts /workspace/my-library ../ui/dist/runtime/importmap.json
pnpm run check-fragment /workspace/my-library ../ui/dist/runtime/importmap.json
```

The checker validates the written fragment against a fresh dist trace and checks converted files' integrity and imports. Without a base argument, declared inherited specifiers count as mapped; with a base it also verifies that the base provides them. Missing mappings, Node built-ins and unconverted CommonJS fail the check. Build failures use NodeBuiltinError, CommonJsConversionError and BaseSetRemapError for those named failure classes.

## Export compiler plugins

A library can contribute remark plugins that run when a Markdown or MDX page is exported to HTML or PDF. Live previews never run them. Declare them in package.json under `pageRuntime.compiler`. Each `module` must be one of the library's own `exports`, and its default export is the plugin. `options` is the JSON value the plugin is applied with:

```json
{
  "exports": { "./remark/facet-redact": "./remark/facet-redact.mjs" },
  "pageRuntime": {
    "compiler": {
      "remark": [{ "module": "@flanksource/facet/remark/facet-redact", "options": { "allow": {} } }]
    }
  }
}
```

The build traces each plugin module, even outside dist, and writes the declaration to the fragment's `compiler` field. A page's lock collects every library's declaration in library order. A local checkout link replaces its library's entry. On export, the frame loads the export compiler and each plugin through the page's import map, with integrity checks. It compiles the page with the base plugins followed by the declared ones, and renders that result in place of the live page for the snapshot or print. Exporting a page that imports other Markdown fails, because the worker compiles imported Markdown without these plugins. An undeclared module, an empty list, or another package's module fails the build.

A library exporting `./page-styles` declares `runtimeDependencies: string[]` on its default or named `pageStyles` recipe. List the package specifiers and recipe-relative files its CSS compiler fetches, including stylesheets, Tailwind plugins and presets. The build imports the recipe from dist and traces these dependencies from that module, including transitive CSS imports and assets, scoped mappings and integrity. The checker reads the same declaration. The recipe's `base` stylesheets are linked on every page and its `entry` holds only compiler inputs; see `src/frame/tailwind/README.md`. Browser field mappings apply before built-in rejection: `false` maps to a generated empty module, while a string resolves to its browser target.

Clicky UI's build appends the runtime step after both Vite passes and stylesheet generation, because the ESM Vite pass empties dist. `pnpm --filter @flanksource/clicky-ui test:runtime-set` runs only its Chromium probe through Gavel. It tests hooks and Clicky UI theme context, counts one React and one renderer in the development build, and checks that a deliberately duplicated React fails.
