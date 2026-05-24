# @flanksource/clicky-ui

Flanksource's React component library built on [shadcn/ui](https://ui.shadcn.com/) with light/dark theming and density presets.

## Install

```bash
pnpm add @flanksource/clicky-ui react react-dom tailwindcss
```

## Usage

```tsx
import { Button } from "@flanksource/clicky-ui/components";
import { ThemeProvider, DensityProvider } from "@flanksource/clicky-ui/hooks";
import "@flanksource/clicky-ui/styles.css";

export function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <Button variant="default">Click me</Button>
      </DensityProvider>
    </ThemeProvider>
  );
}
```

## Clicky AST Renderer

```tsx
import { Clicky, type ClickyDocument } from "@flanksource/clicky-ui/clicky";

const document: ClickyDocument = {
  version: 1,
  node: {
    kind: "text",
    text: "hello from clicky",
    plain: "hello from clicky",
  },
};

export function ClickyPanel() {
  return <Clicky data={document} />;
}
```

`Clicky` also accepts a JSON string payload. The intended producer is the sibling `clicky` repo's tagged `html-react` AST, which preserves structural types such as trees, tables, code blocks, collapsed sections, buttons, and nested text content.

## Operation explorer

`OperationCatalog` and `EntityExplorerApp` (both exported from `@flanksource/clicky-ui/rpc`) render an OpenAPI spec — fetched via an `OperationsApiClient` — as a navigable list of operations grouped by entity surface. They expect the spec to declare `x-clicky` surface metadata for the surfaces they should expose. See `apps/kitchen-sink/src/demos/OperationExplorerDemo.tsx` for a fake-client example.

## Bundle size guidance

Prefer subpath imports in production apps:

```tsx
import { Button } from "@flanksource/clicky-ui/components";
import { cn } from "@flanksource/clicky-ui/utils";
import { DataTable } from "@flanksource/clicky-ui/data";
```

The root `@flanksource/clicky-ui` barrel remains supported for compatibility and convenience, but subpaths give bundlers a smaller entry surface. Import `@flanksource/clicky-ui/styles.css` once at the app root. Markdown parsing and code highlighting are loaded asynchronously by their components.

## Tailwind preset

```ts
// tailwind.config.ts
import preset from "@flanksource/clicky-ui/tailwind-preset";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

The preset wires up:

- Theme tokens via `[data-theme="light" | "dark"]` attributes on `<html>`.
- Density variants via `[data-density="compact" | "comfortable" | "spacious"]`.
- Spacing utilities (`gap-density-2`, `p-density-4`, etc.) scaled by the active density.

## Theming

```tsx
const { theme, resolvedTheme, setTheme } = useTheme();
const { density, setDensity } = useDensity();
```

Both hooks persist their choice to `localStorage` under `clicky-ui-theme` / `clicky-ui-density`. Add this inline script to `<head>` to avoid FOUC:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("clicky-ui-theme") || "system";
      var d = localStorage.getItem("clicky-ui-density") || "comfortable";
      var resolved =
        t === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : t;
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-density", d);
    } catch (_) {}
  })();
</script>
```

## License

Apache-2.0
