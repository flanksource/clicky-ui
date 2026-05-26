import { DateField, TimeRange, type TimeRangePreset } from "@flanksource/clicky-ui";
import { useState } from "react";
import { DemoRow, DemoSection } from "./Section";

const datePresets: TimeRangePreset[] = [
  { label: "Today", from: "2026-05-05", to: "2026-05-05" },
  { label: "This week", from: "2026-05-03", to: "2026-05-09" },
  { label: "This month", from: "2026-05-01", to: "2026-05-31" },
];

export function TimeRangeDemo() {
  const [date, setDate] = useState("2026-05-05");
  const [timestamp, setTimestamp] = useState("2026-05-05T09:30");
  const [timeFrom, setTimeFrom] = useState("now-1d");
  const [timeTo, setTimeTo] = useState("now");
  const [absoluteFrom, setAbsoluteFrom] = useState("2026-05-05T09:30:00+03:00");
  const [absoluteTo, setAbsoluteTo] = useState("2026-05-05T17:00:00+03:00");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-05");

  return (
    <DemoSection
      id="time-range"
      title="TimeRange / DateField"
      description="Standalone date fields and compact range pickers for filter bars, dialogs, and forms."
    >
      <DemoRow label="DateField">
        <DateField aria-label="Business date" value={date} onChange={setDate} className="w-40" />
        <DateField
          mode="datetime"
          aria-label="Started at"
          value={timestamp}
          onChange={setTimestamp}
          placeholder="now-1h"
          className="w-48"
        />
      </DemoRow>
      <DemoRow label="TimeRange">
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
      </DemoRow>
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
        date={date || "empty"} timestamp={timestamp || "empty"} time={timeFrom || "empty"}..
        {timeTo || "empty"} absolute={absoluteFrom || "empty"}..{absoluteTo || "empty"} range=
        {dateFrom || "empty"}..{dateTo || "empty"}
      </div>
    </DemoSection>
  );
}
