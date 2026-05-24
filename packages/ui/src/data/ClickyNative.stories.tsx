import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ClickyNodeView,
  ClickyTable,
  type ClickyColumn,
  type ClickyNode,
  type ClickyRow,
} from "./Clicky";

const meta: Meta = {
  title: "Data/Clicky/Native Components",
};

export default meta;
type Story = StoryObj;

const node: ClickyNode = {
  kind: "text",
  children: [
    { kind: "badge", badgeLabel: "region", badgeValue: "us-east", badgeColor: "#0f766e" },
    { kind: "text", text: " " },
    { kind: "text", text: "cluster is accepting traffic" },
  ],
};

const columns: ClickyColumn[] = [
  { name: "service", label: "Service", sortable: true, grow: true },
  { name: "status", label: "Status", kind: "status", sortable: true, shrink: true },
  { name: "labels", label: "Labels", kind: "tags", filterable: true, grow: true },
];

const rows: ClickyRow[] = [
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
    },
    detail: {
      kind: "code",
      language: "json",
      source: JSON.stringify({ requests: 12492, errors: 3 }, null, 2),
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
    },
    detail: { kind: "text", text: "Retry queue is above the warning threshold." },
  },
];

export const NodeView: Story = {
  render: () => (
    <div className="rounded-md border border-border bg-background p-3">
      <ClickyNodeView node={node} />
    </div>
  ),
};

export const Table: Story = {
  render: () => <ClickyTable columns={columns} rows={rows} autoFilter />,
};
