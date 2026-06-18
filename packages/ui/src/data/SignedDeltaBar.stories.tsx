import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignedDeltaBar } from "./SignedDeltaBar";

const meta: Meta<typeof SignedDeltaBar> = {
  title: "Charts/SignedDeltaBar",
  component: SignedDeltaBar,
  args: {
    value: 12.4,
    max: 50,
    significant: true,
    positiveIsBad: false,
    height: "h-4",
  },
  argTypes: {
    value: { control: { type: "number", min: -250, max: 250, step: 0.1 } },
    max: { control: { type: "number", min: 1, max: 250, step: 1 } },
    significant: { control: "boolean" },
    positiveIsBad: { control: "boolean" },
    height: {
      control: "select",
      options: ["h-2", "h-3", "h-4", "h-5"],
    },
    format: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Centered, bidirectional bar for a signed delta. Grows right for positive and left for negative, clamped at ±max. Color encodes direction (good/bad) and the bar mutes when not significant. Use `positiveIsBad` to flip semantics (e.g. benchmark regressions).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignedDeltaBar>;

export const Positive: Story = {};

export const Negative: Story = {
  args: { value: -8.1 },
};

export const Zero: Story = {
  args: { value: 0 },
};

export const NotSignificant: Story = {
  args: { value: -3.2, significant: false },
};

export const Clamped: Story = {
  args: { value: 220, max: 50 },
};

export const BenchmarkSemantics: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      {[
        { label: "BenchParse", value: 14.2 },
        { label: "BenchEncode", value: -22.6 },
        { label: "BenchScan", value: 1.1, significant: false },
        { label: "BenchSort", value: -4.8 },
      ].map((row) => (
        <div key={row.label} className="flex items-center gap-3 text-xs">
          <span className="w-24 font-mono text-muted-foreground">
            {row.label}
          </span>
          <SignedDeltaBar
            value={row.value}
            positiveIsBad
            significant={row.significant ?? true}
          />
        </div>
      ))}
    </div>
  ),
};
