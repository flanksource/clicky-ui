import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreeNode } from "./TreeNode";

type Node = { id: string; name: string; children?: Node[] };

const ROOT: Node = {
  id: "src",
  name: "src",
  children: [
    {
      id: "components",
      name: "components",
      children: [
        { id: "button", name: "button.tsx" },
        { id: "select", name: "select.tsx" },
      ],
    },
    { id: "index", name: "index.ts" },
  ],
};

function TreeNodeExample() {
  const [selected, setSelected] = useState<Node | null>(null);
  return (
    <div className="w-72 rounded-md border border-border p-density-2">
      <TreeNode<Node>
        node={ROOT}
        getKey={(n) => n.id}
        getChildren={(n) => n.children}
        selected={selected}
        onSelect={setSelected}
        defaultOpen={(_n, depth) => depth === 0}
        renderRow={({ node, hasChildren, selected: isSel }) => (
          <span className={isSel ? "font-semibold text-foreground" : hasChildren ? "font-medium" : "text-muted-foreground"}>
            {node.name}
          </span>
        )}
      />
    </div>
  );
}

const meta = {
  title: "Data/TreeNode",
  component: TreeNode,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The recursive row primitive behind `Tree`: renders one node (chevron + your `renderRow`) and its expandable subtree, with controlled/uncontrolled expansion, lazy children (`loadChildren` + `hasMoreChildren`), and secondary-child opt-outs. Most callers use `Tree`, which adds the search/expand toolbar on top; reach for `TreeNode` directly to embed a single branch.",
      },
    },
  },
  render: () => <TreeNodeExample />,
} satisfies Meta<typeof TreeNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
