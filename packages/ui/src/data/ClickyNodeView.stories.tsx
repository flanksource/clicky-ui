import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClickyNodeView, type ClickyNode } from "./Clicky";

const node: ClickyNode = {
  kind: "text",
  children: [
    { kind: "badge", badgeLabel: "region", badgeValue: "us-east", badgeColor: "#0f766e" },
    { kind: "text", text: " " },
    { kind: "text", text: "cluster is accepting traffic" },
  ],
};

const meta: Meta<typeof ClickyNodeView> = {
  title: "Data/Clicky/NodeView",
  component: ClickyNodeView,
  args: {
    node,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lower-level Clicky renderer for a single node. Use it when the host already owns the surrounding document chrome and only needs to render one Clicky AST node.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClickyNodeView>;

export const Default: Story = {
  render: (args) => (
    <div className="rounded-md border border-border bg-background p-density-3">
      <ClickyNodeView {...args} />
    </div>
  ),
};

export const CodeNode: Story = {
  args: {
    node: {
      kind: "code",
      language: "json",
      source: JSON.stringify({ requests: 12492, errors: 3 }, null, 2),
    },
  },
};
