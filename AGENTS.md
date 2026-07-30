# clicky-ui — agent notes

Shared ways of working, the gavel todo workflow, and global skills come from the root ~/.agents/AGENTS.md.

## Skills
- [clicky-ui conventions](.agents/skills/clicky-ui/SKILL.md) — AppShell slots and the scroll/height contract, DataTable sticky-header + pagination rules, clicky-rpc operation catalogs, theming/overlay/icon conventions, the custom oxlint rules, and the three testing layers

## Memory
- [AI Tool Browser, Preferences & Permissions](.agents/memory/ai-tool-preferences.md) — ToolSchemaBrowser split view, CompactToolList as the one permissions interaction model, permissionMode at model level, one-line advanced rows
- [MDX Editor, JsonSchemaForm & State Adapters](.agents/memory/markdown-forms-and-display-options.md) — lazy MdxEditorField package boundary, format:"md" seam, Jotai/URL adapters, form-local display-options menu with x-layout precedence
- [FixtureEditor & Gavel Fixture Schemas](.agents/memory/fixture-editor-and-schemas.md) — unwrapped MdxEditorField surface, fixtures_schema.go Exclude list, build:storybook-schemas regeneration, local issue-CLI flake shields
- [Lint, Build, Fast Refresh & Verification](.agents/memory/lint-build-and-verification.md) — canonical check/vitest-run commands, consumer oxlint plugin docs, Makefile node PATH, export-boundary hygiene, known ambient failures
- [Storybook, Docs App & Kitchen Sink](.agents/memory/storybook-docs-and-demos.md) — autodocs defaults, docgen include seam, generated-icons gitignore, vite preview for iframe routes, Astro/Starlight docs, neutral approval styling
- [Data Components, Icons & Mobile Responsiveness](.agents/memory/data-components-and-responsive.md) — Clicky extraction, measureOverflow fix, 1em Icon default, download-menu whitelist, WorkloadCard, drawer-nav/scrollable-table mobile choices
- [Form Controls, Overlays & Route Sync](.agents/memory/controls-overlays-and-route-sync.md) — topmost-only Escape via modalStack, OperationCommandPage URL sync, InputField unification, SegmentedControl preset styling
