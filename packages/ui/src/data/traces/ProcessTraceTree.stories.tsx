import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { processNodeRows, processSampleRows } from "./fixtures";
import { ProcessTraceTree } from "./ProcessTraceTree";

const meta: Meta<typeof ProcessTraceTree> = {
  title: "Data/Traces/ProcessTraceTree",
  component: ProcessTraceTree,
  parameters: {
    docs: {
      description: {
        component:
          "The process tree of a `process_tree` trace: a forest by `key` / `parentKey`, where a process whose parent was never recorded is a root. Exited processes are dimmed and show their lifetime and peak CPU/RSS; `process_samples` add a CPU sparkline per process.",
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
