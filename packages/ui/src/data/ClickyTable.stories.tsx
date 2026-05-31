import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClickyTable, type ClickyColumn, type ClickyRow } from "./Clicky";

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

const meta: Meta<typeof ClickyTable> = {
  title: "Data/Clicky/Table",
  component: ClickyTable,
  args: {
    columns,
    rows,
    autoFilter: true,
  },
  argTypes: {
    onTableRowClick: { table: { disable: true } },
    getTableRowHref: { table: { disable: true } },
    isTableRowClickable: { table: { disable: true } },
    search: { table: { disable: true } },
    timeRange: { table: { disable: true } },
    externalFilters: { table: { disable: true } },
    pagination: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lower-level Clicky table renderer. It maps Clicky columns and rows into DataTable while preserving Clicky cell renderers, details, filters, and runtime row handlers.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClickyTable>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    rows: [],
  },
};
