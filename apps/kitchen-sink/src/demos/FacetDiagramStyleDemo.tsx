import { useState, type CSSProperties } from "react";
import { SegmentedControl, Select } from "@flanksource/clicky-ui";
import {
  BOX_STYLES,
  BoxNode,
  ContainerNode,
  DENSITIES,
  DEFAULT_NODE_PALETTE,
  DiagramStyleProvider,
  PLACEMENTS,
  type Density,
  type DiagramPlacement,
  type NodePalette,
} from "@flanksource/facet";
import { DemoRow, DemoSection } from "./Section";

// Three sample themes. `role` is facet's default palette; the others show a
// dark and a warm palette driving every node that does not set its own.
const THEMES: Record<string, { label: string; palette?: NodePalette; canvas: CSSProperties }> = {
  role: { label: "Role (default)", canvas: { backgroundColor: "#ffffff" } },
  night: {
    label: "Night",
    palette: {
      accent: "#a78bfa", tint: "#151b33", containerTint: "#0b1023", border: "#2a3354", surface: "#151b33",
      panel: "#151b33", panelBorder: "#2a3354", text: "#f8fafc", muted: "#94a3b8", onAccent: "#0b1023", dark: "#f8fafc", onDark: "#0b1023",
    },
    canvas: { backgroundColor: "#0b1023" },
  },
  warm: {
    label: "Warm",
    palette: {
      accent: "#f25533", tint: "#fbe0da", containerTint: "#f5f1ea", border: "#e8e1d5", surface: "#ffffff",
      panel: "#f3efe8", panelBorder: "#e8e1d5", text: "#1c1917", muted: "#78716c", onAccent: "#ffffff", dark: "#1c1917", onDark: "#ffffff",
    },
    canvas: { backgroundColor: "#f5f1ea" },
  },
};
type ThemeId = keyof typeof THEMES;

export function FacetDiagramStyleDemo() {
  const [themeId, setThemeId] = useState<ThemeId>("role");
  const [density, setDensity] = useState<Density>("comfortable");
  const [placement, setPlacement] = useState<DiagramPlacement>("bands");
  const theme = THEMES[themeId];
  if (!theme) throw new Error(`Unknown diagram theme: ${themeId}`);

  return (
    <DemoSection
      id="facet-diagram-style"
      title="Facet diagram style"
      description="DiagramStyleProvider sets the palette, density and layout/… placement for every facet BoxNode and ContainerNode beneath it. A palette, density, compact or variant prop on a node always wins."
    >
      <DemoRow label="Theme">
        <div className="w-44">
          <Select
            aria-label="Diagram theme"
            value={themeId}
            options={Object.entries(THEMES).map(([value, { label }]) => ({ value, label }))}
            onChange={(event) => setThemeId(event.target.value)}
          />
        </div>
      </DemoRow>
      <DemoRow label="Density">
        <SegmentedControl<Density>
          aria-label="Diagram density"
          size="sm"
          value={density}
          onChange={setDensity}
          options={DENSITIES.map((id) => ({ id, label: id }))}
        />
      </DemoRow>
      <DemoRow label="Placement">
        <div className="w-44">
          <Select
            aria-label="Diagram placement"
            value={placement}
            options={PLACEMENTS.map((value) => ({ value, label: `layout/${value}` }))}
            onChange={(event) => setPlacement(event.target.value as DiagramPlacement)}
          />
        </div>
      </DemoRow>

      <DiagramStyleProvider {...(theme.palette ? { palette: theme.palette } : {})} density={density}>
        <div className="space-y-4 rounded-md border border-border p-4" style={theme.canvas}>
          <DemoRow label="Inherit vs override">
            <BoxNode id="demo-inherit" title="Inherits" description="Theme and density" shadow="shadow-none" />
            <BoxNode id="demo-compact" title="compact prop" description="Always compact" compact shadow="shadow-none" />
            <BoxNode id="demo-palette" title="palette prop" description="Always default colours" palette={DEFAULT_NODE_PALETTE} shadow="shadow-none" />
          </DemoRow>

          <DemoRow label="Box styles">
            {BOX_STYLES.map((variant) => (
              <BoxNode key={variant} variant={variant} title={variant} shadow="shadow-none" />
            ))}
          </DemoRow>

          <DemoRow label="Placed group">
            <DiagramStyleProvider placement={placement}>
              <ContainerNode id="demo-group" title="Control plane" description={`layout/${placement}`}>
                {["API", "Worker", "Store"].map((title) => (
                  <BoxNode key={title} title={title} shadow="shadow-none" />
                ))}
              </ContainerNode>
            </DiagramStyleProvider>
          </DemoRow>
        </div>
      </DiagramStyleProvider>
    </DemoSection>
  );
}
