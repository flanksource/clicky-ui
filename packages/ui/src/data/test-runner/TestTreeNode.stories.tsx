import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TestTreeNode } from "./TestTreeNode";
import { TestRunnerProvider } from "./context";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters } from "./filterState";
import { completedTests } from "./TestRunner.fixtures";
import type { Test } from "./types";

const ADAPTERS = createTestRunnerRegistry([]);
const ROOT = completedTests[0] as Test;

function Harness() {
  const [selected, setSelected] = useState<Test | null>(null);
  return (
    <TestRunnerProvider
      value={{
        tests: completedTests,
        selected,
        done: true,
        filters: emptyTestFilters(),
        expandAll: true,
        busy: {},
        adapters: ADAPTERS,
        onSelect: setSelected,
        onFiltersChange: () => {},
        onExpandAllChange: () => {},
      }}
    >
      <div className="w-80 rounded-md border border-border p-density-1">
        <TestTreeNode node={ROOT} selected={selected?.route_path === ROOT.route_path} />
      </div>
    </TestRunnerProvider>
  );
}

const meta = {
  title: "Data/TestRunner/TestTreeNode",
  component: TestTreeNode,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A single recursive row in the test tree: status icon (framework- and verdict-aware), name, duration, and expansion for child nodes. Reads handlers/adapters from `TestRunnerProvider`; this story renders one root branch with `expandAll` on.",
      },
    },
  },
  render: () => <Harness />,
} satisfies Meta<typeof TestTreeNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
