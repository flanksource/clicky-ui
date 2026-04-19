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
vp run storybook#dev   # http://localhost:6006
vp run kitchen-sink#dev # http://localhost:5173
```

## Workspace scripts

- `vp check` — format, lint, typecheck.
- `vp run -r test` — run unit/browser tests across workspaces.
- `vp run -r build` — build every workspace.
- `vp exec changeset` — record a version bump for release.
