import type { ReactNode } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  BOX_STYLES,
  BoxNode,
  CONTAINER_STYLES,
  ContainerNode,
  DENSITIES,
  DENSITY_TOKENS,
  DEFAULT_NODE_PALETTE,
  DiagramStyleProvider,
  PLACEMENTS,
  PLACEMENT_SHAPES,
  type BoxStyle,
  type ContainerStyle,
  type Density,
  type DiagramPlacement,
  type PortPosition,
} from "@flanksource/facet";
import { THEMES, THEME_IDS, type StoryTheme, type ThemeId } from "./themes.ts";

// Theme and density are story controls. Their "toolbar" option follows the
// Storybook toolbar: Density maps one-to-one and the Dark theme picks night.

type StyleArgs = { theme: "toolbar" | ThemeId; density: "toolbar" | Density };

function resolveStyle(args: Partial<StyleArgs>, globals: Record<string, unknown>) {
  const themeId: ThemeId = !args.theme || args.theme === "toolbar" ? (globals.theme === "dark" ? "night" : "role") : args.theme;
  const density: Density = !args.density || args.density === "toolbar" ? ((globals.density ?? "comfortable") as Density) : args.density;
  return { theme: THEMES[themeId] as StoryTheme, density };
}

function ThemeCanvas({ theme, children }: { theme: StoryTheme; children: ReactNode }) {
  return (
    <DiagramStyleProvider {...(theme.palette ? { palette: theme.palette } : {})}>
      <div className="rounded-md p-4" style={theme.canvas}>
        {children}
      </div>
    </DiagramStyleProvider>
  );
}

const withDiagramStyle: Decorator = (Story, ctx) => {
  const { theme, density } = resolveStyle(ctx.args as Partial<StyleArgs>, ctx.globals);
  return (
    <DiagramStyleProvider density={density}>
      <ThemeCanvas theme={theme}>
        <Story />
      </ThemeCanvas>
    </DiagramStyleProvider>
  );
};

const meta = {
  title: "Facet Diagrams/Diagram style",
  decorators: [withDiagramStyle],
  args: { theme: "toolbar", density: "toolbar" },
  argTypes: {
    theme: { control: "select", options: ["toolbar", ...THEME_IDS], description: "Palette for every node below the provider; `toolbar` follows Light/Dark.", table: { category: "Diagram style" } },
    density: { control: "inline-radio", options: ["toolbar", ...DENSITIES], description: "Provider density; `toolbar` follows the Density toolbar.", table: { category: "Diagram style" } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "facet's `DiagramStyleProvider` sets the palette, density and `layout/…` placement for every `BoxNode` and `ContainerNode` beneath it. Use the **theme** and **density** controls (or leave them on `toolbar`). A `palette`, `density`, `compact` or `variant` prop on a node always wins. The two playgrounds expose every node prop as a control.",
      },
    },
  },
} satisfies Meta<StyleArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const MEMBERS = ["API", "Worker", "Store", "Scheduler", "Cache", "Queue"];
const headerOf = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`#${id} > div`);

// Box playground

const PORT_POSITIONS: PortPosition[] = ["top-middle", "bottom-middle", "left-middle", "right-middle", "top-right", "bottom-left"];
type BoxArgs = StyleArgs & {
  variant: BoxStyle;
  title: string;
  description: string;
  footer: string;
  body: string;
  icon: boolean;
  dashed: boolean;
  compact: boolean;
  nodeDensity: "inherit" | Density;
  shadow: "shadow-none" | "shadow-sm" | "shadow-lg";
  minWidth: string;
  port: "none" | PortPosition;
};

