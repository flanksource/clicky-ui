import { useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
import {
  ThemeProvider,
  DensityProvider,
  useTheme,
  useDensity,
  type Theme,
  type Density,
} from "@flanksource/clicky-ui";
import "@flanksource/clicky-ui/styles.css";
import "./preview.css";

function GlobalSync({ theme, density }: { theme: Theme; density: Density }) {
  const { setTheme } = useTheme();
  const { setDensity } = useDensity();
  useEffect(() => setTheme(theme), [theme, setTheme]);
  useEffect(() => setDensity(density), [density, setDensity]);
  return null;
}

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: { disabled: true },
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
