# Local package publications

Local package origins serve completed package snapshots. Run the normal build in Clicky UI, React Grab, or Facet; it holds a package build lock, builds all artifacts, validates the package, then publishes it. A failed or interrupted build leaves the last successful publication active. Concurrent builds of the same package wait for the owner to finish.

Publication uses `pnpm --config.ignoreScripts=true pack --json` to preserve the package manager's file selection, workspace dependency rewriting, and inherited license files without rerunning lifecycle scripts. Exported files, runtime fragments, barrel indexes, and local integrity entries must be valid before activation. This requires pnpm and tar on the build machine.

Each package stores immutable builds under `.tmp/package-publications/generations/<sha256>/package/`. `current.json` changes through an atomic rename only after the snapshot is complete. Do not edit snapshots. Old builds remain available for open pages; retention and cleanup are deliberately operator controlled. A forcibly killed build can leave `build.lock`; the next build reports the stopped owner. Confirm the process has exited before removing that lock.

For an existing, already-complete build, initialize its publication explicitly:

```sh
pnpm --dir packages/ui exec tsx ../page-runtime/scripts/run-package-build.ts --publish-only
pnpm --dir packages/react-grab exec tsx ../page-runtime/scripts/run-package-build.ts --publish-only
```

Start a standalone package origin with persistent catalog storage:

```sh
pnpm --filter @flanksource/page-runtime run serve-packages --package ../ui --package ../react-grab --package ../../../facet --state-dir .tmp/package-origin --port 5812
```

`--package` selects an already published package directory and can repeat. `--state-dir` retains catalogs across restarts; do not delete it while old pages remain open. `--upstream-registry` supplies metadata for packages outside the local set, and `--upstream-origin` supplies their versioned files. Missing local versions or files fail without contacting upstream.

`/__catalog.json` describes the current set. `/_generations/<catalog-sha256>/__catalog.json` describes a retained set, and package metadata and files below that prefix stay bound to those snapshots. The playground's profile captures that prefix for both registry and package origin. PageLock format 2 records `packageOrigin`, so uncached module fetches use the same generation as resolution. Old saved locks are resolved again from their manifests.

The playground sends the full catalog as a named `packages` event over `/__playground/changes`, including on reconnect. A changed package used by an open page produces an **Out of date** banner with **Refresh**. Manual refresh fetches the latest profile and resolves a new lock even when source is unchanged, then replaces the frame. The banner remains until readiness succeeds and remains available for retry on failure. Automatic mode uses the existing source-edit, comment-draft, busy, and storage safeguards. Host editor and comment state stay mounted; state inside the replaced frame resets.