/** Every BoxNode prop as a control. `nodeDensity` and `compact` override the provider density. */
export const BoxPlayground: StoryObj<Meta<BoxArgs>> = {
  args: {
    variant: "header", title: "Run API", description: "Validates requests", footer: "", body: "",
    icon: false, dashed: false, compact: false, nodeDensity: "inherit", shadow: "shadow-none", minWidth: "160px", port: "none",
  },
  argTypes: {
    variant: { control: "select", options: BOX_STYLES, table: { category: "BoxNode" } },
    title: { control: "text", table: { category: "BoxNode" } },
    description: { control: "text", table: { category: "BoxNode" } },
    body: { control: "text", description: "Children rendered in the body", table: { category: "BoxNode" } },
    footer: { control: "text", table: { category: "BoxNode" } },
    icon: { control: "boolean", table: { category: "BoxNode" } },
    dashed: { control: "boolean", table: { category: "BoxNode" } },
    compact: { control: "boolean", description: "Shorthand for density=\"compact\"", table: { category: "BoxNode" } },
    nodeDensity: { control: "inline-radio", options: ["inherit", ...DENSITIES], description: "The node's own `density` prop", table: { category: "BoxNode" } },
    shadow: { control: "inline-radio", options: ["shadow-none", "shadow-sm", "shadow-lg"], table: { category: "BoxNode" } },
    minWidth: { control: "text", table: { category: "BoxNode" } },
    port: { control: "select", options: ["none", ...PORT_POSITIONS], description: "One docked port chip", table: { category: "BoxNode" } },
  },
  render: (args) => (
    <div className="flex items-start">
    <BoxNode
      id="playground-box"
      variant={args.variant}
      title={args.title}
      shadow={args.shadow}
      minWidth={args.minWidth}
      dashed={args.dashed}
      compact={args.compact}
      {...(args.nodeDensity !== "inherit" ? { density: args.nodeDensity } : {})}
      {...(args.description ? { description: args.description } : {})}
      {...(args.footer ? { footer: args.footer } : {})}
      {...(args.icon ? { icon: <span aria-hidden className="inline-block h-4 w-4 rounded-sm bg-current opacity-60" /> } : {})}
      {...(args.port !== "none" ? { ports: [{ id: "playground-port", position: args.port, label: "JSON" }] } : {})}
    >
      {args.body || undefined}
    </BoxNode>
    </div>
  ),
  play: async ({ args, canvasElement, globals }) => {
    const { density } = resolveStyle(args, globals);
    const expected = args.nodeDensity !== "inherit" ? args.nodeDensity : args.compact ? "compact" : density;
    await expect({
      variant: canvasElement.querySelector("#playground-box")?.getAttribute("data-box-style"),
      padding: headerOf(canvasElement, "playground-box")?.style.padding,
    }).toEqual({ variant: args.variant, padding: DENSITY_TOKENS[expected].header });
  },
};

// Container playground

type ContainerArgs = StyleArgs & {
  variant: "from placement" | ContainerStyle;
  placement: "none" | DiagramPlacement;
  title: string;
  description: string;
  tag: string;
  footer: string;
  members: number;
  memberVariant: "inherit" | BoxStyle;
  nodeDensity: "inherit" | Density;
  minWidth: string;
};

