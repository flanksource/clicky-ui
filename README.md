# Clicky UI

Flanksource's React component library built on [shadcn/ui](https://ui.shadcn.com/) with first-class light/dark and density theming.

- **Library** (`packages/ui`) — React + TypeScript + Tailwind, published as `@flanksource/clicky-ui`.
- **Storybook** (`apps/storybook`) — Autodocs component catalog with interaction tests.
- **Docs** (`apps/docs`) — Astro Starlight guides and generated TypeScript component API.
- **Kitchen Sink** (`apps/kitchen-sink`) — React-hosted demo covering the complete component catalog.
- **E2E** (`e2e`) — Playwright tests against the kitchen sink.

Toolchain: Vite + Vitest + Storybook + Astro Starlight + Playwright + pnpm workspaces.

## Quick start

```bash
pnpm install
pnpm run build
pnpm run dev:docs        # http://localhost:4321
pnpm run dev:storybook   # http://localhost:5270
pnpm run dev:kitchen-sink # http://localhost:5273
```

## Workspace scripts

- `pnpm run check` — format check, lint, and TypeScript project check.
- `pnpm run test` — build demo apps and run unit, Storybook, and Playwright tests.
- `pnpm run build` — build the publishable UI package.
- `pnpm run build:docs` — regenerate the component API and build the static documentation site.
- `pnpm run serve:docs` — preview the built documentation site locally.
- `pnpm --filter @flanksource/clicky-ui pack` — inspect the npm package artifact.
