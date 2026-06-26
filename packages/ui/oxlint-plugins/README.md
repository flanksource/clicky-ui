# clicky-ui lint rules

Custom [oxlint](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) rules that
projects **consuming** `@flanksource/clicky-ui` can enable to keep their code on
the library's components, overlays, theming and icons instead of re-implementing
them by hand.

The rules ship as a JS plugin inside the published package
(`@flanksource/clicky-ui/oxlint-plugins`), so a downstream repo can turn them on
without copying anything.

## Setup

These rules require oxlint's [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
(oxlint `>=1.50`, Node `>=20.19`). Add the plugin and the rules you want to your
downstream `.oxlintrc.json`:

```json
{
  "jsPlugins": [
    { "name": "clicky-ui", "specifier": "@flanksource/clicky-ui/oxlint-plugins" }
  ],
  "rules": {
    "clicky-ui/prefer-clicky-components": "warn",
    "clicky-ui/no-adhoc-overlay": "error",
    "clicky-ui/prefer-tailwind-classes": "warn",
    "clicky-ui/prefer-theme-tokens": "error",
    "clicky-ui/prefer-clicky-icons": "warn"
  }
}
```

The `specifier` form resolves through the package's `exports` map. If your
toolchain can't resolve it, point `jsPlugins` at the file directly instead:

```json
{
  "jsPlugins": ["./node_modules/@flanksource/clicky-ui/oxlint-plugins/clicky-ui.js"]
}
```

Every rule is **opt-in** — nothing is enabled until you list it. Choose the
severity (`"warn"` / `"error"`) per rule.

## Rules

| Rule | Flags | Use instead |
| --- | --- | --- |
| `clicky-ui/prefer-clicky-components` | Native `<button>`, `<select>`, `<table>`, `<dialog>` that re-implement a shipped component | `Button`/`IconButton`, `Select`/`Combobox`, `DataTable`, `Modal` |
| `clicky-ui/no-adhoc-overlay` | `role="dialog"`/`"alertdialog"`, arbitrary `z-[N]` classes, `style={{ zIndex: N }}` | `Modal`, `DropdownMenu`, `Toast`, and the `zIndex` scale |
| `clicky-ui/prefer-tailwind-classes` | Inline `style` with **static** spacing/layout/typography values (`padding`, `margin`, `gap`, `display`, `fontWeight`, …) | Tailwind utilities + density utilities (`p-density-4`, `gap-density-2`) |
| `clicky-ui/prefer-theme-tokens` | Hardcoded colors (`text-[#fff]`, `style={{ color: "#fff" }}`) and hand-reading the `clicky-ui-theme`/`clicky-ui-density` storage keys | Semantic tokens (`text-foreground`, `bg-background`, …) and the `useTheme`/`useDensity` hooks |
| `clicky-ui/prefer-clicky-icons` | Icon imports from third-party libraries (lucide, react-icons, heroicons, MUI, phosphor, tabler, font-awesome, …), emoji used as icons, and raw iconify name strings (`codicon:clock`, `lucide:activity`, …) passed as a value/argument | `@flanksource/clicky-ui/icons` (`Ui*`), `@flanksource/icons/mi`, or `@iconify/react` |

### `prefer-clicky-components`

Rebuilding a primitive by hand means re-doing its styling, theming, density and
accessibility — and drifting from the library over time. Reuse the component.

```tsx
// ✗ flagged
<button onClick={save}>Save</button>;

// ✓
import { Button } from "@flanksource/clicky-ui/components";
<Button onClick={save}>Save</Button>;
```

### `no-adhoc-overlay`

Overlays must share clicky-ui's centralized z-index scale (`overlay/zIndex.ts`)
so a dropdown opened inside a modal can't render behind it. Arbitrary `z-[N]`
Tailwind classes are doubly bad: a consumer's Tailwind build only emits the
arbitrary classes it can scan from the published dist, so a fresh `z-[N]` may
compile to nothing.

```tsx
// ✗ flagged
<div role="dialog" className="z-[9999]">…</div>;

// ✓
import { Modal } from "@flanksource/clicky-ui/components";
<Modal open={open} onClose={close}>…</Modal>;
```

### `prefer-tailwind-classes`

Static inline styles bypass Tailwind and the density system. **Computed** values
(`var()`, `calc()`, `clamp()`, identifiers, expressions) are intentionally
allowed — those legitimately can't be a static class.

```tsx
// ✗ flagged
<div style={{ padding: 8, gap: 4 }} />;

// ✓
<div className="p-density-4 gap-density-2" />;

// ✓ allowed — dynamic value can't be a static class
<div style={{ fontSize: "clamp(1rem, 18cqmin, 2.5rem)" }} />;
```

### `prefer-theme-tokens`

Hardcoded colors don't flip with `[data-theme]`, defeating light/dark theming.
Reading the storage keys by hand re-implements the hooks.

```tsx
// ✗ flagged
<span className="text-[#111]" style={{ backgroundColor: "#fff" }} />;
localStorage.getItem("clicky-ui-theme");

// ✓
<span className="text-foreground bg-background" />;
import { useTheme } from "@flanksource/clicky-ui/hooks";
const { theme } = useTheme();
```

### `prefer-clicky-icons`

Icons should come from an approved source and be real components, not emoji,
glyphs pulled from an unrelated icon library, or raw iconify name strings
(known icon-set prefixes: `ph`, `lucide`, `codicon`, `tabler`, `mdi`,
`svg-spinners`, `jb-expui-*`) passed as a value or argument.

```tsx
// ✗ flagged
import { Star } from "lucide-react";
<span>🔍</span>;
const icon = "codicon:clock"; // raw iconify name string
<Icon icon="lucide:activity" />;

// ✓
import { UiStar } from "@flanksource/clicky-ui/icons";
import { K8SSecret } from "@flanksource/icons/mi";
import { Icon } from "@iconify/react";
```

## Developing the rules

Each rule lives in its own `clicky-ui-*.js` file and exports a pure predicate
(e.g. `isArbitraryZIndexClass`, `isUnapprovedIconImport`) that is unit-tested in
`clicky-ui.test.ts`. `clicky-ui.js` is the plugin entry that registers them. Run
the tests with:

```bash
pnpm --filter @flanksource/clicky-ui test clicky-ui
```