/** Every ContainerNode prop as a control, with its members. Set `variant` to "from placement" to let the placement choose the style and direction. */
export const ContainerPlayground: StoryObj<Meta<ContainerArgs>> = {
  args: {
    variant: "zone", placement: "none", title: "Control plane", description: "Decides and records", tag: "", footer: "",
    members: 3, memberVariant: "outlined", nodeDensity: "inherit", minWidth: "",
  },
  argTypes: {
    variant: { control: "select", options: ["from placement", ...CONTAINER_STYLES], table: { category: "ContainerNode" } },
    placement: { control: "select", options: ["none", ...PLACEMENTS], description: "Wraps the container in a DiagramStyleProvider placement", table: { category: "ContainerNode" } },
    title: { control: "text", table: { category: "ContainerNode" } },
    description: { control: "text", table: { category: "ContainerNode" } },
    tag: { control: "text", description: "Label sitting on the top edge", table: { category: "ContainerNode" } },
    footer: { control: "text", table: { category: "ContainerNode" } },
    nodeDensity: { control: "inline-radio", options: ["inherit", ...DENSITIES], description: "The container's own `density` prop", table: { category: "ContainerNode" } },
    minWidth: { control: "text", table: { category: "ContainerNode" } },
    members: { control: { type: "range", min: 0, max: MEMBERS.length, step: 1 }, table: { category: "Members" } },
    memberVariant: { control: "select", options: ["inherit", ...BOX_STYLES], description: "`inherit` lets the placement pick the box style", table: { category: "Members" } },
  },
  render: (args) => {
    const container = (
      <ContainerNode
        id="playground-container"
        {...(args.variant !== "from placement" ? { variant: args.variant } : {})}
        {...(args.nodeDensity !== "inherit" ? { density: args.nodeDensity } : {})}
        {...(args.title ? { title: args.title } : {})}
        {...(args.description ? { description: args.description } : {})}
        {...(args.tag ? { tag: args.tag } : {})}
        {...(args.footer ? { footer: args.footer } : {})}
        {...(args.minWidth ? { minWidth: args.minWidth } : {})}
      >
        {MEMBERS.slice(0, args.members).map((title) => (
          <BoxNode key={title} title={title} shadow="shadow-none" {...(args.memberVariant !== "inherit" ? { variant: args.memberVariant } : {})} />
        ))}
      </ContainerNode>
    );
    return (
      <div className="flex items-start">
        {args.placement === "none" ? container : <DiagramStyleProvider placement={args.placement}>{container}</DiagramStyleProvider>}
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const group = canvasElement.querySelector("#playground-container");
    const fromPlacement = args.placement === "none" ? "zone" : PLACEMENT_SHAPES[args.placement].container;
    await expect({
      variant: group?.getAttribute("data-container-style"),
      members: group?.querySelectorAll("[data-box-style]").length,
    }).toEqual({ variant: args.variant === "from placement" ? fromPlacement : args.variant, members: args.members });
  },
};

// Catalogues

/** Every box style, inheriting palette and density. */
export const BoxStyles: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {BOX_STYLES.map((variant) => (
        <BoxNode key={variant} variant={variant} title={variant} description="Validates requests" shadow="shadow-none" />
      ))}
    </div>
  ),
};

/** Every container style with the same two members. */
export const Containers: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      {CONTAINER_STYLES.map((variant) => (
        <ContainerNode key={variant} variant={variant} title={variant} {...(variant === "boundary" ? { tag: "Private network" } : {})}>
          {MEMBERS.slice(0, 2).map((title) => <BoxNode key={title} variant="outlined" title={title} shadow="shadow-none" />)}
        </ContainerNode>
      ))}
    </div>
  ),
};

type PlacementArgs = StyleArgs & { placement: DiagramPlacement };

/** One group under the selected placement: the container style, direction and member boxes come from PLACEMENT_SHAPES. */
export const Placement: StoryObj<Meta<PlacementArgs>> = {
  args: { placement: "bands" },
  argTypes: { placement: { control: "select", options: PLACEMENTS } },
  render: ({ placement }) => (
    <DiagramStyleProvider placement={placement}>
      <ContainerNode id="placed-group" title="Control plane" description={`layout/${placement}`}>
        {MEMBERS.slice(0, 3).map((title) => <BoxNode key={title} title={title} shadow="shadow-none" />)}
      </ContainerNode>
    </DiagramStyleProvider>
  ),
  play: async ({ args, canvasElement }) => {
    const group = canvasElement.querySelector("#placed-group");
    const shape = PLACEMENT_SHAPES[args.placement];
    await expect({
      container: group?.getAttribute("data-container-style"),
      orientation: group?.getAttribute("data-orientation"),
      box: group?.querySelector("[data-box-style]")?.getAttribute("data-box-style"),
    }).toEqual({ container: shape.container, orientation: shape.orientation, box: shape.box });
  },
};

/** All 18 placements side by side. */
export const AllPlacements: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      {PLACEMENTS.map((placement) => (
        <DiagramStyleProvider key={placement} placement={placement}>
          <ContainerNode title={`layout/${placement}`}>
            {MEMBERS.slice(0, 3).map((title) => <BoxNode key={title} title={title} shadow="shadow-none" />)}
          </ContainerNode>
        </DiagramStyleProvider>
      ))}
    </div>
  ),
};

