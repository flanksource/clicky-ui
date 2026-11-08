# Page styles

`@flanksource/clicky-ui/page-styles` exports `pageStyles` and the same recipe as its default export. It references the published `styles.css` and `tailwind-preset`; it introduces no CSS.

The recipe separates what a page always loads from what a page compiles on demand.

- `base` lists the published precompiled stylesheets (`["@flanksource/clicky-ui/styles.css"]`). The runtime links them on every page, in library order, through its integrity-checked package route. They are immutable package files and are never rebuilt. The stylesheet carries its own theme, base, components and utilities layers, including the safelisted palette.
- `entry` holds only compiler inputs: `tailwindcss/theme.css` in `layer(theme)`, `tailwindcss/utilities.css` in `layer(utilities)` with `source(none)`, and `@config` for the preset. It must not `@import` anything from `base`. The runtime compiles it, and only for pages that opt in, so the generated CSS holds just the utilities those pages use.
- `theme` exposes the preset directive, `name` identifies the library, `layer` identifies its component placement, and `runtimeDependencies` lists the files the compiler fetches outside the JavaScript import graph.
- `extends` (optional, absent here) names managed libraries whose preset this library's preset extends. The runtime compiles only the most-derived recipe, since its preset already includes the others, and still links every library's `base`. A library that is extended always comes before its extender.
- `transform(css)` (optional, absent here) post-processes the generated CSS. The runtime applies every recipe's transform in library order.

A page opts in to runtime Tailwind by exporting `meta` from its module:

```tsx
export const meta = { tailwind: "dynamic" };
```

Any other value of `meta.tailwind` is an error. Pages without it are styled by the base links alone, and the compiler is never loaded.

Compose recipes with other library entries in library order under `@layer theme, base, facet, components, utilities;`. Supply Tailwind v4's `compile()` with a stylesheet loader for CSS imports and a module loader for `@config` and `@plugin`, resolved against each library's exact-version dependency closure. Build source candidates before mounting, then build new DOM candidates synchronously before paint.

```ts
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import pageStyles from '@flanksource/clicky-ui/page-styles';
import { compile } from 'tailwindcss';

const require = createRequire(import.meta.url);
const compiler = await compile(pageStyles.entry, {
  loadStylesheet: async (id, base) => ({ path: id, base, content: await readFile(require.resolve(id), 'utf8') }),
  loadModule: async (id, base) => ({ path: id, base, module: require(id) }),
});
const css = compiler.build(['bg-primary', 'p-density-4']);
console.log(css);
```

Run the example as an `.mts` file with `pnpm exec tsx example.mts` in a package that installs Clicky UI and Tailwind v4. The output holds only the utilities for the two candidates. Link `pageStyles.base` separately for the rest of the styles. `@flanksource/page-runtime` supplies browser loaders that use the frame's import map and integrity-checked service-worker package routes.
