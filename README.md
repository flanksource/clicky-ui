# Clicky UI

Flanksource's React component library built on [shadcn/ui](https://ui.shadcn.com/) with first-class light/dark and density theming.

- **Library** (`packages/ui`) — React + TypeScript + Tailwind, published as `@flanksource/clicky-ui`.
- **Storybook** (`apps/storybook`) — component catalog with interaction tests.
- **Kitchen Sink** (`apps/kitchen-sink`) — Preact-hosted demo proving runtime compatibility.
- **E2E** (`e2e`) — Playwright tests against the kitchen sink.

Toolchain: [Vite+](https://viteplus.dev) (`vp`) + pnpm workspaces + Changesets.

## Quick start

```bash
vp install
vp run -r build
vp run storybook#dev   # http://localhost:5270
vp run kitchen-sink#dev # http://localhost:5273
```

## Workspace scripts

- `vp check` — format, lint, typecheck.
- `vp run -r test` — run unit/browser tests across workspaces.
- `vp run -r build` — build every workspace.
- `vp exec changeset` — record a version bump for release.
- `pnpm check:arch` — Apple Silicon preflight (see below).

## Apple Silicon: storybook arch mismatch

If `pnpm dev:storybook` aborts with:

```
dyld[<pid>]: terminating because inserted dylib '/var/folders/.../T/fspy/fspy_preload_<hash>.dylib'
could not be loaded: ... (mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64'))
```

…then a child process spawned by storybook is running x86_64 while the rest of the toolchain is arm64. `vite-plus` injects a Rust-built fspy dylib via `DYLD_INSERT_LIBRARIES` to track file accesses; this dylib is arm64-only on M-series Macs (we depend on `@voidzero-dev/vite-plus-darwin-arm64` directly). Any x86_64 descendant aborts on launch.

`pnpm dev:kitchen-sink` is unaffected because vite-plus runs vite in-process; only `pnpm dev:storybook` spawns the extra child layer that's susceptible.

### Quick fixes

1. Sanity-check the cached dylib: `file "$TMPDIR/fspy/"*.dylib` should report `arm64`. If it doesn't, `rm -rf "$TMPDIR/fspy"` and rerun.
2. Force the spawn binpref to arm64 for one run: `arch -arm64 pnpm dev:storybook`.
3. If your terminal is universal and was launched under Rosetta, fix it permanently: Finder → terminal app → Get Info → uncheck "Open using Rosetta", quit (Cmd-Q), relaunch.

### Diagnose with a node shim (no SIP/dtrace required)

```sh
mkdir -p /tmp/arch-shim
cat > /tmp/arch-shim/node <<'SH'
#!/bin/sh
echo "[shim] pid=$$ ppid=$PPID arch=$(arch) uname=$(uname -m) argv=$*" >> /tmp/arch-shim/log
exec /opt/homebrew/opt/node@24/bin/node "$@"
SH
chmod +x /tmp/arch-shim/node
> /tmp/arch-shim/log
PATH=/tmp/arch-shim:$PATH pnpm dev:storybook
# After the crash, inspect /tmp/arch-shim/log — lines where arch != arm64 are the offenders.
```

`pnpm check:arch` runs `hack/check-arch.mjs` and fails fast on the most common mis-arch states before storybook even starts. It's wired as `predev:storybook` automatically.
