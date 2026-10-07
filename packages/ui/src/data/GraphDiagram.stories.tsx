import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { UiFunction, UiInterface, UiKey, UiMethod, UiSqlColumn, UiSqlTable, UiUnknown } from "../icons";
import {
  GraphDiagram,
  type GraphDiagramEdge,
  type GraphDiagramGroup,
  type GraphDiagramNode,
  type GraphDiagramProps,
} from "./GraphDiagram";

const meta = {
  title: "Data/GraphDiagram",
  component: GraphDiagram,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Generic, type-agnostic node/edge diagram. The `ring` layout places nodes on a circle so small cycles and reciprocal edges read clearly; the `columns` layout places nodes in the column of their `level` for a directed graph with a natural depth, such as a call graph. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`.",
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

export const RecordGroups: Story = {
  name: "Record groups",
  args: {
    layout: "columns",
    nodeWidth: 240,
    compactNodeHeight: 22,
    recordHeaderHeight: 24,
    ariaLabel: "Record data access",
    groups: [{ id: "Customers", label: <span className="flex items-center gap-1.5"><UiSqlTable />Customers</span>, title: "dbo.Customers", variant: "record" }],
    nodes: [
      { id: "load", label: "LoadCustomer", level: 0 },
      { id: "id", label: "ID", icon: <UiKey />, aside: "uniqueidentifier", level: 1, group: "Customers", size: "compact" },
      { id: "name", label: "Name", icon: <UiSqlColumn />, aside: "nvarchar(100)", level: 1, group: "Customers", size: "compact" },
      { id: "status", label: "Status", icon: <UiSqlColumn />, aside: "nvarchar(2)", level: 1, group: "Customers", size: "compact" },
    ],
    edges: [{ id: "load-name", from: "load", to: "name", label: "read", tone: "success" }],
  },
  render: (args) => <CallGraph {...args} />,
  parameters: { docs: { description: { story: "Set a group's variant to record and its members' size to compact. The header uses recordHeaderHeight; each flush row uses compactNodeHeight. The aside slot shows a type, and edges attach to the row at the card's side. A record holding a regular node fails with its group and node id." } } },
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

const CALL_GROUPS: GraphDiagramGroup[] = [
  { id: "cmd/uir", label: "cmd/uir", title: "github.com/flanksource/uir/cmd/uir" },
  { id: "uir/query", label: "uir/query", title: "github.com/flanksource/uir/query" },
  { id: "uir/graph", label: "uir/graph", title: "github.com/flanksource/uir/graph" },
  { id: "uir/storage", label: "uir/storage", title: "github.com/flanksource/uir/storage" },
];

const CALL_NODES: GraphDiagramNode[] = [
  { id: "serve", label: "serveModuleGraph", detail: "func", level: -1, group: "cmd/uir", expandCount: 2 },
  { id: "cli", label: "runGraphCommand", detail: "func", level: -1, group: "cmd/uir" },
  { id: "run", label: "Pipeline.RunModules", detail: "method", level: 0, group: "uir/query", tone: "info" },
  { id: "resolve", label: "Pipeline.resolveSelector", detail: "method", level: 1, group: "uir/query" },
  { id: "graph", label: "Pipeline.Graph", detail: "method", level: 1, group: "uir/query" },
  { id: "build", label: "Build", detail: "func", level: 1, group: "uir/graph" },
  { id: "load", label: "Store.LoadDocument", detail: "method", level: 2, group: "uir/storage", expandCount: 3 },
  { id: "walk", label: "walk", detail: "func", level: 2, group: "uir/graph" },
  { id: "lookup", label: "plugin.Lookup", detail: "unresolved", level: 2, tone: "warning", muted: true },
];

const CALL_EDGES: GraphDiagramEdge[] = [
  { id: "serve-run", from: "serve", to: "run" },
  {
    id: "cli-run",
    from: "cli",
    to: "run",
    label: "len(args) > 0",
    title: "len(args) > 0",
    dashed: true,
  },
  { id: "run-resolve", from: "run", to: "resolve" },
  {
    id: "run-graph",
    from: "run",
    to: "graph",
    label: "opts.Depth > 0 ×2",
    title: "opts != nil ∧ opts.Depth > 0",
    dashed: true,
  },
  { id: "run-build", from: "run", to: "build", label: "via interface", tone: "info" },
  { id: "graph-build", from: "graph", to: "build" },
  { id: "resolve-load", from: "resolve", to: "load", label: "!cached", title: "!cached", dashed: true },
  { id: "build-walk", from: "build", to: "walk" },
  { id: "build-lookup", from: "build", to: "lookup", tone: "warning" },
  { id: "walk-walk", from: "walk", to: "walk", label: "depth < limit", title: "depth < limit", dashed: true },
  { id: "walk-graph", from: "walk", to: "graph" },
];

function CallGraph(args: GraphDiagramProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>("run");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | undefined>();
  const [expanded, setExpanded] = useState<string | undefined>();
  return (
    <div style={{ maxWidth: 1100 }}>
      <GraphDiagram
        {...args}
        onNodeSelect={setSelectedId}
        onEdgeSelect={setSelectedEdgeId}
        onNodeExpand={setExpanded}
        {...(selectedId !== undefined ? { selectedId } : {})}
        {...(selectedEdgeId !== undefined ? { selectedEdgeId } : {})}
      />
      <p data-testid="call-graph-state" style={{ fontSize: 12 }}>
        node: {selectedId ?? "none"} · edge: {selectedEdgeId ?? "none"} · expanded: {expanded ?? "none"}
      </p>
    </div>
  );
}

export const CallGraphColumns: Story = {
  name: "Call graph (columns)",
  args: {
    nodes: CALL_NODES,
    edges: CALL_EDGES,
    groups: CALL_GROUPS,
    layout: "columns",
    nodeWidth: 176,
    nodeHeight: 48,
    columnGap: 150,
    zoomable: true,
    ariaLabel: "Call graph of Pipeline.RunModules",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `columns` layout places each node in the column of its `level` (callers negative, callees positive), keeps a `group` together inside a captioned box, and routes edges side to side: back edges return through the columns, and a self-edge or an edge inside one column loops beside it. Dashed edges are conditional; the pill shows the short guard and its tooltip the full one. `+N` asks the host to load more neighbours, edges and nodes are selectable, and `zoomable` adds ctrl/⌘ + wheel zoom, background drag and the zoom controls.",
      },
    },
  },
  render: (args) => <CallGraph {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const state = canvas.getByTestId("call-graph-state");
    await step("group captions and nodes render", async () => {
      await expect(canvas.getAllByText("uir/query").length).toBe(2);
      await expect(canvas.getByText("Pipeline.RunModules")).toBeInTheDocument();
    });
    await step("+N expands without selecting the node", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand 3 more from Store.LoadDocument" }));
      await waitFor(() => expect(state).toHaveTextContent("node: run · edge: none · expanded: load"));
    });
    await step("an edge is selected from its label pill", async () => {
      await userEvent.click(canvas.getByText("via interface"));
      await waitFor(() =>
        expect(
          canvas.getByRole("button", { name: "Pipeline.RunModules to Build: via interface" }),
        ).toHaveAttribute("aria-pressed", "true"),
      );
    });
  },
};

const KIND_ICONS: { detail: string; words: string; icon: ReactNode }[] = [
  { detail: "method", words: "method", icon: <UiMethod title="method" /> },
  { detail: "func", words: "function", icon: <UiFunction title="function" /> },
  { detail: "unresolved", words: "unresolved call", icon: <UiUnknown title="unresolved call" /> },
];

const ICON_NODES: GraphDiagramNode[] = CALL_NODES.map(({ detail, ...node }) => {
  const kind = KIND_ICONS.find((entry) => entry.detail === detail);
  if (!kind) throw new Error(`GraphDiagram story: no icon for node kind "${String(detail)}"`);
  const where = node.group === undefined ? "" : ` in ${node.group}`;
  return { ...node, icon: kind.icon, title: `${kind.words} ${String(node.label)}${where}` };
});

const ICON_EDGES: GraphDiagramEdge[] = CALL_EDGES.map((edge) =>
  edge.id === "run-build"
    ? { id: edge.id, from: edge.from, to: edge.to, tone: "info", icon: <UiInterface title="via interface" />, iconLabel: "via interface" }
    : edge,
);

export const CallGraphIcons: Story = {
  name: "Call graph (icons)",
  args: {
    ...CallGraphColumns.args,
    nodes: ICON_NODES,
    edges: ICON_EDGES,
    nodeHeight: 32,
    rowGap: 14,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A node's `icon` sits before its label, so the kind needs no second line and the node can be one line tall; below 44px the label is cut with an ellipsis instead of wrapping. The node's `title` is its tooltip and carries the words the icon replaced. An edge's `icon` sits in its pill before the label, or alone when the edge has no label; `iconLabel` says the icon in words in the edge's accessible name.",
      },
    },
  },
  render: (args) => <CallGraph {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("a node is named by its icon and its label", async () => {
      await expect(canvas.getByRole("button", { name: "method Pipeline.RunModules" })).toHaveAttribute(
        "title",
        "method Pipeline.RunModules in uir/query",
      );
    });
    await step("an icon-only pill selects its edge", async () => {
      const pill = canvasElement.querySelector<HTMLElement>('[data-graph-edge-label="run-build"]');
      if (!pill) throw new Error("GraphDiagram story: the run-build edge drew no pill");
      await userEvent.click(pill);
      await waitFor(() =>
        expect(
          canvas.getByRole("button", { name: "Pipeline.RunModules to Build: via interface" }),
        ).toHaveAttribute("aria-pressed", "true"),
      );
    });
  },
};

const DENSE_STEPS = 12;
const DENSE_HELPERS = 18;
const DENSE_NODES: GraphDiagramNode[] = [
  { id: "run", label: "Pipeline.Run", level: 0, tone: "info" },
  ...Array.from({ length: DENSE_STEPS }, (_, step) => ({ id: `step-${step}`, label: `step${step}`, level: 1 })),
  ...Array.from({ length: DENSE_HELPERS }, (_, helper) => ({ id: `helper-${helper}`, label: `helper${helper}`, level: 2 })),
];
// Every step is called by the root and calls three helpers: 48 edges, past the 32 that "auto" focuses at.
const DENSE_EDGES: GraphDiagramEdge[] = Array.from({ length: DENSE_STEPS }, (_, step) => [
  { id: `run-step-${step}`, from: "run", to: `step-${step}`, label: `stage == ${step}`, dashed: true },
  ...[3 * step, 3 * step + 1, 5 * step + 2].map((helper, call) => ({
    id: `step-${step}-call-${call}`,
    from: `step-${step}`,
    to: `helper-${helper % DENSE_HELPERS}`,
    ...(call === 0 ? { label: "err != nil", dashed: true } : {}),
  })),
]).flat();

export const DenseCallGraph: Story = {
  name: "Dense call graph (edge focus)",
  args: {
    nodes: DENSE_NODES,
    edges: DENSE_EDGES,
    layout: "columns",
    nodeWidth: 150,
    nodeHeight: 32,
    rowGap: 14,
    zoomable: true,
    fitMinScale: 0.8,
    focusId: "run",
    maxHeight: 420,
    ariaLabel: "Call graph of Pipeline.Run",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Past 32 edges `edgeFocus=\"auto\"` stops showing every pill: an edge shows its pill only while it is in focus — selected, hovered, or attached to the selected or hovered node — and the edges out of focus fade. The pills of a focused node sit toward the far end of each edge. `fitMinScale` keeps the diagram from opening smaller than is readable: it opens centred on `focusId` and is panned to reach the rest, `Fit to view` shows everything, and `Reset view` returns.",
      },
    },
  },
  render: (args) => <CallGraph {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const pills = () => canvasElement.querySelectorAll("[data-graph-edge-label]").length;
    await step("only the selected root's edges show their pills", async () => {
      await expect(pills()).toBe(DENSE_STEPS);
    });
    await step("selecting a step moves the focus to its four edges, two of them labelled", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "step4" }));
      await waitFor(() => expect(pills()).toBe(2));
    });
    await step("a minimum fit scale adds Reset view", async () => {
      await expect(canvas.getByRole("button", { name: "Reset view" })).toBeInTheDocument();
    });
  },
};
