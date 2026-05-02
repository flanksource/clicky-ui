# @flanksource/clicky-ui

## 0.2.0

### Minor Changes

- d0e30ec: Initial post-scaffold release with a comprehensive component library and tooling. Highlights:
  - Components: `DataTable`, `FilterBar` (text/number-range/enum/boolean/lookup filters with debouncing and URL persistence), `MultiSelect`, `Select`, `DateTimePicker`, `RangeSlider`, `Tree` (with auto filter UI), `Badge` (semantic/metric/custom/outlined/label variants with split layouts and copy-to-clipboard), `Avatar` (duotone/solid/stamp/mono variants), `AvatarBadge`, `IconMenuPicker`, `KeyValueList`, `MatrixTable`, `ThemeSwitcher`, `DensitySwitcher`, `MethodBadge`, `ThreadCard`.
  - Clicky AST renderer with link-command, primary/overflow views, JSON tree, code blocks, collapsed sections, and buttons.
  - API explorer: new `@flanksource/clicky-ui/api-explorer` subpath powered by Scalar; the entity explorer's default API Explorer route renders `/api/openapi.json`.
  - Diagnostics: syntax highlighting, Go goroutine and JVM thread-dump parsing with format-aware rendering.
  - Operation catalog: `OperationCatalog`, `OperationCommandPage`, `OperationEntityPage`, `EndpointList`, `useOperations`, with disabled-state support across forms and ClickyCommandRuntime integration.
  - Theming: density-driven spacing/color tokens, `SizeToken` abstraction, density-aware sizing across components, fallback icon provider via `setFallbackIconProvider()`.
  - Build: source maps enabled and minification disabled for downstream debugging; `tailwind-preset` shipped in both ESM and CJS; Storybook upgraded to 10.3.5.
