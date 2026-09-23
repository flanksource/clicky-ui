# @flanksource/clicky-ui

Flanksource's React component library built on [shadcn/ui](https://ui.shadcn.com/) with light/dark theming and density presets.

## Install

```bash
pnpm add @flanksource/clicky-ui @tanstack/react-query react react-dom tailwindcss
npm install @flanksource/clicky-ui @tanstack/react-query react react-dom tailwindcss
yarn add @flanksource/clicky-ui @tanstack/react-query react react-dom tailwindcss
bun add @flanksource/clicky-ui @tanstack/react-query react react-dom tailwindcss
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

## Timeseries widgets and WorkloadCard

`TimeseriesPanel`, `TimeseriesGauge`, `TimeseriesCoreBars` and `WorkloadCard` (from `@flanksource/clicky-ui/data`) poll their series with `@tanstack/react-query`, so they **must render under the host application's `QueryClientProvider`**. React Query v5 is a required peer dependency, ensuring clicky-ui and its host use the same Query Client context rather than installing isolated copies.

Each series is either URL-backed (`baseUrl + id`, loaded through `fetcher(url)`) or function-backed via `load`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkloadCard } from "@flanksource/clicky-ui/data";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <WorkloadCard
    workload={{
      type: "EC2 instance",
      name: "build-runner-1",
      status: { label: "running", health: "healthy" },
      metadata: [{ label: "region", value: "us-east-1" }],
    }}
    metrics={{
      cpu: {
        value: {
          id: "i-0a1b2c3d.cpu", // cache identity: unique per data source
          load: ({ range, signal }) =>
            api.instanceCpu("i-0a1b2c3d", { range, signal }),
        },
        max: 4000,
      },
    }}
  />
</QueryClientProvider>;
```

A `load`-backed series is cached under `["timeseries", "load", id, range]`: **the `id` is the cache identity**, so two series that share an id share one cached response. The loader receives the widget's `range` and react-query's `AbortSignal`, which aborts when the query is cancelled (for example on unmount). URL-backed series keep their `["timeseries", requestUrl]` key. See the [timeseries guide](../../apps/docs/src/content/docs/guides/timeseries.md) for details.

## Markdown editor field

