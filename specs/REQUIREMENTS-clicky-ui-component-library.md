# Feature: Clicky UI — React Component Library with Preact Kitchen-Sink

## Overview

Build `@flanksource/clicky-ui`, an **internal design system** that is also published to the **public npm registry**. The library itself is authored in **React 18+** using **shadcn/ui** components (consumed as-is, not ported). A **Preact-based kitchen-sink demo site** proves compatibility by consuming the library via `preact/compat`. The whole toolchain is unified under **Vite Plus** (`vp dev/build/check/test/run/pack`). Storybook documents components with interaction tests; Vitest covers unit and real-browser tests; Playwright covers end-to-end flows against the kitchen-sink.

**Problem solved**: Flanksource needs a single, versioned, tree-shakeable UI package with first-class light/dark theming and density presets so product teams stop rebuilding primitives. Publishing publicly also lets external users and the broader open-source community benefit.

**Target users**:

- **Primary**: Flanksource frontend engineers composing product UIs.
- **Secondary**: External consumers pulling the package from npm.
- **Tertiary**: Designers reviewing visual/behavioral states via Storybook and the kitchen-sink.

---

## Functional Requirements

### FR-1: React Component Library (shadcn-based)

**Description**: Ship a React component library whose source is scaffolded from shadcn/ui and owned in-repo. Components cover layout/structure, data display, and navigation/feedback categories.

**User Story**: As a Flanksource frontend engineer, I want to install `@flanksource/clicky-ui` and import vetted components so that I stop re-implementing primitives.

**Acceptance Criteria**:

- [ ] Library is authored in React 18+ with TypeScript strict mode.
- [ ] Components present: Card, Separator, Tabs, Accordion, Collapsible, Sheet, Dialog.
- [ ] Components present: Table, Badge, Avatar, Tooltip, Progress, Skeleton.
- [ ] Components present: Dropdown, Menu, Toast (Sonner), Alert, Breadcrumb, Command palette.
- [ ] Every component exported from a barrel (`index.ts`) **and** a per-component subpath for tree-shaking.
- [ ] Every component exposes typed props (no `any` in public API).

### FR-2: Theming — Light/Dark + Runtime Switcher

**Description**: Ship a `<ThemeProvider>` plus `useTheme()` hook that toggles between `light`, `dark`, and `system`, persists the choice to `localStorage`, and applies via `data-theme` on `<html>`.

**User Story**: As an end user of a product built with clicky-ui, I want to switch themes at runtime so that the app matches my system preference or my personal choice.

**Acceptance Criteria**:

- [ ] Tokens are CSS variables scoped by `data-theme`.
- [ ] `useTheme()` returns `{ theme, setTheme, resolvedTheme }`.
- [ ] System preference is respected when `theme === 'system'`.
- [ ] Choice persists across reload via `localStorage`.
- [ ] No flash of wrong theme on initial load (inline script sets `data-theme` before hydration).

### FR-3: Density Presets — Runtime Selectable

**Description**: Ship a `<DensityProvider>` + `useDensity()` hook that toggles `compact`, `comfortable`, `spacious` at runtime via `data-density` on `<html>`, layered as CSS variables over shadcn tokens.

**User Story**: As a product engineer, I want to adapt the UI's density to match dashboard vs. settings contexts so that I can reuse components without visual overrides.

**Acceptance Criteria**:

- [ ] Three presets available: `compact`, `comfortable` (default), `spacious`.
- [ ] Applied via `data-density` attribute on `<html>`.
- [ ] CSS variables include at least `--spacing-unit`, `--control-height`, `--font-size-base`.
- [ ] Switching density visibly updates layout without remount.
- [ ] Choice persists across reload via `localStorage`.

### FR-4: Tailwind Preset Export

**Description**: Export a Tailwind preset consumers add to their `tailwind.config`, giving them the full token palette, radii, fonts, and `data-theme`/`data-density` variants without copying config.

**User Story**: As a downstream app maintainer, I want one-line Tailwind integration so that my app's utilities stay in sync with the design system.

**Acceptance Criteria**:

- [ ] Exported at subpath `@flanksource/clicky-ui/tailwind-preset`.
- [ ] Exposes theme tokens (colors, radii, fonts) matching the library's CSS variables.
- [ ] Defines Tailwind variants for `data-theme="dark"` and each `data-density` value.
- [ ] Storybook and kitchen-sink both consume the preset (proves it works).

