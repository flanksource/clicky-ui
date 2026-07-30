import { useEffect, type ComponentType } from "react";
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
// Same source-instance rule as the hooks above: register through the source
// icon-fallback singleton so the story components' <Icon> (which reads the same
// module) resolves runtime names.
import { setFallbackIconProvider } from "../../../packages/ui/src/data/icon-fallback";
import { providerIcon } from "../../../packages/ui/src/data/chat/provider-icons";
import * as UiIcons from "../../../packages/ui/src/icons";
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

// Resolve runtime icon names (`<Icon name>`, `x-enum-icons`, `x-input-*-icon`) to
// the generated `Ui*` glyphs so schema-driven stories show real icons instead of
// the dashed "?" placeholder. kebab-case name → `Ui<PascalCase>`.
const UI_ICONS = UiIcons as unknown as Record<string, ComponentType<{ className?: string }>>;
function pascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
setFallbackIconProvider(({ name, className }) => {
  if (!name) return null;
  // First the generated Ui* set, then AI provider brand marks (anthropic/openai/…)
  // so a schema's x-enum-icons can label model options by provider.
  const Glyph = UI_ICONS[`Ui${pascalCase(name)}`] ?? providerIcon(name);
  if (!Glyph) return null;
  return <Glyph {...(className ? { className } : {})} />;
});

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
      // Shell-shaped stories (`layout: "fullscreen"`) need a definite, viewport-
      // tall box: AppShell/Workspace/SplitPane are all `h-full`, which collapses
      // against an auto-height ancestor. `dvh` is viewport-relative rather than
      // parent-relative, so it gives the story a real height without requiring a
      // height chain through body/#storybook-root. The padding is dropped too —
      // an app shell should meet the viewport edge.
      // Docs view keeps the padded box: every canvas on an autodocs page would
      // otherwise be a full viewport tall.
      const fullscreen = ctx.parameters?.layout === "fullscreen" && ctx.viewMode === "story";
      return (
        <ThemeProvider defaultTheme={theme}>
          <DensityProvider defaultDensity={density}>
            <GlobalSync theme={theme} density={density} />
            <div
              className={
                fullscreen
                  // overflow-auto, not hidden: a fullscreen story whose content
                  // is taller than the viewport (SpecRuntimeEditor) must stay
                  // reachable rather than being clipped.
                  ? "h-dvh overflow-auto bg-background text-foreground"
                  : "min-h-[200px] bg-background p-density-4 text-foreground"
              }
            >
              <Story />
            </div>
          </DensityProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
