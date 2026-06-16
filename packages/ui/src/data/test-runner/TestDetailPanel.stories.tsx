import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TestDetailPanel } from "./TestDetailPanel";
import { TestRunnerProvider } from "./context";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters } from "./filterState";
import { completedTests, setupAdapter } from "./TestRunner.fixtures";
import type { Test } from "./types";

function findByPath(tests: Test[], path: string): Test | null {
  for (const t of tests) {
    if (t.route_path === path) return t;
    const found = t.children ? findByPath(t.children, path) : null;
    if (found) return found;
  }
  return null;
}

function Harness({ path, withAdapter }: { path: string; withAdapter?: boolean }) {
  const [selected, setSelected] = useState<Test | null>(() => findByPath(completedTests, path));
  return (
    <TestRunnerProvider
      value={{
        tests: completedTests,
        selected,
        done: true,
        filters: emptyTestFilters(),
        expandAll: null,
        busy: {},
        adapters: createTestRunnerRegistry(withAdapter ? [setupAdapter] : []),
        onSelect: setSelected,
        onFiltersChange: () => {},
        onExpandAllChange: () => {},
        onRerun: () => {},
      }}
    >
      <div className="h-[480px] w-[640px] overflow-hidden rounded-md border border-border">
        <TestDetailPanel />
      </div>
    </TestRunnerProvider>
  );
}

const meta = {
  title: "Data/TestRunner/TestDetailPanel",
  component: TestDetailPanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The right-hand detail pane for the selected test node: header (name, verdict, duration, rerun), tabs (failure, output, attempts, provider-supplied tabs), and the rendered body. Driven entirely by `TestRunnerProvider` state and node adapters; this story supplies a provider with a selected node.",
      },
    },
  },
  render: () => <Harness path="auth/login/bad" />,
} satisfies Meta<typeof TestDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A failed test — opens on the failure diff + stdout. */
export const FailedTest: Story = {};

/** A node matched by a host-registered adapter (custom body + Context tab). */
export const CustomAdapter: Story = {
  render: () => <Harness path="setup" withAdapter />,
};
