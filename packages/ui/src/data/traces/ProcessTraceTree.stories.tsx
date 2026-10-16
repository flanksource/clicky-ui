import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { processNodeRows, processSampleRows } from "./fixtures";
import { ProcessTraceTree } from "./ProcessTraceTree";
import type { ProcessNodeRow } from "./types";

const meta: Meta<typeof ProcessTraceTree> = {
  title: "Data/Traces/ProcessTraceTree",
  component: ProcessTraceTree,
  parameters: {
    docs: {
      description: {
        component:
          "The process tree of a `process_tree` trace: a forest by `key` / `parentKey`, where a process whose parent was never recorded is a root. Exited processes are dimmed and show their lifetime and peak CPU/RSS; `process_samples` add a CPU sparkline per process. With `onHideExitedChange` a toolbar counts the processes and hides exited ones that have no live descendant; `loading` and `error` cover a trace that has not arrived.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProcessTraceTree>;

function Selectable({ withSamples }: { withSamples: boolean }) {
  const [selectedKey, setSelectedKey] = useState<string | null>("101:100");
  return (
    <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree
        nodes={processNodeRows}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        {...(withSamples ? { samples: processSampleRows } : {})}
      />
    </div>
  );
}

export const Forest: Story = {
  render: () => <Selectable withSamples={false} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("orphan")).toBeInTheDocument();
  },
};

export const WithCpuSparklines: Story = {
  render: () => <Selectable withSamples />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "CPU % over 12 samples" })).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => <ProcessTraceTree nodes={[]} onSelect={() => {}} />,
};

function HideExitedToggle({ nodes }: { nodes: ProcessNodeRow[] }) {
  const [hideExited, setHideExited] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  return (
    <div className="max-w-3xl rounded-md border border-border">
      <div className="flex gap-2 border-b border-border p-density-2 text-xs">
        <button type="button" onClick={() => setExpandAll(true)}>
          Expand all
        </button>
        <button type="button" onClick={() => setExpandAll(false)}>
          Collapse all
        </button>
      </div>
      <ProcessTraceTree
        nodes={nodes}
        samples={processSampleRows}
        onSelect={() => {}}
        hideExited={hideExited}
        onHideExitedChange={setHideExited}
        expandAll={expandAll}
      />
    </div>
  );
}

export const HideExited: Story = {
  render: () => <HideExitedToggle nodes={processNodeRows} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4 processes")).toBeInTheDocument();
    await userEvent.click(canvas.getByLabelText("Hide exited"));
    await expect(canvas.queryByText("compile")).not.toBeInTheDocument();
  },
};

export const EveryProcessExited: Story = {
  render: () => (
    <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree
        nodes={processNodeRows.map((row) => ({ ...row, status: "exited" }))}
        hideExited
        onHideExitedChange={() => {}}
        onSelect={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Every process has exited")).toBeInTheDocument();
  },
};

export const WaitingForTrace: Story = {
  render: () => (
    <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} loading onHideExitedChange={() => {}} onSelect={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Waiting for process trace…")).toBeInTheDocument();
  },
};

export const LoadError: Story = {
  render: () => (
    <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} error="trace store unreachable: connection refused" onSelect={() => {}} />
    </div>
  ),
};
