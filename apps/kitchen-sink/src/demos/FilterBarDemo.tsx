import { FilterBar, type FilterBarFilter } from "@flanksource/clicky-ui";
import { useState } from "react";
import { DemoSection } from "./Section";

export function FilterBarDemo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Record<string, "include" | "exclude">>({
    healthy: "include",
  });
  const [owner, setOwner] = useState("");
  const [timeFrom, setTimeFrom] = useState("now-24h");
  const [timeTo, setTimeTo] = useState("now");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filters: FilterBarFilter[] = [
    {
      key: "status",
      kind: "multi",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { value: "healthy", label: "Healthy" },
        { value: "degraded", label: "Degraded" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "owner",
      kind: "text",
      label: "Owner",
      value: owner,
      onChange: setOwner,
      placeholder: "platform",
    },
  ];

  return (
    <DemoSection
      id="filter-bar"
      title="FilterBar / MultiSelect"
      description="Compact native filter chrome with search, compact selects, and built-in date/time range controls."
    >
      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search traces…",
        }}
        filters={filters}
        timeRange={{
          from: timeFrom,
          to: timeTo,
          onApply: (from, to) => {
            setTimeFrom(from);
            setTimeTo(to);
          },
        }}
        dateRange={{
          from: dateFrom,
          to: dateTo,
          onApply: (from, to) => {
            setDateFrom(from);
            setDateTo(to);
          },
        }}
        trailing={<span className="text-xs text-muted-foreground">{search || "Idle"}</span>}
      />
    </DemoSection>
  );
}
