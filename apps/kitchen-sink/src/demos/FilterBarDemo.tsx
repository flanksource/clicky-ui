import {
  FilterBar,
  matchesTreeSelection,
  type FilterBarFilter,
  type FilterBarNumberValue,
  type FilterTreeNode,
} from "@flanksource/clicky-ui";
import { useState } from "react";
import { DemoSection } from "./Section";

const PAGE_TREE: FilterTreeNode[] = [
  {
    key: "acme",
    label: "Acme",
    children: [
      {
        key: "acme/billing",
        label: "Billing",
        children: [
          { key: "acme/billing/invoices", label: "Invoices", description: "Open and paid" },
          { key: "acme/billing/payments", label: "Payments" },
        ],
      },
      { key: "acme/support", label: "Support" },
    ],
  },
  { key: "globex", label: "Globex", children: [{ key: "globex/overview", label: "Overview" }] },
];

const PAGE_PATHS = [
  "acme/billing/invoices",
  "acme/billing/payments",
  "acme/support",
  "globex/overview",
];

function TreeFilterDemo() {
  const [pages, setPages] = useState<Record<string, "include" | "exclude">>({
    acme: "include",
    "acme/billing/payments": "exclude",
  });
  return (
    <div className="space-y-density-2" data-testid="tree-filter-demo">
      <p className="text-xs text-muted-foreground">
        Tree filter: include or exclude whole folders. The deepest selected ancestor decides, so
        Payments is carved out of the included Acme folder.
      </p>
      <FilterBar
        filters={[
          { key: "pages", kind: "tree", label: "Pages", value: pages, nodes: PAGE_TREE, onChange: setPages },
        ]}
      />
      <ul className="font-mono text-xs" aria-label="Matching pages">
        {PAGE_PATHS.filter((path) => matchesTreeSelection(path, pages)).map((path) => (
          <li key={path}>{path}</li>
        ))}
      </ul>
    </div>
  );
}

export function FilterBarDemo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Record<string, "include" | "exclude">>({
    healthy: "include",
  });
  const [owner, setOwner] = useState("");
  const [client, setClient] = useState<string[]>([]);
  const [namespace, setNamespace] = useState("");
  const [cluster, setCluster] = useState("");
  const [component, setComponent] = useState("");
  const [restarts, setRestarts] = useState<FilterBarNumberValue>({ min: "1", max: "4" });
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
      key: "client",
      kind: "lookup-multi",
      label: "Client",
      value: client,
      onChange: setClient,
      options: [
        { value: "smith", label: "Smith" },
        { value: "jones", label: "Jones" },
      ],
      placeholder: "Name or GUID",
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
    <DemoSection
      id="filter-bar"
      title="FilterBar / MultiSelect"
      description="Compact native filter chrome with search, tri-state selects, number ranges, and built-in date/time range controls."
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
      <TreeFilterDemo />
    </DemoSection>
  );
}
