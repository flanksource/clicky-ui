---
title: Getting started
description: Install and configure Clicky UI in a React application.
---

## Install

```sh
pnpm add @flanksource/clicky-ui react react-dom tailwindcss
```

Import the library stylesheet once at the application root, then prefer the smallest public subpath for each component:

```tsx
import { Button } from "@flanksource/clicky-ui/components";
import { ThemeProvider, DensityProvider } from "@flanksource/clicky-ui/hooks";
import "@flanksource/clicky-ui/styles.css";

export function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <Button variant="default">Continue</Button>
      </DensityProvider>
    </ThemeProvider>
  );
}
```

## Package entry points

| Import                              | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `@flanksource/clicky-ui/components` | Inputs, forms, pickers, menus, layout, and overlays         |
| `@flanksource/clicky-ui/data`       | Tables, cards, trees, code, markdown, and data-detail views |
| `@flanksource/clicky-ui/hooks`      | Theme, density, and shared hooks                            |
| `@flanksource/clicky-ui/icons`      | Offline component icon exports                              |
| `@flanksource/clicky-ui/rpc`        | OpenAPI operation and entity explorer surfaces              |
| `@flanksource/clicky-ui/chat`       | Chat and session UI                                         |
| `@flanksource/clicky-ui/ai`         | AI runtime and prompt controls                              |
| `@flanksource/clicky-ui/jotai`      | Atom-backed adapters for controlled components              |

The root package barrel remains available for compatibility, but subpath imports keep the consumer's entry surface explicit.

## Markdown fields

The rich markdown form field is lazy-loaded and its CSS is intentionally separate. Applications that use `format: "md"` must add:

```tsx
import "@flanksource/clicky-ui/mdx-editor.css";
```

The editor also requires the optional `@mdxeditor/editor` peer dependency.
