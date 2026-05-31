import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateField, type DateFieldProps } from "./DateField";

function DateFieldShowcase() {
  const [date, setDate] = useState("2026-05-05");
  const [timestamp, setTimestamp] = useState("2026-05-05T09:30");

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Date
          </span>
          <DateField
            aria-label="Business date"
            value={date}
            onChange={setDate}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Date and time
          </span>
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

function DateFieldPlayground({ value: initialValue, ...args }: DateFieldProps) {
  const [value, setValue] = useState(initialValue ?? "");

  return (
    <div className="max-w-sm space-y-3">
      <DateField {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={value || "empty"}
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
    disabled: false,
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["date", "datetime"],
      description:
        "`date` renders a native date input; `datetime` adds a time-of-day field.",
      table: { category: "Behavior", defaultValue: { summary: "date" } },
    },
    value: {
      control: "text",
      description:
        "Controlled ISO date (`2026-05-05`) or datetime-local (`2026-05-05T09:30`) string.",
      table: { category: "Value" },
    },
    placeholder: { control: "text", table: { category: "Appearance" } },
    openButtonLabel: {
      control: "text",
      description: "Accessible label for the calendar/open button.",
      table: { category: "Accessibility" },
    },
    disabled: { control: "boolean", table: { category: "Behavior" } },
    onChange: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Single date or datetime input that keeps `DatePicker` and `DateTimePicker` behind one small, controlled API.",
          "",
          "**When to use**",
          "- Any form field that needs a single controlled ISO-like date or datetime value.",
          "- Pick `mode` based on whether you need a time-of-day component; the rest of the API is identical.",
          "",
          "**Controlled value**",
          "- `value` is a string (`2026-05-05` for dates, `2026-05-05T09:30` for datetimes) and `onChange` receives the next string.",
          "- Forwards native input attributes (e.g. `aria-label`, `min`, `max`) through to the underlying picker.",
          "",
          "**Usage**",
          "```tsx",
          'const [date, setDate] = useState("2026-05-05");',
          '<DateField aria-label="Business date" value={date} onChange={setDate} />',
          '<DateField mode="datetime" value={ts} onChange={setTs} placeholder="now-1h" />',
          "```",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => <DateFieldPlayground {...args} />,
};
