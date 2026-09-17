import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GraphDiagram, type GraphDiagramEdge, type GraphDiagramNode } from "./GraphDiagram";

const meta = {
  title: "Data/GraphDiagram",
  component: GraphDiagram,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Generic, type-agnostic node/edge diagram. Ring layout places nodes on a circle so cycles and reciprocal edges — relationships a left-to-right column layout can't express — read clearly. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`.",
      },
    },
  },
  args: {
    ariaLabel: "Example graph",
  },
} satisfies Meta<typeof GraphDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

const CYCLE_NODES: GraphDiagramNode[] = [
  { id: "session-a", label: "Session 93 · victim", tone: "danger" },
  { id: "resource-r1", label: "Lock A", detail: "keylock", shape: "pill" },
  { id: "session-b", label: "Session 47 · survivor", tone: "success" },
  { id: "resource-r2", label: "Lock B", detail: "keylock", shape: "pill" },
];

const CYCLE_EDGES: GraphDiagramEdge[] = [
  { id: "e1", from: "resource-r1", to: "session-a", label: "holds X", tone: "info" },
  { id: "e2", from: "session-a", to: "resource-r2", label: "wants S", tone: "warning", dashed: true },
  { id: "e3", from: "resource-r2", to: "session-b", label: "holds S", tone: "info" },
  { id: "e4", from: "session-b", to: "resource-r1", label: "wants X", tone: "warning", dashed: true },
  { id: "e5", from: "resource-r1", to: "session-b", label: "holds S", tone: "info" },
];

export const Default: Story = {
  args: { nodes: CYCLE_NODES, edges: CYCLE_EDGES, ariaLabel: "Four node deadlock cycle" },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <GraphDiagram {...args} />
    </div>
  ),
};

export const Selectable: Story = {
  args: { nodes: CYCLE_NODES, edges: CYCLE_EDGES, ariaLabel: "Selectable deadlock cycle" },
  render: (args) => {
    function SelectableGraph() {
      const [selectedId, setSelectedId] = useState<string | undefined>("session-a");
      return (
        <div style={{ maxWidth: 640 }}>
          <GraphDiagram {...args} selectedId={selectedId} onNodeSelect={setSelectedId} />
        </div>
      );
    }
    return <SelectableGraph />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("selected node is pressed", async () => {
      const button = canvas.getByRole("button", { name: /victim/ });
      await expect(button).toHaveAttribute("aria-pressed", "true");
    });
    await step("clicking another node moves the selection", async () => {
      const survivor = canvas.getByRole("button", { name: /survivor/ });
      await userEvent.click(survivor);
      await waitFor(() =>
        expect(survivor).toHaveAttribute("aria-pressed", "true"),
      );
      await expect(canvas.getByRole("button", { name: /victim/ })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  },
};

const SINGLE_NODE: GraphDiagramNode[] = [{ id: "only", label: "Isolated resource", detail: "no contention" }];

export const SingleNode: Story = {
  args: { nodes: SINGLE_NODE, edges: [], ariaLabel: "Single isolated node" },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <GraphDiagram {...args} />
    </div>
  ),
};

const RING_NODE_COUNT = 8;
const WIDE_RING_NODES: GraphDiagramNode[] = Array.from({ length: RING_NODE_COUNT }, (_, index) => ({
  id: `node-${index}`,
  label: `Session ${index + 1}`,
  tone: index % 2 === 0 ? "info" : "neutral",
}));
const WIDE_RING_EDGES: GraphDiagramEdge[] = WIDE_RING_NODES.map((node, index) => ({
  id: `edge-${index}`,
  from: node.id,
  to: WIDE_RING_NODES[(index + 1) % WIDE_RING_NODES.length].id,
  label: "waits on",
}));

export const EightNodeRing: Story = {
  args: { nodes: WIDE_RING_NODES, edges: WIDE_RING_EDGES, ariaLabel: "Eight node wait ring" },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <GraphDiagram {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("every node label is rendered", async () => {
      for (const node of WIDE_RING_NODES) {
        await expect(canvas.getByText(String(node.label))).toBeInTheDocument();
      }
    });
  },
};