// The browser's normalized form of a CSS colour, so hex palettes compare with computed inline styles.
const cssColor = (value: string) => {
  const probe = document.createElement("span");
  probe.style.color = value;
  return probe.style.color;
};

/** Every theme/… palette on the same boxes and container. The theme control is ignored here; density still applies. */
export const Themes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {THEME_IDS.map((id) => (
        <div key={id} id={`theme-${id}`}>
          <ThemeCanvas theme={THEMES[id]}>
            <div className="mb-2 font-mono text-xs" style={{ color: (THEMES[id].palette ?? DEFAULT_NODE_PALETTE).muted }}>theme/{id}</div>
            <div className="flex flex-wrap items-start gap-3">
              <BoxNode id={`theme-${id}-header`} variant="header" title="header" description="Validates" shadow="shadow-none" />
              <BoxNode id={`theme-${id}-tinted`} variant="tinted" title="tinted" description="Validates" shadow="shadow-none" />
              <BoxNode id={`theme-${id}-outlined`} variant="outlined" title="outlined" description="Validates" shadow="shadow-none" />
              <BoxNode id={`theme-${id}-chip-dark`} variant="chip-dark" title="chip-dark" shadow="shadow-none" />
              <ContainerNode id={`theme-${id}-panel`} variant="panel" title="panel">
                <BoxNode variant="card" title="card" shadow="shadow-none" />
              </ContainerNode>
            </div>
          </ThemeCanvas>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const style = (id: string, child = false) => {
      const el = canvasElement.querySelector<HTMLElement>(`#${id}`);
      return (child ? el?.querySelector<HTMLElement>(":scope > div") : el)?.style;
    };
    const rendered = THEME_IDS.map((id) => ({
      theme: id,
      header: style(`theme-${id}-header`, true)?.backgroundColor,
      tinted: style(`theme-${id}-tinted`)?.backgroundColor,
      outlined: [style(`theme-${id}-outlined`)?.borderColor, style(`theme-${id}-outlined`)?.color],
      chipDark: [style(`theme-${id}-chip-dark`)?.backgroundColor, style(`theme-${id}-chip-dark`)?.color],
      panel: [style(`theme-${id}-panel`)?.backgroundColor, style(`theme-${id}-panel`)?.borderColor],
    }));
    const expected = THEME_IDS.map((id) => {
      const p = (THEMES[id] as StoryTheme).palette ?? DEFAULT_NODE_PALETTE;
      return {
        theme: id,
        header: cssColor(p.accent),
        tinted: cssColor(p.tint),
        outlined: [cssColor(p.border), cssColor(p.text)],
        chipDark: [cssColor(p.dark), cssColor(p.onDark)],
        panel: [cssColor(p.panel), cssColor(p.panelBorder)],
      };
    });
    await expect(rendered).toEqual(expected);
  },
};

/** Props beat the provider: the compact and palette boxes ignore the theme and density controls. */
export const Overrides: Story = {
  args: { theme: "night", density: "spacious" },
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <BoxNode id="override-inherit" title="Inherits" description="Theme and density controls" shadow="shadow-none" />
      <BoxNode id="override-compact" title="compact prop" description="Always compact" compact shadow="shadow-none" />
      <BoxNode id="override-palette" title="palette prop" description="Always default colours" palette={DEFAULT_NODE_PALETTE} shadow="shadow-none" />
    </div>
  ),
  play: async ({ args, canvasElement, globals }) => {
    within(canvasElement).getByText("Inherits");
    const { density } = resolveStyle(args, globals);
    await expect([headerOf(canvasElement, "override-inherit")?.style.padding, headerOf(canvasElement, "override-compact")?.style.padding]).toEqual([
      DENSITY_TOKENS[density].header,
      DENSITY_TOKENS.compact.header,
    ]);
  },
};
