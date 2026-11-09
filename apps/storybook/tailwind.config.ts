import type { Config } from "tailwindcss";
import preset from "@flanksource/clicky-ui/tailwind-preset";
import { facetSrc } from "./.storybook/facet-source.ts";

const config: Config = {
  presets: [preset as Config],
  content: [
    "./.storybook/**/*.{ts,tsx,mdx}",
    "./src/**/*.{ts,tsx,mdx}",
    "./stories/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx,mdx}",
    // facet's BoxNode/ContainerNode style themselves with Tailwind classes.
    "./node_modules/@flanksource/facet/dist/components/diagram/**/*.js",
    ...(facetSrc ? [`${facetSrc}/diagram/**/*.tsx`] : []),
  ],
};

export default config;
