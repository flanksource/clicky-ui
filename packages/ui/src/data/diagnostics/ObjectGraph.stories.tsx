import type { Meta, StoryObj } from "@storybook/react-vite";
import { ObjectGraph, type ObjectGraphNode } from "../ObjectGraph";

// A representative captured object graph (e.g. a watched OGNL value): a bean with
// scalar fields, a nested bean, a map summary and a list.
const sampleGraph: ObjectGraphNode[] = [
  {
    id: "root",
    label: "value",
    type: "ActivitySequenceTaskDcl",
    kind: "object",
    children: [
      { id: "root.guid", label: "activityGuid", type: "String", value: "9BAB4AB2-…-1C95D53A9678", kind: "scalar" },
      { id: "root.status", label: "statusCode", type: "Integer", value: "02", kind: "scalar" },
      {
        id: "root.task",
        label: "taskType",
        type: "ActivitySequenceTaskType",
        kind: "object",
        children: [{ id: "root.task.name", label: "name", type: "String", value: "INTAKERECORDACTIVITY", kind: "scalar" }],
      },
      {
        id: "root.params",
        label: "params",
        type: "HashMap",
        kind: "map",
        children: [
          { id: "root.params.a", label: "CommencementDate", type: "Date", value: "2026-06-01", kind: "scalar" },
          { id: "root.params.b", label: "Premium", type: "BigDecimal", value: "1200.00", kind: "scalar" },
        ],
      },
      {
        id: "root.errors",
        label: "errors",
        type: "ArrayList",
        kind: "list",
        children: [
          { id: "root.errors.0", label: "[0]", type: "AsError", kind: "object", raw: "AsError@4f2c…" },
        ],
      },
    ],
  },
];

const meta: Meta<typeof ObjectGraph> = {
  title: "Data/Diagnostics/ObjectGraph",
  component: ObjectGraph,
  args: { roots: sampleGraph },
  parameters: {
    docs: {
      description: {
        component:
          "Generic, type-agnostic expandable object/value inspector. Any producer (an OGNL value capture, a domain object, a JSON tree) maps its data into ObjectGraphNode and gets the same tree, search, and lazy-expansion behaviour. Delegates hierarchy to Tree.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ObjectGraph>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[640px]">
      <ObjectGraph {...args} />
    </div>
  ),
};

// A collection summary that fetches its entries the first time it is opened —
// the pattern a live OGNL inspector uses (server re-evaluates the accessor path).
export const LazyExpansion: Story = {
  render: () => (
    <div className="w-[640px]">
      <ObjectGraph
        roots={[
          {
            id: "cache",
            label: "CYCLE cache",
            type: "NamedCache",
            kind: "map",
            expandable: true,
          },
        ]}
        loadChildren={async (node) => [
          { id: `${node.id}.0`, label: "CycleProcess:Active", type: "String", value: "ABORT", kind: "scalar" },
          { id: `${node.id}.1`, label: "07", type: "String", value: "GUID-…", kind: "scalar" },
        ]}
      />
    </div>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <div className="w-[640px]">
      <ObjectGraph
        roots={sampleGraph}
        renderLabel={(node) => (
          <span className="font-mono text-xs">
            <span className="text-blue-600">{node.label}</span>
            {node.value != null && <span className="ml-2 text-foreground">= {String(node.value)}</span>}
          </span>
        )}
      />
    </div>
  ),
};
