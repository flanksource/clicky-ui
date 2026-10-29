import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { expandAllTree, type TreeExpansion } from "../lib/tree-rows";
import { MatrixTreeTable } from "./MatrixTreeTable";
import { StatusDot } from "./cells/StatusDot";

type Node = { id: string; name: string; cells?: Array<"success" | "warning" | "error" | null>; children?: Node[] };

const GROUPS = ["Operators", "Finance", "Audit", "Support"];
const ROOTS: Node[] = [
  { id: "company", name: "Company", children: [
    { id: "acme", name: "Acme Insurance", children: [
      { id: "acme-page", name: "Policy page", cells: ["success", "success", null, "warning"] },
      { id: "acme-tx", name: "Payments", children: [
        { id: "acme-tx-run", name: "Run payment", cells: ["success", null, null, "error"] },
        { id: "acme-tx-undo", name: "Undo payment", cells: [null, "warning", null, null] },
      ] },
    ] },
  ] },
  { id: "plan", name: "Plan", children: [
    { id: "gold", name: "Gold plan", children: [
      { id: "gold-field", name: "Premium field", cells: ["success", "success", "success", null] },
    ] },
  ] },
];
const accessors = { getChildren: (node: Node) => node.children, getKey: (node: Node) => node.id };

const meta = {
  title: "Data/MatrixTreeTable",
  component: MatrixTreeTable<Node>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A MatrixTable whose rows form a tree. Parent nodes are collapsible bands that span every column, leaves are matrix rows; both indent by depth. Expansion is uncontrolled with `defaultExpanded`, or controlled with `expanded` overrides and `onExpandedChange` (use `expandAllTree` for Expand/Collapse all).",
      },
    },
  },
  args: {
    roots: ROOTS,
    columns: GROUPS,
    corner: "Permission",
    angledHeaders: true,
    headerClassName: "bg-background",
    headerHeight: 90,
    ...accessors,
    getAriaLabel: (node: Node) => node.name,
    renderLabel: (node: Node) => node.name,
    getCells: (node: Node) => (node.cells ?? []).map((status, index) => (status ? <StatusDot key={index} status={status} size="md" /> : null)),
    defaultExpanded: (_node: Node, depth: number) => depth < 2,
  },
} satisfies Meta<typeof MatrixTreeTable<Node>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Run payment")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Expand Payments" }));
    await expect(canvas.getByText("Run payment")).toBeInTheDocument();
  },
};

export const ControlledExpandAll: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState<TreeExpansion>({});
    return (
      <div className="space-y-2">
        <div className="flex gap-2 text-sm">
          <button type="button" className="underline" onClick={() => setExpanded(expandAllTree(ROOTS, accessors, true))}>Expand all</button>
          <button type="button" className="underline" onClick={() => setExpanded(expandAllTree(ROOTS, accessors, false))}>Collapse all</button>
        </div>
        <MatrixTreeTable<Node> {...args} expanded={expanded} onExpandedChange={setExpanded} />
      </div>
    );
  },
};
