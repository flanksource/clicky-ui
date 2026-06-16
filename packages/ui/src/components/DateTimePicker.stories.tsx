import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateTimePicker, type DateTimePickerProps } from "./DateTimePicker";

function DateTimePickerControlled({ value: initial, ...args }: DateTimePickerProps) {
  const [value, setValue] = useState(initial ?? "");
  return (
    <div className="max-w-xs space-y-3">
      <DateTimePicker {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={value || "empty"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  render: (args) => <DateTimePickerControlled {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Text input paired with a hidden `datetime-local` picker, so it accepts both absolute timestamps (`2026-06-16T09:30`) and relative expressions (`now-1h`) while still offering a native calendar via the button. Controlled by string. For a unified API prefer `DateField` with `mode=\"datetime\"`.",
      },
    },
  },
  argTypes: {
    value: { control: "text", description: "Absolute (YYYY-MM-DDTHH:mm) or relative (now-1h) string." },
    openButtonLabel: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { control: false },
    prefix: { control: false },
    suffix: { control: false },
  },
  args: {
    value: "2026-06-16T09:30",
    openButtonLabel: "Open time picker",
    disabled: false,
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Relative: Story = { args: { value: "now-1h" } };

export const Disabled: Story = { args: { disabled: true } };
