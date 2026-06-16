import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TestTree } from "./TestTree";
import { TestRunnerProvider } from "./context";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters, type TestFilters } from "./filterState";
import { completedTests } from "./TestRunner.fixtures";
import type { Test } from "./types";

const ADAPTERS = createTestRunnerRegistry([]);

function Harness() {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  return (
    <TestRunnerProvider
      value={{
        tests: completedTests,
        selected,
        done: true,
        filters,
        expandAll,
        busy: {},
        adapters: ADAPTERS,
        onSelect: setSelected,
        onFiltersChange: setFilters,
        onExpandAllChange: setExpandAll,
      }}
    >
      <div className="h-[420px] w-80 overflow-auto rounded-md border border-border">
        <TestTree />
      </div>
    </TestRunnerProvider>
  );
}

const meta = {
  title: "Data/TestRunner/TestTree",
  component: TestTree,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The test forest pane: a `Tree` of `TestTreeNode` rows with status icons, durations and selection. Reads all state (tests, selection, filters, adapters) from `TestRunnerProvider` via `useTestRunner`, so it must be rendered inside a provider (this story supplies one).",
      },
    },
  },
  render: () => <Harness />,
} satisfies Meta<typeof TestTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
