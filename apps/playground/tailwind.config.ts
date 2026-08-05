import type { Config } from "tailwindcss";
import preset from "@flanksource/clicky-ui/tailwind-preset";

/**
 * Playground pages are scratch artifacts, so the content globs are deliberately
 * wide: anything under `src/` plus the library source (which ships classes the
 * preset must still see).
 */
const config: Config = {
  presets: [preset as Config],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
