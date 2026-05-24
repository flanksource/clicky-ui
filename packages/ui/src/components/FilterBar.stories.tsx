import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterBar, type FilterBarFilter, type FilterBarNumberValue } from "./FilterBar";

function FilterBarShowcase() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Record<string, "include" | "exclude">>({
    healthy: "include",
  });
  const [owner, setOwner] = useState("");
  const [namespace, setNamespace] = useState("");
  const [cluster, setCluster] = useState("");
  const [component, setComponent] = useState("");
  const [restarts, setRestarts] = useState<FilterBarNumberValue>({ min: "1", max: "5" });
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
    {
      key: "namespace",
      kind: "text",
      label: "Namespace",
      value: namespace,
      onChange: setNamespace,
      placeholder: "prod",
    },
    {
      key: "cluster",
      kind: "text",
      label: "Cluster",
      value: cluster,
      onChange: setCluster,
      placeholder: "eu-1",
    },
    {
      key: "component",
      kind: "text",
      label: "Component",
      value: component,
      onChange: setComponent,
      placeholder: "api",
    },
    {
      key: "restarts",
      kind: "number",
      label: "Restarts",
      value: restarts,
      domainMin: 0,
      domainMax: 6,
      step: 1,
      onChange: (next) => setRestarts(next),
    },
  ];

  return (
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
  );
}

const meta = {
  title: "Components/FilterBar",
  component: FilterBarShowcase,
} satisfies Meta<typeof FilterBarShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