### FR-5: Packaging — ESM + Types + Tokens CSS

**Description**: Publish a modern ESM-only package with `.d.ts`, per-component entry points, and a separately importable `styles.css` for consumers not using Tailwind.

**User Story**: As a consumer, I want ESM-only, tree-shakeable imports and accurate types so that my bundle stays small and my editor autocompletes correctly.

**Acceptance Criteria**:

- [ ] `"type": "module"`; no CJS output.
- [ ] `exports` map: `.`, `./tailwind-preset`, `./styles.css`, `./components/*`.
- [ ] `.d.ts` generated via `vite-plugin-dts` and referenced in `exports`.
- [ ] `react`, `react-dom`, `tailwindcss` declared as `peerDependencies`.
- [ ] `npm pack` output contains only `dist/`, `styles.css`, `tailwind-preset`, `README`, `LICENSE`.

### FR-6: Public npm Publishing via Changesets

**Description**: Release `@flanksource/clicky-ui` to the public npm registry using Changesets; GitHub Actions opens a Version PR and publishes on merge.

**User Story**: As a maintainer, I want a guarded, automated release flow so that versions, changelogs, and npm publishes stay consistent.

**Acceptance Criteria**:

- [ ] Changesets configured with `access: public`, `baseBranch: main`.
- [ ] `storybook` and `kitchen-sink` workspaces ignored (not published).
- [ ] A Version PR is opened automatically when changesets are pending.
- [ ] Merging the Version PR triggers `vp build` + `changeset publish` using `NPM_TOKEN`.
- [ ] Published versions visible via `npm view @flanksource/clicky-ui versions`.
- [ ] README and LICENSE included in the published tarball.

### FR-7: Storybook — Stories + Interaction Tests

**Description**: Storybook 8 (React renderer) hosts one story file per component with Args/Controls, variant/state coverage, and `play()` interaction tests using `@storybook/test`.

**User Story**: As a designer or reviewer, I want to inspect every component state interactively and see interaction tests pass so that I trust the component's behavior.

**Acceptance Criteria**:

- [ ] One `*.stories.tsx` file per component in `packages/ui/src/components`.
- [ ] Each story defines Args/Controls for all meaningful props.
- [ ] States covered: default, hover, focus, disabled, loading where applicable.
- [ ] `play()` functions assert keyboard navigation and state transitions.
- [ ] `vp test --filter storybook` runs interaction tests in CI.
- [ ] Storybook consumes the library's Tailwind preset (visual parity with production).

### FR-8: Preact Kitchen-Sink Demo

**Description**: A Vite app that uses **Preact via `preact/compat`** to consume the React library; hosts per-component showcases, realistic page templates, a live theme+density switcher, and code preview panels.

**User Story**: As a prospective adopter, I want to browse a demo site and see real-world usage next to source snippets so that I can evaluate the library quickly.

**Acceptance Criteria**:

- [ ] Vite config aliases `react`, `react-dom`, and `react/jsx-runtime` to `preact/compat` (and `preact/jsx-runtime`).
- [ ] Each library component has a showcase page with every variant and state.
- [ ] Realistic templates exist: dashboard, settings, form-heavy page.
- [ ] A visible runtime switcher lets the user change theme (light/dark/system) and density (compact/comfortable/spacious).
- [ ] Each example shows a code preview panel beside the rendered component.
- [ ] The app runs without runtime errors under Preact.

### FR-9: Vitest — Unit + Browser Modes

**Description**: Vitest runs jsdom unit tests for logic/hooks and browser-mode tests (Playwright-backed) for components that depend on real layout/focus/portals.

**User Story**: As a library maintainer, I want fast jsdom tests for logic and real-browser tests for DOM-sensitive code so that regressions are caught without over-mocking.

**Acceptance Criteria**:

- [ ] `vp test` runs jsdom tests using `@testing-library/react`.
- [ ] `vp test --browser` runs browser-mode tests for portal/focus-dependent components.
- [ ] Hooks (`useTheme`, `useDensity`) have dedicated unit tests.
- [ ] `cn()` helper and other utilities have unit tests.
- [ ] Both modes pass in CI before merge.

