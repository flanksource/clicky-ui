import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  FilterBar,
  type FilterBarFilter,
  type FilterBarNumberValue,
  type FilterBarProps,
} from "./FilterBar";

type FilterBarShowcaseProps = Pick<
  FilterBarProps,
  "autoSubmit" | "applyLabel" | "overflowMode" | "isPending"
>;

function FilterBarShowcase(overrides: FilterBarShowcaseProps = {}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Record<string, "include" | "exclude">>({
    healthy: "include",
  });
  const [owner, setOwner] = useState("");
  const [namespace, setNamespace] = useState("");
  const [cluster, setCluster] = useState("");
  const [component, setComponent] = useState("");
  const [restarts, setRestarts] = useState<FilterBarNumberValue>({
    min: "1",
    max: "5",
  });
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
      onApply={() => undefined}
      trailing={
        <span className="text-xs text-muted-foreground">
          {search || "Idle"}
        </span>
      }
      {...overrides}
    />
  );
}

function FilterBarPlayground(args: FilterBarShowcaseProps) {
  return <FilterBarShowcase {...args} />;
}

const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  render: () => <FilterBarShowcase />,
  args: {
    search: {
      value: "",
      onChange: () => undefined,
      placeholder: "Search traces...",
    },
    filters: [],
    autoSubmit: true,
    applyLabel: "Apply",
    isPending: false,
    overflowMode: "responsive",
  },
  argTypes: {
    autoSubmit: {
      control: "boolean",
      description:
        "When true, debounced fields submit live. When false, edits are staged and an Apply button is shown.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    overflowMode: {
      control: "inline-radio",
      options: ["responsive", "wrap"],
      description:
        "`responsive` moves hidden filters into an overflow popover; `wrap` lets them wrap to the next line.",
      table: { category: "Layout", defaultValue: { summary: "responsive" } },
    },
    applyLabel: {
      control: "text",
      description:
        "Label for the Apply button (only shown when `autoSubmit` is false).",
      table: { category: "Behavior", defaultValue: { summary: "Apply" } },
    },
    isPending: {
      control: "boolean",
      description: "Shows a pending state on the Apply button.",
      table: { category: "Behavior" },
    },
    search: { control: false, table: { category: "Controls" } },
    filters: { control: false, table: { category: "Controls" } },
    timeRange: { control: false, table: { category: "Controls" } },
    dateRange: { control: false, table: { category: "Controls" } },
    onApply: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Responsive filter toolbar for search, typed filters, include/exclude chips, lookup fields, and date/time ranges.",
          "",
          "**Composition**",
          "- `search` renders the leading search input.",
          "- `filters` is an array of typed descriptors — `text`, `number`, `multi` (include/exclude chips), `lookup`, and `lookup-multi` — each fully controlled via its own `value`/`onChange`.",
          "- `timeRange`/`dateRange` add range pickers; `leading`/`trailing`/`children` inject custom content.",
          "",
          "**Submit modes**",
          "- `autoSubmit` (default) debounces field edits upstream for live filtering, as used in trace/log views.",
          "- Set `autoSubmit={false}` to stage edits locally and fire one request from the Apply button (`onApply`).",
          "",
          "**Overflow**",
          '- `overflowMode="responsive"` collapses filters that don\'t fit into an overflow popover; `"wrap"` lets them wrap.',
          "",
          "**Usage**",
          "```tsx",
          "<FilterBar",
          "  search={{ value: search, onChange: setSearch }}",
          '  filters={[{ key: "status", kind: "multi", label: "Status", value, onChange, options }]}',
          "  timeRange={{ from, to, onApply }}",
          "/>",
          "```",
          "",
          "Filters and ranges are objects wired to local state, so they aren't editable from the controls panel. The **Playground** exposes the scalar layout/submit props (`autoSubmit`, `overflowMode`, `applyLabel`, `isPending`).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => (
    <FilterBarPlayground
      autoSubmit={args.autoSubmit}
      applyLabel={args.applyLabel}
      overflowMode={args.overflowMode}
      isPending={args.isPending}
    />
  ),
};
