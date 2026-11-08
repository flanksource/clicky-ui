# Library runtime build

Build the library's normal ESM dist first, then call `buildLibraryRuntime` from `@flanksource/page-runtime/build`. It traces the installed dependency closure, preserving installed versions and nested dependency scopes. Converted CommonJS packages import other packages through the fragment, so the React family stays shared. Browser files under dist are checked even when an entry barrel does not reach them.

```ts
import { buildLibraryRuntime } from "@flanksource/page-runtime/build";

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

A library exporting `./page-styles` declares `runtimeDependencies: string[]` on its default or named `pageStyles` recipe. List the package specifiers and recipe-relative files its CSS compiler fetches, including stylesheets, Tailwind plugins and presets. The build imports the recipe from dist and traces these dependencies from that module, including transitive CSS imports and assets, scoped mappings and integrity. The checker reads the same declaration. The recipe's `base` stylesheets are linked on every page and its `entry` holds only compiler inputs; see `src/frame/tailwind/README.md`. Browser field mappings apply before built-in rejection: `false` maps to a generated empty module, while a string resolves to its browser target.

Clicky UI's build appends the runtime step after both Vite passes and stylesheet generation, because the ESM Vite pass empties dist. `pnpm --filter @flanksource/clicky-ui test:runtime-set` runs only its Chromium probe through Gavel. It tests hooks and Clicky UI theme context, counts one React and one renderer in the development build, and checks that a deliberately duplicated React fails.