### FR-10: Playwright E2E on Kitchen-Sink

**Description**: Playwright end-to-end tests drive the built Preact kitchen-sink to verify theming persistence, density switching, and realistic template flows.

**User Story**: As a release manager, I want E2E coverage of the demo so that I know the published package works in a real Preact runtime.

**Acceptance Criteria**:

- [ ] Playwright config boots the kitchen-sink via `vp run --filter kitchen-sink dev`.
- [ ] Tests cover: theme toggle + persistence, density switch + persistence, dashboard template navigation, form-heavy template submit with validation + toast.
- [ ] Runs across chromium, firefox, webkit projects.
- [ ] Passes in CI on every PR.

### FR-11: CI/CD — GitHub Actions

**Description**: GitHub Actions pipelines run all quality gates on PRs, deploy Storybook + kitchen-sink previews, and publish to npm on release.

**User Story**: As a contributor, I want every PR checked automatically and previews deployed so that review is fast and confident.

**Acceptance Criteria**:

- [ ] `ci.yml` runs `vp check`, `vp test` (unit + browser), `vp build`, `playwright test` on every PR.
- [ ] `deploy.yml` builds and publishes Storybook + kitchen-sink to GitHub Pages.
- [ ] `release.yml` runs `changesets/action` — opens Version PR; on merge publishes to npm.
- [ ] All required checks must pass before merge.

### FR-12: TypeScript Strict Mode

**Description**: All workspaces use a shared `tsconfig.base.json` with strict options.

**User Story**: As a consumer, I want accurate types and safe indexing so that I catch bugs at compile time.

**Acceptance Criteria**:

- [ ] `strict: true`, `noUncheckedIndexedAccess: true`, `moduleResolution: "bundler"`.
- [ ] Every public API export has an explicit type.
- [ ] `vp check` is green before merge.

---

## User Interactions

- **Consumer developer**: `npm install @flanksource/clicky-ui react react-dom tailwindcss`, add the Tailwind preset, wrap app with `<ThemeProvider><DensityProvider>`, import components from `@flanksource/clicky-ui` or subpaths.
- **End user of a clicky-ui-powered app**: toggles theme and density via UI controls; preference persists across sessions.
- **Storybook reviewer**: browses `/stories`, flips through Args/Controls, watches interaction tests run.
- **Kitchen-sink visitor**: navigates showcase + templates, toggles theme/density, reads code snippets.
- **Release manager**: merges Version PR → npm publish triggers automatically.

---

## Technical Considerations

- **Runtimes**: React 18+ (library, Storybook, tests); Preact latest + `preact/compat` (kitchen-sink only).
- **Build**: Vite library mode + `vite-plugin-dts`; externalize `react`, `react-dom`, `tailwindcss`.
- **Styling**: Tailwind CSS + CSS variables; density and theme layered via `data-*` attributes on `<html>`.
- **Persistence**: `localStorage` for theme + density choices; inline boot script prevents theme flash.
- **Toolchain**: Vite Plus (`vp dev/build/check/test/run/pack`) orchestrates workspaces; Changesets handles versioning.
- **CI**: GitHub Actions matrix for test + build; separate workflow for release; Pages for previews.

---

## Success Criteria

- [ ] Library builds cleanly as ESM with types; `npm pack` tarball is minimal and correct.
- [ ] Storybook runs with every component documented and interaction tests passing.
- [ ] Kitchen-sink runs under Preact with all components, theme switching, and density switching functional.
- [ ] Unit, browser, and E2E tests are green in CI.
- [ ] TypeScript strict mode passes across all workspaces.
- [ ] First public version published to npm via the automated release workflow.
- [ ] Storybook + kitchen-sink previews accessible on GitHub Pages.

---

## Testing Requirements

- **Unit (Vitest + jsdom)**: hooks (`useTheme`, `useDensity`), `cn()` and other utilities, pure component logic.
- **Browser (Vitest browser mode, Playwright-backed)**: portal/focus/layout-dependent components (Dialog, Sheet, Dropdown, Tooltip, Command).
- **Storybook interaction (`play()` + `@storybook/test`)**: keyboard nav, open/close, focus trap, state transitions per component.
- **E2E (Playwright on kitchen-sink)**: theme persistence, density switch, dashboard navigation, form submit + validation + toast.
- **Cross-browser**: chromium, firefox, webkit for E2E.

