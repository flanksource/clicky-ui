import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TreeDataTable } from "./TreeDataTable";

type Node = { id: string; permission: string; group: string; change: string; status: string; children?: Node[] };

const ROOTS: Node[] = [
  { id: "company", permission: "Company", group: "", change: "", status: "2 ready · 1 conflict", children: [
    { id: "acme", permission: "Acme Insurance", group: "", change: "", status: "2 ready · 1 conflict", children: [
      { id: "acme-page", permission: "Policy page", group: "Operators", change: "Absent → Y", status: "ready" },
      { id: "acme-run", permission: "Run payment", group: "Finance", change: "Y → Absent", status: "ready" },
      { id: "acme-mask", permission: "Tax number mask", group: "Audit", change: "01 → 03", status: "conflict" },
    ] },
  ] },
  { id: "plan", permission: "Plan", group: "", change: "", status: "1 applied", children: [
    { id: "gold-field", permission: "Gold plan premium", group: "Support", change: "Absent → 02", status: "applied" },
  ] },
];

const meta = {
  title: "Data/TreeDataTable",
  component: TreeDataTable<Node>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A DataTable whose rows form a tree. Parents and leaves share the columns; `treeColumn` carries the indent and the expand/collapse chevron. Tree order is the row order, so sorting and grouping are not offered.",
      },
    },
  },
  args: {
    roots: ROOTS,
    treeColumn: "permission",
    columns: [
      { key: "permission", label: "Permission" },
      { key: "group", label: "Group" },
      { key: "change", label: "Reference → Target" },
      { key: "status", label: "Status" },
    ],
    getChildren: (node: Node) => node.children,
    getKey: (node: Node) => node.id,
    getAriaLabel: (node: Node) => node.permission,
    defaultExpanded: (node: Node) => node.status.includes("conflict"),
  },
} satisfies Meta<typeof TreeDataTable<Node>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Tax number mask")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Expand Plan" }));
    await expect(canvas.getByText("Gold plan premium")).toBeInTheDocument();
  },
};
