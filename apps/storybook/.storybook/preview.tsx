import { useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
// Import the providers from source (not the built package) so the decorator's
// ThemeProvider/DensityProvider share the exact module instance — and therefore
// the React Context — that the story components consume (they import the same
// hooks from "../hooks/..."). Importing from "@flanksource/clicky-ui" resolves to
// dist/, a second instance, which makes useTheme/useDensity throw "must be used
// inside <Provider>" inside the browser tests.
import {
  ThemeProvider,
  DensityProvider,
  useTheme,
  useDensity,
  type Theme,
  type Density,
} from "../../../packages/ui/src/hooks";
import "@flanksource/clicky-ui/styles.css";
// The MDXEditor-backed markdown field (JsonSchemaForm `format: md`) needs the
// editor's base CSS, shipped as a separate optional export so consumers who
// don't use the field don't pay its weight. The catalog renders it, so load it.
import "@flanksource/clicky-ui/mdx-editor.css";
import "./preview.css";

// react-rnd (used by ChatWindow's draggable frame) reads `process.env` in its
// drag logger; the browser has no `process`, so provide a minimal shim.
(globalThis as { process?: { env: Record<string, string> } }).process ??= { env: {} };

function GlobalSync({ theme, density }: { theme: Theme; density: Density }) {
  const { setTheme } = useTheme();
  const { setDensity } = useDensity();
  useEffect(() => setTheme(theme), [theme, setTheme]);
  useEffect(() => setDensity(density), [density, setDensity]);
  return null;
}

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    backgrounds: { disabled: true },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: "Theme",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Density",
      defaultValue: "comfortable",
      toolbar: {
        icon: "component",
        items: [
          { value: "compact", title: "Compact" },
          { value: "comfortable", title: "Comfortable" },
          { value: "spacious", title: "Spacious" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = (ctx.globals.theme ?? "light") as Theme;
      const density = (ctx.globals.density ?? "comfortable") as Density;
      return (
        <ThemeProvider defaultTheme={theme}>
          <DensityProvider defaultDensity={density}>
            <GlobalSync theme={theme} density={density} />
            <div className="min-h-[200px] bg-background p-density-4 text-foreground">
              <Story />
            </div>
          </DensityProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
