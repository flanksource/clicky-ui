import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateField } from "./DateField";

function DateFieldShowcase() {
  const [date, setDate] = useState("2026-05-05");
  const [timestamp, setTimestamp] = useState("2026-05-05T09:30");

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Date</span>
          <DateField aria-label="Business date" value={date} onChange={setDate} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Date and time</span>
          <DateField
            mode="datetime"
            aria-label="Started at"
            value={timestamp}
            onChange={setTimestamp}
            placeholder="now-1h"
          />
        </label>
      </div>
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        date={date || "empty"} timestamp={timestamp || "empty"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/DateField",
  component: DateField,
  render: () => <DateFieldShowcase />,
  args: {
    mode: "date",
    value: "2026-05-05",
    placeholder: "Select date",
    openButtonLabel: "Open calendar",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Single date or datetime input wrapper that keeps DatePicker and DateTimePicker behind one small API. Use it anywhere a form needs a controlled ISO-like date value.",
      },
    },
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
