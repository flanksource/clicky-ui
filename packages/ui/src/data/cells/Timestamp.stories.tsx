import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timestamp } from "./Timestamp";

const SAMPLE = "2026-06-02T09:30:00Z";

const meta = {
  title: "Data/Cells/Timestamp",
  component: Timestamp,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Formats any parseable timestamp value for table cells, with the full ISO time on hover. `format` selects the display style; unparseable values render an em dash. Note `relative` formats against the real current time, so its output changes over time.",
      },
    },
  },
  argTypes: {
    value: { control: "text" },
    format: {
      control: "inline-radio",
      options: ["relative", "time", "short", "iso"],
    },
    showTitleOnHover: { control: "boolean" },
  },
  args: { value: SAMPLE, format: "short", showTitleOnHover: true },
} satisfies Meta<typeof Timestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Formats: Story = {
  render: () => (
    <table className="text-sm">
      <tbody>
        {(["relative", "time", "short", "iso"] as const).map((f) => (
          <tr key={f}>
            <td className="pr-4 font-mono text-xs text-muted-foreground">{f}</td>
            <td>
              <Timestamp value={SAMPLE} format={f} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Invalid: Story = {
  args: { value: "not-a-date" },
};
