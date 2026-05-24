import {
  ClickyNodeView,
  ClickyTable,
  type ClickyColumn,
  type ClickyNode,
  type ClickyRow,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const summaryNode: ClickyNode = {
  kind: "text",
  children: [
    { kind: "badge", badgeLabel: "env", badgeValue: "prod", badgeColor: "#2563eb" },
    { kind: "text", text: " " },
    {
      kind: "link",
      href: "https://example.com/services/api",
      target: "_tab",
      text: "api service",
      plain: "api service",
    },
    { kind: "text", text: " is processing live traffic." },
  ],
};

const tableColumns: ClickyColumn[] = [
  { name: "service", label: "Service", sortable: true, grow: true },
  { name: "status", label: "Status", kind: "status", sortable: true, shrink: true },
  { name: "labels", label: "Labels", kind: "tags", filterable: true, grow: true },
  { name: "updated", label: "Updated", kind: "timestamp", sortable: true, shrink: true },
];

const tableRows: ClickyRow[] = [
  {
    cells: {
      service: { kind: "text", text: "api" },
      status: { kind: "text", text: "healthy" },
      labels: {
        kind: "map",
        fields: [
          { name: "team", value: { kind: "text", text: "platform" } },
          { name: "tier", value: { kind: "text", text: "edge" } },
        ],
      },
      updated: { kind: "text", text: "2026-05-18T10:30:00Z" },
    },
    detail: {
      kind: "code",
      language: "json",
      source: JSON.stringify({ requests: 12492, errors: 3, p95: "82ms" }, null, 2),
    },
  },
  {
    cells: {
      service: { kind: "text", text: "worker" },
      status: { kind: "text", text: "degraded" },
      labels: {
        kind: "list",
        items: [
          { kind: "text", text: "team=data" },
          { kind: "text", text: "queue=imports" },
        ],
      },
      updated: { kind: "text", text: "2026-05-18T10:26:00Z" },
    },
    detail: { kind: "text", text: "Retry queue is above the warning threshold." },
  },
];

export function ClickyNativeDemo() {
  return (
    <div className="space-y-density-4">
      <DemoSection
        id="clicky-node-view"
        title="ClickyNodeView"
        description="Render a single Clicky AST node without wrapping it in a ClickyDocument."
      >
        <div className="rounded-md border border-border bg-background p-density-3">
          <ClickyNodeView node={summaryNode} />
        </div>
      </DemoSection>

      <DemoSection
        id="clicky-table"
        title="ClickyTable"
        description="Render Clicky table columns and rows directly while preserving tag fields, status cells, timestamps, and expandable details."
      >
        <ClickyTable columns={tableColumns} rows={tableRows} autoFilter />
      </DemoSection>
    </div>
  );
}
