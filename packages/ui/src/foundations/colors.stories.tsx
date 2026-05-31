import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitcher } from "../components/theme-switcher";

type ColorsDemoProps = {
  showThemeSwitcher: boolean;
  showPalette: boolean;
  showStrokes: boolean;
  columns: "two" | "three" | "four";
  swatchHeight: "sm" | "md" | "lg";
};

function ColorsDemo({
  showThemeSwitcher,
  showPalette,
  showStrokes,
  columns,
  swatchHeight,
}: ColorsDemoProps) {
  const columnClass =
    columns === "four"
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === "three"
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";
  const heightClass =
    swatchHeight === "lg" ? "min-h-36" : swatchHeight === "md" ? "min-h-28" : "min-h-20";

  return (
    <div className="flex flex-col gap-density-4">
      {showThemeSwitcher && <ThemeSwitcher />}
      {showPalette && (
        <div className={`grid grid-cols-1 gap-density-3 ${columnClass}`}>
          {PAIRS.map(({ name, bg, fg, token }) => (
            <div
              key={name}
              className={`flex ${heightClass} flex-col justify-between rounded-lg border border-border p-density-4 ${bg} ${fg}`}
            >
              <div className="text-sm font-semibold">{name}</div>
              <code className="mt-density-3 text-xs opacity-80">{token}</code>
            </div>
          ))}
        </div>
      )}
      {showStrokes && (
        <div className="grid grid-cols-1 gap-density-3 sm:grid-cols-3">
          {STROKES.map(({ name, cls }) => (
            <div key={name} className="flex flex-col gap-density-2">
              <div className={`h-16 rounded-md border bg-background ${cls}`} />
              <code className="text-xs text-muted-foreground">{name}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ColorsDemo> = {
  title: "Foundations/Colors",
  component: ColorsDemo,
  args: {
    showThemeSwitcher: true,
    showPalette: true,
    showStrokes: false,
    columns: "three",
    swatchHeight: "md",
  },
  argTypes: {
    columns: {
      control: "inline-radio",
      options: ["two", "three", "four"],
    },
    swatchHeight: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
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
type Story = StoryObj<typeof ColorsDemo>;

type Pair = { name: string; bg: string; fg: string; token: string };

const PAIRS: Pair[] = [
  {
    name: "Background / Foreground",
    bg: "bg-background",
    fg: "text-foreground",
    token: "--background / --foreground",
  },
  { name: "Primary", bg: "bg-primary", fg: "text-primary-foreground", token: "--primary" },
  { name: "Secondary", bg: "bg-secondary", fg: "text-secondary-foreground", token: "--secondary" },
  { name: "Muted", bg: "bg-muted", fg: "text-muted-foreground", token: "--muted" },
  { name: "Accent", bg: "bg-accent", fg: "text-accent-foreground", token: "--accent" },
  {
    name: "Destructive",
    bg: "bg-destructive",
    fg: "text-destructive-foreground",
    token: "--destructive",
  },
  { name: "Card", bg: "bg-card", fg: "text-card-foreground", token: "--card" },
  { name: "Popover", bg: "bg-popover", fg: "text-popover-foreground", token: "--popover" },
];

export const Palette: Story = {
  args: {
    showPalette: true,
    showStrokes: false,
  },
};

type Stroke = { name: string; cls: string };
const STROKES: Stroke[] = [
  { name: "border", cls: "border-border" },
  { name: "input", cls: "border-input" },
  { name: "ring", cls: "ring-2 ring-ring" },
];

export const Strokes: Story = {
  args: {
    showPalette: false,
    showStrokes: true,
  },
};
