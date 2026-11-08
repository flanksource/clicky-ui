# @flanksource/clicky-ui

## Unreleased

### Breaking change: `--fs-*` tokens renamed to `--clicky-*`

Every `--fs-<name>` CSS custom property is now `--clicky-<name>`, and `styles/fs-tokens.css` is now `styles/clicky-tokens.css`. No aliases are provided: update any consumer CSS, inline styles or imports that reference `--fs-*` or `fs-tokens.css`.

### Breaking change: MatrixEnvHeader plan heatmap

`MatrixEnvHeader` now requires a `plans` prop containing one `{ label, mark }` tick per plan, in matrix row order. Pass the actual plan outcomes; aggregate counts alone cannot describe the heatmap. The number of ticks must equal `counts.total`, including pending plans, or the component throws. Use `mark: "pending"` for queued plans.

TypeScript consumers must add `plans` to every `MatrixEnvHeader` call (and any wrapper props); the public `MatrixTick` type describes each tick. JavaScript consumers must supply the same array before upgrading, even without a compiler check: omitting `plans` fails at render time.

```tsx
import { MatrixEnvHeader } from "@flanksource/clicky-ui/data";

<MatrixEnvHeader
  context="dev"
  counts={{ passed: 1, warned: 0, failed: 0, error: 0, running: 0, queued: 1, total: 2 }}
  plans={[{ label: "smoke", mark: "passed" }, { label: "billing", mark: "pending" }]}
  durationMs={42_000}
  running
/>;
```

The `MATRIX_PLAN_BAR` export has been removed. Use `MatrixHeatmap` with ordered ticks for per-plan progress, or the generic `ProgressBar` for aggregate progress.

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
