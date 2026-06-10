import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TestRunner } from "./TestRunner";
import { Modal } from "../../overlay/Modal";
import { Button } from "../../components/button";
import { emptyTestFilters, type TestFilters } from "./filterState";
import { filterTests } from "./status";
import { createTestRunnerRegistry } from "./adapter";
import type { Test } from "./types";
import {
  completedTests,
  largeDetailTests,
  largeTreeTests,
  runningTests,
  setupAdapter,
} from "./TestRunner.fixtures";

const meta: Meta<typeof TestRunner> = {
  title: "Data/TestRunner",
  component: TestRunner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pure-presentational test runner: a summary/filter header over a resizable tree + detail split. State and handlers flow in via props; domain rendering is pluggable through node adapters. Ported from the Gavel test runner so downstream hosts can rebase onto clicky-ui.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TestRunner>;

// A stateful host harness: TestRunner is controlled, so the story owns
// selection / filters / expand-all and applies the status filter to the tree.
function Harness({
  tests,
  done,
  adapters,
}: {
  tests: Test[];
  done: boolean;
  adapters?: ReturnType<typeof createTestRunnerRegistry>;
}) {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  const visible = filterTests(tests, filters.status, filters.framework);

  return (
    <TestRunner
      tests={visible}
      selected={selected}
      filters={filters}
      expandAll={expandAll}
      done={done}
      now={done ? undefined : 0}
      startTime={0}
      endTime={done ? 31_278 : null}
      runMeta={{ sequence: 1, kind: "initial" }}
      statusText={done ? "Test run complete" : "Running tests..."}
      onSelect={setSelected}
      onFiltersChange={setFilters}
      onExpandAllChange={setExpandAll}
      onRerun={(n) => window.alert(`Rerun ${n.name}`)}
      {...(adapters ? { adapters } : {})}
    />
  );
}

export const Default: Story = {
  render: () => (
    <div className="h-screen">
      <Harness tests={completedTests} done />
    </div>
  ),
};

export const Running: Story = {
  render: () => (
    <div className="h-screen">
      <Harness tests={runningTests} done={false} />
    </div>
  ),
};

/**
 * Registers a host adapter for "setup" nodes — custom detail body, a "Context"
 * tab, and a node action — demonstrating the extension seam that replaces the
 * wrapper-with-an-if-chain pattern hosts use today. Select the `setup` node.
 */
export const WithCustomAdapter: Story = {
  render: () => (
    <div className="h-screen">
      <Harness tests={completedTests} done adapters={createTestRunnerRegistry([setupAdapter])} />
    </div>
  ),
};

/**
 * Leaves carrying very large payloads — a deep 6×4 object, a 500-row array, and
 * an 800-line log. Select "imports 500 policy rows" to stress the JSON view and
 * confirm the detail pane scrolls independently of the tree. The failing branch
 * opens by default.
 */
export const LargePayloads: Story = {
  render: () => (
    <div className="h-screen">
      <Harness tests={largeDetailTests} done />
    </div>
  ),
};

/**
 * The runner hosted inside a Modal — the "test runner dialog shell" — at scale:
 * a very large, deeply-nested tree on the left (hundreds of nodes, so it
 * scrolls and the filter/expand controls earn their keep) and very large JSON
 * payloads + logs on the right. Each pane scrolls independently within the
 * dialog bounds.
 */
export const InsideDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-density-4">
        <Button onClick={() => setOpen(true)}>Open test results</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Test results" size="full">
          <div className="-mx-density-4 -my-density-3 h-[75vh]">
            <Harness tests={largeTreeTests} done />
          </div>
        </Modal>
      </div>
    );
  },
};
