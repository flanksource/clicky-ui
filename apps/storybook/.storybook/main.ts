import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-docs",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    defaultName: "Docs",
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: "../../packages/ui/tsconfig.json",
      include: ["../../packages/ui/src/**/*.tsx"],
      shouldExtractLiteralValuesFromEnum: true,
    },
  },
  viteFinal: async (viteConfig) => {
    if (process.env.STORYBOOK_BASE_PATH) {
      viteConfig.base = process.env.STORYBOOK_BASE_PATH;
    }
    // Force a single React instance across the storybook app and the linked
    // packages/ui source it renders (their react resolves via different
    // node_modules paths in the pnpm workspace) — otherwise stories hit
    // "Invalid hook call / more than one copy of React" in browser tests.
    viteConfig.resolve ??= {};
    viteConfig.resolve.dedupe = [
      ...(viteConfig.resolve.dedupe ?? []),
      "react",
      "react-dom",
    ];
    // Pre-bundle every dependency the stories pull in transitively through
    // packages/ui. On a cold cache (CI) Vite's browser-mode optimizer otherwise
    // discovers them only after the tests start, re-optimizes once and reloads
    // the page — whichever stories are mid-import then fail with "Vite
    // unexpectedly reloaded a test" / unresolved `storybook/test`. Pre-bundling
    // them in the initial pass removes the reload. They live under packages/ui
    // (a workspace dep) so they aren't resolvable as bare specifiers from this
    // app's root; the `@flanksource/clicky-ui > dep` form resolves each through
    // the workspace package. Keep in sync with packages/ui's deps — a newly
    // imported one fails loudly in CI (the reload returns) and just needs adding.
    viteConfig.optimizeDeps ??= {};
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include ?? []),
      "storybook/test",
      "@storybook/react-vite",
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@flanksource/clicky-ui > clsx",
      "@flanksource/clicky-ui > tailwind-merge",
      "@flanksource/clicky-ui > class-variance-authority",
      "@flanksource/clicky-ui > @radix-ui/react-slot",
      "@flanksource/clicky-ui > @floating-ui/react",
      "@flanksource/clicky-ui > @tanstack/react-query",
      "@flanksource/clicky-ui > dompurify",
      "@mdxeditor/editor",
      "@flanksource/clicky-ui > @flanksource/icons/mi",
      "@flanksource/clicky-ui > recharts",
      "@flanksource/clicky-ui > react-rnd",
      "@flanksource/clicky-ui > marked",
      "@flanksource/clicky-ui > streamdown",
      "@flanksource/clicky-ui > ai",
      "@flanksource/clicky-ui > @ai-sdk/react",
      "@flanksource/clicky-ui > shiki/core",
      "@flanksource/clicky-ui > shiki/engine/oniguruma",
      "@flanksource/clicky-ui > shiki/wasm",
      "@flanksource/clicky-ui > @shikijs/transformers",
      "@flanksource/clicky-ui > @shikijs/themes/github-light",
      "@flanksource/clicky-ui > @shikijs/themes/github-dark",
      "@flanksource/clicky-ui > @shikijs/langs/java",
      "@flanksource/clicky-ui > @shikijs/langs/go",
      "@flanksource/clicky-ui > @shikijs/langs/python",
      "@flanksource/clicky-ui > @shikijs/langs/javascript",
      "@flanksource/clicky-ui > @shikijs/langs/typescript",
      "@flanksource/clicky-ui > @shikijs/langs/tsx",
      "@flanksource/clicky-ui > @shikijs/langs/jsx",
      "@flanksource/clicky-ui > @shikijs/langs/json",
      "@flanksource/clicky-ui > @shikijs/langs/yaml",
      "@flanksource/clicky-ui > @shikijs/langs/bash",
      "@flanksource/clicky-ui > @shikijs/langs/sql",
      "@flanksource/clicky-ui > @shikijs/langs/xml",
      "@flanksource/clicky-ui > @shikijs/langs/html",
      "@flanksource/clicky-ui > @shikijs/langs/css",
    ];
    return viteConfig;
  },
};

export default config;
