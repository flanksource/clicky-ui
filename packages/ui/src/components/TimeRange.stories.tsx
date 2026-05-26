import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TimeRange, type TimeRangePreset } from "./TimeRange";

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
        time={timeFrom || "empty"}..{timeTo || "empty"} date={dateFrom || "empty"}..
        {dateTo || "empty"} absolute={absoluteFrom || "empty"}..{absoluteTo || "empty"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/TimeRange",
  component: TimeRangeShowcase,
} satisfies Meta<typeof TimeRangeShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