---

## Implementation Checklist

### Phase 1: Setup & Planning

- [ ] Initialize Vite Plus workspace with `packages/ui`, `apps/storybook`, `apps/kitchen-sink`, `e2e`.
- [ ] Create `tsconfig.base.json` with strict options; per-workspace `tsconfig.json` extends it.
- [ ] Configure root `package.json` (pnpm workspace, devDeps: `vite-plus`, `typescript`, `changesets`).
- [ ] Add `.changeset/config.json` with `access: public`, `baseBranch: main`, ignored workspaces.
- [ ] Scaffold shadcn components into `packages/ui/src/components`.

### Phase 2: Core Library

- [ ] Implement `cn()` helper in `lib/utils.ts`.
- [ ] Implement `styles/tokens.css` (theme + density CSS variables).
- [ ] Implement `hooks/use-theme.ts` + `ThemeProvider` with persistence + no-flash boot script.
- [ ] Implement `hooks/use-density.ts` + `DensityProvider` with persistence.
- [ ] Add/verify every required component (Card, Dialog, Sheet, Table, Toast, Dropdown, Menu, Command, etc.).
- [ ] Author `tailwind-preset.ts` with tokens + `data-theme` / `data-density` variants.
- [ ] Author `index.ts` barrel + configure per-component subpath exports.
- [ ] Configure `packages/ui/vite.config.ts` library mode + dts plugin; externals set.
- [ ] Configure `packages/ui/package.json` `exports` map and `peerDependencies`.

### Phase 3: Storybook

- [ ] Scaffold `apps/storybook` with Storybook 8 React renderer.
- [ ] Import tokens.css + Tailwind preset into `.storybook/preview.ts`.
- [ ] Add `*.stories.tsx` for every component with Args/Controls.
- [ ] Cover variants and states (default/hover/focus/disabled/loading) per story.
- [ ] Add `play()` interaction tests using `@storybook/test`.

### Phase 4: Kitchen-Sink (Preact)

- [ ] Scaffold `apps/kitchen-sink` with `@preact/preset-vite`.
- [ ] Configure Vite alias `react`/`react-dom`/`react/jsx-runtime` → `preact/compat`.
- [ ] Build showcase pages for every component (all variants + states).
- [ ] Build realistic templates: dashboard, settings, form-heavy page.
- [ ] Implement theme + density switcher UI with persistence.
- [ ] Implement code preview panels beside each example.

### Phase 5: Tests

- [ ] Unit tests (jsdom) for hooks and utilities.
- [ ] Browser-mode tests for Dialog/Sheet/Dropdown/Tooltip/Command.
- [ ] Storybook interaction tests green under `vp test --filter storybook`.
- [ ] Playwright config in `e2e/playwright.config.ts` with webServer + baseURL.
- [ ] E2E tests: theme persistence, density switch, dashboard flow, form submit with validation + toast.

### Phase 6: CI/CD & Release

- [ ] `.github/workflows/ci.yml` — `vp check`, `vp test`, `vp build`, `playwright test`.
- [ ] `.github/workflows/deploy.yml` — publish Storybook + kitchen-sink to GitHub Pages.
- [ ] `.github/workflows/release.yml` — `changesets/action` Version PR + npm publish via `NPM_TOKEN`.
- [ ] Add `README.md` and `LICENSE` to `packages/ui`.
- [ ] Verify `npm pack` output; dry-run a release; confirm published version on npm.

### Phase 7: Documentation & Cleanup

- [ ] Root `README.md` with install + quickstart + links to Storybook and kitchen-sink.
- [ ] `packages/ui/README.md` with props-table highlights, theming guide, density guide.
- [ ] Verify all acceptance criteria met before cutting v0.1.0.
- [ ] Tag and announce the first public release.

---

## Out of Scope (explicitly deferred)

- WCAG 2.1 AA audit + axe/keyboard test suites (not selected in quality gates).
- MDX documentation and Storybook a11y addon (not selected).
- Dual ESM+CJS output; per-component CJS builds.
- Multi-brand theme packs (single brand + light/dark for v1; architecture supports adding more via `data-theme` values later).
- WCAG AA + axe checks can be revisited after v0.1.0.
