export interface PageStylesRecipe {
  name: string;
  layer: string;
  /** Published precompiled stylesheets, linked once per page and never rebuilt at runtime. */
  base: string[];
  /** Compiler inputs only. It must not import any `base` stylesheet. */
  entry: string;
  theme: string;
  runtimeDependencies: string[];
  /** Names of managed libraries whose preset this library's preset extends. */
  extends?: string[];
  transform?(css: string): string;
}

export const pageStyles: PageStylesRecipe = {
  name: "@flanksource/clicky-ui",
  layer: "components",
  base: ["@flanksource/clicky-ui/styles.css"],
  runtimeDependencies: ["@flanksource/clicky-ui/styles.css", "@flanksource/clicky-ui/tailwind-preset", "tailwindcss/theme.css", "tailwindcss/preflight.css", "tailwindcss/utilities.css"],
  entry: [
    '@import "tailwindcss/theme.css" layer(theme);',
    '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
    '@config "@flanksource/clicky-ui/tailwind-preset";',
  ].join("\n"),
  theme: '@config "@flanksource/clicky-ui/tailwind-preset";',
};
