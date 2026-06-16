import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { UiCloud, UiDatabase, UiNamespace, UiServer, UiTag } from "../icons";
import {
  FilterBar,
  type FilterBarFilter,
  type FilterBarNumberValue,
  type FilterBarProps,
} from "./FilterBar";
import { applyFilterExtensions, type FilterExtension } from "./filter-bar-utils";

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
      trailing={<span className="text-xs text-muted-foreground">{search || "Idle"}</span>}
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
      description: "Label for the Apply button (only shown when `autoSubmit` is false).",
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

// Icons keyed by filter name. A FilterExtension stamps these onto each lookup so
// FilterBar itself stays domain-agnostic — the consumer owns the icon mapping.
const ENTITY_ICONS: Record<string, ReactNode> = {
  namespace: <Icon icon={UiNamespace} />,
  cluster: <Icon icon={UiCloud} />,
  database: <Icon icon={UiDatabase} />,
  service: <Icon icon={UiServer} />,
  label: <Icon icon={UiTag} />,
};

const withEntityIcons: FilterExtension = (filter) => {
  const icon = ENTITY_ICONS[filter.key];
  return icon ? { ...filter, icon } : filter;
};

const NAMESPACE_OPTIONS = [
  { value: "default", label: "default" },
  { value: "kube-system", label: "kube-system" },
  { value: "monitoring", label: "monitoring" },
  { value: "platform", label: "platform" },
];
const CLUSTER_OPTIONS = [
  { value: "prod-eu-1", label: "prod-eu-1" },
  { value: "prod-us-1", label: "prod-us-1" },
  { value: "staging-eu-1", label: "staging-eu-1" },
];
const DATABASE_OPTIONS = [
  { value: "orders", label: "orders" },
  { value: "billing", label: "billing" },
  { value: "analytics", label: "analytics" },
];
const SERVICE_OPTIONS = [
  { value: "api", label: "api" },
  { value: "web", label: "web" },
  { value: "worker", label: "worker" },
];

// withPlaceholder controls whether each lookup carries ghost text. The
// placeholder is shown only while the field is empty; selecting a value hides it
// (the input shows the selected option's label instead), so the two stories
// share one showcase and differ only by this flag.
function LookupExtensionShowcase({
  withPlaceholder,
  preselectCluster,
}: {
  withPlaceholder: boolean;
  preselectCluster?: boolean;
}) {
  const [namespace, setNamespace] = useState("");
  const [cluster, setCluster] = useState(preselectCluster ? "prod-eu-1" : "");
  const [database, setDatabase] = useState("");
  const [service, setService] = useState("");

  const placeholder = (label: string) => (withPlaceholder ? { placeholder: label } : {});

  const baseFilters: FilterBarFilter[] = [
    {
      key: "namespace",
      kind: "lookup",
      label: "Namespace",
      value: namespace,
      onChange: setNamespace,
      options: NAMESPACE_OPTIONS,
      ...placeholder("Namespace"),
    },
    {
      key: "cluster",
      kind: "lookup",
      label: "Cluster",
      value: cluster,
      onChange: setCluster,
      options: CLUSTER_OPTIONS,
      ...placeholder("Cluster"),
    },
    {
      key: "database",
      kind: "lookup",
      label: "Database",
      value: database,
      onChange: setDatabase,
      options: DATABASE_OPTIONS,
      ...placeholder("Database"),
    },
    {
      key: "service",
      kind: "lookup",
      label: "Service",
      value: service,
      onChange: setService,
      options: SERVICE_OPTIONS,
      ...placeholder("Service"),
    },
  ];

  const filters = baseFilters.map((filter) =>
    applyFilterExtensions(filter, [withEntityIcons]),
  );

  return <FilterBar filters={filters} onApply={() => undefined} />;
}

export const LookupIconsOnly: Story = {
  render: () => <LookupExtensionShowcase withPlaceholder={false} />,
  parameters: {
    docs: {
      description: {
        story:
          "Lookup filters decorated by a `FilterExtension` that stamps an entity icon keyed on each filter's name. With an `icon` present and no `placeholder`, the icon replaces the inline text label (the field name stays as tooltip + accessible name) and the field reads as an icon plus its selected value.",
      },
    },
  },
};

export const LookupIconsWithPlaceholder: Story = {
  render: () => <LookupExtensionShowcase withPlaceholder preselectCluster />,
  parameters: {
    docs: {
      description: {
        story:
          "Same icon-stamping extension, but each lookup also carries a `placeholder`. While a field is empty the placeholder shows as ghost text next to the icon; selecting a value hides the placeholder and shows the chosen option instead (here **Cluster** is pre-selected to contrast with the empty fields).",
      },
    },
  },
};

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
