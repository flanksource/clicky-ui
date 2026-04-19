import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DiagnosticsDetailPanel } from "./DiagnosticsDetailPanel";
import { DiagnosticsTree } from "./DiagnosticsTree";
import { findProcessByPID } from "./utils";
import { sampleProcessTree } from "./fixtures";
import type { ProcessNode } from "./types";

const meta: Meta<typeof DiagnosticsDetailPanel> = {
  title: "Data/Diagnostics/DetailPanel",
  component: DiagnosticsDetailPanel,
};

export default meta;
type Story = StoryObj<typeof DiagnosticsDetailPanel>;

export const WithTree: Story = {
  render: () => {
    const [pid, setPid] = useState<number | null>(1);
    const selected: ProcessNode | null = findProcessByPID(sampleProcessTree, pid ?? -1);
    return (
      <div className="flex gap-density-4 h-[560px]">
        <div className="w-[360px] border border-border rounded-md overflow-auto">
          <DiagnosticsTree root={sampleProcessTree} selectedPid={pid} onSelect={setPid} />
        </div>
        <div className="flex-1 min-w-0 border border-border rounded-md">
          <DiagnosticsDetailPanel process={selected} />
        </div>
      </div>
    );
  },
};

export const NoProcessSelected: Story = {
  render: () => (
    <div className="h-[320px] border border-border rounded-md">
      <DiagnosticsDetailPanel process={null} />
    </div>
  ),
};

export const AwaitingStack: Story = {
  render: () => (
    <div className="h-[480px] border border-border rounded-md">
      <DiagnosticsDetailPanel
        process={{ ...sampleProcessTree, stack_capture: undefined }}
        collectBusy={false}
        onCollectStack={async () => {}}
      />
    </div>
  ),
};