`JsonSchemaForm` fields with `format: md` — and the standalone `MdxEditorField` exported from `@flanksource/clicky-ui/mdx-editor` — render an [MDXEditor](https://mdxeditor.dev/)-backed rich-text field. Its base styles ship as a **separate** stylesheet so apps that don't use the field don't pay its weight (the editor's JavaScript is also loaded lazily, on first render). Import it once at the app root, in addition to `styles.css`:

```tsx
import "@flanksource/clicky-ui/styles.css";
import "@flanksource/clicky-ui/mdx-editor.css"; // only if you render the markdown field
```

Without this import the field renders, but its toolbar and content are unstyled.

## Bundle size guidance

Prefer subpath imports in production apps:

```tsx
import { Button } from "@flanksource/clicky-ui/components";
import { cn } from "@flanksource/clicky-ui/utils";
import { DataTable } from "@flanksource/clicky-ui/data";
```

The root `@flanksource/clicky-ui` barrel remains supported for compatibility and convenience, but subpaths give bundlers a smaller entry surface. Import `@flanksource/clicky-ui/styles.css` once at the app root. Markdown parsing and code highlighting are loaded asynchronously by their components.

The published package uses plain semver dependency ranges and does not require pnpm workspace or catalog protocols. The package ships ESM and CommonJS entrypoints for the public subpaths above.

## Expression language support

Import gomplate-compatible Monaco language support from `@flanksource/clicky-ui/expressions`, or the optional React playground from `@flanksource/clicky-ui/expressions/playground`. The language entry registers CEL, Go templates, JSONPath, and templates embedded in YAML, JSON, or text without importing the playground UI. See [the expressions guide](./docs/expressions.md).

UI subpaths that render icons are intended for browser bundlers such as Vite, Rollup, Webpack, Rspack, and Bun's bundler. The Iconify React packages expose `.jsx` modules and CSS imports, so plain Node `import`/`require` of icon-heavy subpaths is not a supported verification target.

### IntelliJ icon catalog

Import the offline components from `@flanksource/clicky-ui/icons`:

```tsx
import {
  UiBreakpoint,
  UiMessageQueue,
  UiSqlPrimaryKey,
} from "@flanksource/clicky-ui/icons";
```

The `jb-site:` entries in `icons/icon-selections.json` resolve against the [IntelliJ icon catalog](https://intellij-icons.jetbrains.design/data.json). Run `pnpm --filter @flanksource/clicky-ui download:icons` after changing selections, then `pnpm --filter @flanksource/clicky-ui build:icons:force`. The downloader checks each catalog path and requires an Apache 2.0 header in every downloaded SVG. It stores URL-fetched sources from JetBrains, Iconify, and other providers under `icons/svg/remote`; generated React components are built from those local files. The per-component source list is in `NOTICE.md`.

Downloaded IntelliJ icon ZIPs can be imported with `pnpm --filter @flanksource/clicky-ui exec tsx scripts/import-jetbrains-zips.ts <download-dir> <since-ISO> --licensed-only`. The command extracts each light/dark pair into `icons/svg/downloaded`, adds `programming` selections, and writes `icons/jetbrains-download-audit.json` for the processed archives. Use `--include-without-header` instead to explicitly include pairs without an embedded Apache header. Those pairs use `jb-download-unverified:` source IDs and appear in the audit's `withoutHeader` list; their license is not verified by the import. Both SVG directories are offline build inputs; `remote` distinguishes URL-fetched artwork from ZIP-extracted artwork. Rebuild with `build:icons:force` after importing. Each concept has a preferred `Ui<Concept>` icon and numbered alternatives such as `UiFunction1` and `UiFunction2`. Imported icons have matching `Dark` variants, while existing preferred components keep their artwork. `programmingIconCatalog` supplies typed concept, variation, color-role, and header-status metadata for palette pages.

Markdown and code highlighting use optional peer dependencies (`marked`, `shiki`, and `@shikijs/*`). Install them in applications that render those components.

## Tailwind preset

Tailwind CSS v4 consumers can load the preset through its compatibility directive:

```css
/* src/styles.css */
@config "../tailwind.config.ts";
@import "tailwindcss";
```

```ts
// tailwind.config.ts
import preset from "@flanksource/clicky-ui/tailwind-preset";

export default {
  presets: [preset],
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

## Lint rules

The package ships opt-in [oxlint](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
rules that keep consuming projects on clicky-ui's components, overlays, theming
and icons instead of rebuilding them by hand.

Install oxlint in the consuming project. If the project does not already depend
on `@flanksource/clicky-ui`, add that as the normal runtime dependency too:

```bash
pnpm add @flanksource/clicky-ui
pnpm add -D oxlint
```

Then enable the JS plugin in the consumer's `.oxlintrc.json`:

```json
{
  "jsPlugins": [
    {
      "name": "clicky-ui",
      "specifier": "@flanksource/clicky-ui/oxlint-plugins"
    }
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

Add a package script that runs oxlint over the consumer source:

```json
{
  "scripts": {
    "lint:clicky-ui": "oxlint -c .oxlintrc.json src --deny-warnings"
  }
}
```

The `specifier` form resolves through the package export. In a local sibling
checkout, or if the package export is not available to your toolchain, point the
plugin directly at the file instead:

```json
{
  "jsPlugins": [
    "./node_modules/@flanksource/clicky-ui/oxlint-plugins/clicky-ui.js"
  ]
}
```

The rules flag rebuilt primitives (`<button>`, `<table>`, …), ad-hoc dialogs and
arbitrary z-index, hand-rolled inline styles, hardcoded colors / raw theme
storage access, and icons imported from unapproved libraries or faked with
emoji. See [`oxlint-plugins/README.md`](./oxlint-plugins/README.md) for the full
guide.

## License

Apache-2.0
