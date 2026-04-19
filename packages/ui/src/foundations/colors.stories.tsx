import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitcher } from "../components/theme-switcher";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    docs: {
      description: {
        component:
          "Semantic color tokens resolved through CSS custom properties. Swap themes via the switcher below — every swatch reads from `hsl(var(--token))`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

type Pair = { name: string; bg: string; fg: string; token: string };

const PAIRS: Pair[] = [
  { name: "Background / Foreground", bg: "bg-background", fg: "text-foreground", token: "--background / --foreground" },
  { name: "Primary", bg: "bg-primary", fg: "text-primary-foreground", token: "--primary" },
  { name: "Secondary", bg: "bg-secondary", fg: "text-secondary-foreground", token: "--secondary" },
  { name: "Muted", bg: "bg-muted", fg: "text-muted-foreground", token: "--muted" },
  { name: "Accent", bg: "bg-accent", fg: "text-accent-foreground", token: "--accent" },
  { name: "Destructive", bg: "bg-destructive", fg: "text-destructive-foreground", token: "--destructive" },
  { name: "Card", bg: "bg-card", fg: "text-card-foreground", token: "--card" },
  { name: "Popover", bg: "bg-popover", fg: "text-popover-foreground", token: "--popover" },
];

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-density-4">
      <ThemeSwitcher />
      <div className="grid grid-cols-1 gap-density-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAIRS.map(({ name, bg, fg, token }) => (
          <div
            key={name}
            className={`flex flex-col justify-between rounded-lg border border-border p-density-4 ${bg} ${fg}`}
          >
            <div className="text-sm font-semibold">{name}</div>
            <code className="mt-density-3 text-xs opacity-80">{token}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};

type Stroke = { name: string; cls: string };
const STROKES: Stroke[] = [
  { name: "border", cls: "border-border" },
  { name: "input", cls: "border-input" },
  { name: "ring", cls: "ring-2 ring-ring" },
];

export const Strokes: Story = {
  render: () => (
    <div className="flex flex-col gap-density-4">
      <ThemeSwitcher />
      <div className="grid grid-cols-1 gap-density-3 sm:grid-cols-3">
        {STROKES.map(({ name, cls }) => (
          <div key={name} className="flex flex-col gap-density-2">
            <div className={`h-16 rounded-md border bg-background ${cls}`} />
            <code className="text-xs text-muted-foreground">{name}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
