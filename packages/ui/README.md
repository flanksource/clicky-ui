# @flanksource/clicky-ui

Flanksource's React component library built on [shadcn/ui](https://ui.shadcn.com/) with light/dark theming and density presets.

## Install

```bash
pnpm add @flanksource/clicky-ui react react-dom tailwindcss
```

## Usage

```tsx
import { Button, ThemeProvider, DensityProvider } from "@flanksource/clicky-ui";
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
