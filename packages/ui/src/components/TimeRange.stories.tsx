import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  TimeRange,
  type TimeRangePreset,
  type TimeRangeProps,
} from "./TimeRange";

const datePresets: TimeRangePreset[] = [
  { label: "Today", from: "2026-05-05", to: "2026-05-05" },
  { label: "This week", from: "2026-05-03", to: "2026-05-09" },
  { label: "This month", from: "2026-05-01", to: "2026-05-31" },
];

function TimeRangeShowcase() {
  const [timeFrom, setTimeFrom] = useState("now-1d");
  const [timeTo, setTimeTo] = useState("now");
  const [absoluteFrom, setAbsoluteFrom] = useState("2026-05-05T09:30:00+03:00");
  const [absoluteTo, setAbsoluteTo] = useState("2026-05-05T17:00:00+03:00");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-05");

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <TimeRange
          from={timeFrom}
          to={timeTo}
          onApply={(from, to) => {
            setTimeFrom(from);
            setTimeTo(to);
          }}
        />
        <TimeRange
          from={absoluteFrom}
          to={absoluteTo}
          presets={["min", "hr", "day", "wk+", "this", "last"]}
          timeEnabled
          timeZone="Asia/Jerusalem"
          timeZones={["Asia/Jerusalem", "UTC", "America/New_York"]}
          onApply={(from, to) => {
            setAbsoluteFrom(from);
            setAbsoluteTo(to);
          }}
        />
        <TimeRange
          kind="date"
          label="Date range"
          from={dateFrom}
          to={dateTo}
          presets={datePresets}
          onApply={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />
      </div>
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        time={timeFrom || "empty"}..{timeTo || "empty"} date=
        {dateFrom || "empty"}..
        {dateTo || "empty"} absolute={absoluteFrom || "empty"}..
        {absoluteTo || "empty"}
      </div>
    </div>
  );
}

function TimeRangePlayground(args: TimeRangeProps) {
  const [from, setFrom] = useState(args.from ?? "now-1d");
  const [to, setTo] = useState(args.to ?? "now");

  return (
    <div className="max-w-xl space-y-4">
      <TimeRange
        {...args}
        from={from}
        to={to}
        onApply={(nextFrom, nextTo) => {
          setFrom(nextFrom);
          setTo(nextTo);
        }}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        from={from || "empty"} to={to || "empty"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/TimeRange",
  component: TimeRange,
  render: () => <TimeRangeShowcase />,
  args: {
    kind: "time",
    label: "Time range",
    from: "now-1d",
    to: "now",
    presets: ["min", "hr", "day", "wk+"],
    timeEnabled: false,
    align: "left",
    disabled: false,
    onApply: () => undefined,
  },
  argTypes: {
    kind: {
      control: "inline-radio",
      options: ["time", "date"],
      description:
        "`time` accepts relative `now-X` and absolute date-time values; `date` is date-only.",
      table: { category: "Behavior", defaultValue: { summary: "time" } },
    },
    label: { control: "text", table: { category: "Trigger" } },
    from: { control: "text", table: { category: "Value" } },
    to: { control: "text", table: { category: "Value" } },
    presets: {
      control: "check",
      options: ["min", "hr", "day", "wk+", "this", "last"],
      description:
        "Built-in preset groups shown in the popup. Pass full `TimeRangePreset` objects in code for custom rows.",
      table: { category: "Presets" },
    },
    timeEnabled: {
      control: "boolean",
      description: "Enables the time-of-day fields for date-time ranges.",
      table: { category: "Behavior" },
    },
    timeZone: { control: "text", table: { category: "Behavior" } },
    align: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Aligns the popup to the trigger's left or right edge.",
      table: { category: "Layout", defaultValue: { summary: "left" } },
    },
    disabled: { control: "boolean", table: { category: "Behavior" } },
    onApply: { control: false, table: { category: "Events" } },
    chipRows: { control: false, table: { category: "Presets" } },
    timeZones: { control: false, table: { category: "Behavior" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Controlled date/time range picker with relative `now-X` presets, optional absolute date-time fields, timezone selection, and compact preset groups for filter bars.",
          "",
          "**Controlled value**",
          '- `from`/`to` are strings. For `kind="time"` they accept relative tokens (`now`, `now-1h`, `now-7d`) or absolute ISO date-times; for `kind="date"` they are ISO dates.',
          "- The picker never mutates state itself — apply the `(from, to)` you receive in `onApply` to your own state.",
          "",
          "**Presets**",
          "- Pass preset-group keys (`min`, `hr`, `day`, `wk+`, `this`, `last`) for the built-in chip rows, or full `TimeRangePreset` objects for custom labels and ranges.",
          "",
          "**Usage**",
          "```tsx",
          'const [from, setFrom] = useState("now-1d");',
          'const [to, setTo] = useState("now");',
          '<TimeRange from={from} to={to} presets={["min", "hr", "day"]}',
          "  onApply={(f, t) => { setFrom(f); setTo(t); }} />",
          "```",
          "",
          "The **Default** story shows time, absolute-with-timezone, and date variants side by side. The **Playground** wires the controls to a single live picker.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof TimeRange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => <TimeRangePlayground {...args} />,
};
