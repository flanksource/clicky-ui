import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker, type DatePickerProps } from "./DatePicker";

function DatePickerControlled({ value: initial, ...args }: DatePickerProps) {
  const [value, setValue] = useState(initial ?? "");
  return (
    <div className="max-w-xs space-y-3">
      <DatePicker {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={value || "empty"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  render: (args) => <DatePickerControlled {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Native `<input type=\"date\">` with a hidden default indicator and a custom calendar button that calls `showPicker()`. Controlled via an ISO `YYYY-MM-DD` string. For a unified date/datetime API prefer `DateField`.",
      },
    },
  },
  argTypes: {
    value: { control: "text", description: "Controlled ISO date string (YYYY-MM-DD)." },
    openButtonLabel: { control: "text", description: "Accessible label for the calendar button." },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
  args: {
    value: "2026-06-16",
    openButtonLabel: "Open date picker",
    disabled: false,
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { value: "" } };

export const Disabled: Story = { args: { disabled: true } };
