import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DiagnosticsTree } from "./DiagnosticsTree";
import { sampleProcessTree } from "./fixtures";

const meta: Meta<typeof DiagnosticsTree> = {
  title: "Data/Diagnostics/Tree",
  component: DiagnosticsTree,
  parameters: {
    docs: {
      description: {
        component:
          "Process-tree browser for diagnostics captures. It highlights the selected process, shows pid/status/cpu/memory, and delegates hierarchy/search behavior to Tree.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DiagnosticsTree>;

export const Default: Story = {
  render: () => {
    const [pid, setPid] = useState<number | null>(null);
    return (
      <div className="w-[640px]">
        <DiagnosticsTree root={sampleProcessTree} selectedPid={pid} onSelect={setPid} />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => <DiagnosticsTree onSelect={() => {}} />,
};

export const SingleNode: Story = {
  render: () => (
    <DiagnosticsTree
      root={{ pid: 1, name: "lonely-proc", is_root: true, cpu_percent: 0.1 }}
      onSelect={() => {}}
    />
  ),
};
