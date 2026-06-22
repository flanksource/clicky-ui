import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClickyNodeView, type ClickyNode } from "./Clicky";
import { clickyMarkdownBlocksNode } from "./Clicky.fixtures";

const node: ClickyNode = {
  kind: "text",
  children: [
    {
      kind: "badge",
      badgeLabel: "region",
      badgeValue: "us-east",
      badgeColor: "#0f766e",
    },
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

export const MarkdownBlocks: Story = {
  args: {
    node: clickyMarkdownBlocksNode,
  },
};

export const AdmonitionSeverities: Story = {
  args: {
    node: {
      kind: "list",
      unstyled: true,
      items: [
        {
          kind: "admonition",
          severity: "note",
          label: { kind: "text", text: "Note" },
          content: {
            kind: "text",
            text: "Board approval is tracked separately.",
          },
        },
        {
          kind: "admonition",
          severity: "info",
          label: { kind: "text", text: "Information" },
          content: {
            kind: "text",
            text: "Comparatives use the prior reporting pack.",
          },
        },
        {
          kind: "admonition",
          severity: "tip",
          label: { kind: "text", text: "Tip" },
          content: {
            kind: "text",
            text: "Attach the signed trial balance before export.",
          },
        },
        {
          kind: "admonition",
          severity: "warning",
          label: { kind: "text", text: "Warning" },
          content: {
            kind: "text",
            text: "Manual review is required for this note.",
          },
        },
        {
          kind: "admonition",
          severity: "danger",
          label: { kind: "text", text: "Danger" },
          content: {
            kind: "text",
            text: "Publication is blocked until cash reconciles.",
          },
        },
      ],
    },
  },
};
