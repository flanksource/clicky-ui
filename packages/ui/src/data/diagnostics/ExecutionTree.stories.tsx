import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExecutionTree, type ExecutionNode } from "../ExecutionTree";

// A representative captured call tree (e.g. an arthas `trace`): nested method
// calls with aggregated cost, invocation counts, source location, and a throwing
// leaf surfaced as an error.
const sampleCallTree: ExecutionNode[] = [
  {
    id: "0",
    label: "processActivitySequence",
    className: "org.example.workflow.bll.tasks.ActivitySequenceTaskBll",
    lineNumber: 136,
    cost: 12.3,
    unit: "ms",
    times: 1,
    status: "ok",
    children: [
      {
        id: "0.0",
        label: "processActivitySequenceEntity",
        className: "org.example.workflow.bll.tasks.ActivitySequenceTaskBll",
        lineNumber: 161,
        cost: 9.8,
        status: "ok",
        children: [
          {
            id: "0.0.0",
            label: "load",
            className: "org.example.workflow.dao.ActivitySequenceTaskDao",
            lineNumber: 88,
            cost: 3.4,
            times: 2,
            status: "ok",
          },
          {
            id: "0.0.1",
            label: "validateResult",
            className: "org.example.workflow.bll.tasks.ActivitySequenceTaskBll",
            lineNumber: 285,
            cost: 1.2,
            times: 1,
            status: "error",
            detail: { throwExp: "ActivitySequenceException" },
          },
        ],
      },
    ],
  },
];

const meta: Meta<typeof ExecutionTree> = {
  title: "Data/Diagnostics/ExecutionTree",
  component: ExecutionTree,
  args: { roots: sampleCallTree, defaultOpenDepth: 3 },
  parameters: {
    docs: {
      description: {
        component:
          "Generic, type-agnostic call/execution tree. Any producer (an arthas trace, a span tree, an activity sequence) maps its data into ExecutionNode and gets per-node cost, status, invocation count, and a slow-path cost highlight. Delegates hierarchy to Tree.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExecutionTree>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[720px]">
      <ExecutionTree {...args} />
    </div>
  ),
};

// Costs at or above the threshold render red, so slow frames stand out.
export const CostThreshold: Story = {
  render: () => (
    <div className="w-[720px]">
      <ExecutionTree roots={sampleCallTree} defaultOpenDepth={3} costThreshold={5} />
    </div>
  ),
};

// Non-ms units (counts, bytes) render verbatim.
export const CountUnit: Story = {
  render: () => (
    <div className="w-[720px]">
      <ExecutionTree
        roots={[
          { id: "q", label: "executeQuery", cost: 142, unit: "count", status: "warning", detail: { rows: "142" } },
        ]}
      />
    </div>
  ),
};
