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
  args: {
    process: sampleProcessTree,
    collectBusy: false,
    onCollectStack: async () => {},
  },
  argTypes: {
    onCollectStack: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Detail panel for a selected process diagnostics node. It shows process metadata, run metadata, collection actions, stack summaries, and searchable stack/thread detail.",
      },
    },
  },
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
  args: {
    process: null,
  },
  render: (args) => (
    <div className="h-[320px] border border-border rounded-md">
      <DiagnosticsDetailPanel {...args} />
    </div>
  ),
};

const singleThreadDump = `"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
\tat com.acme.billing.CycleService.process(CycleService.java:212)
\tat com.acme.billing.CycleService.run(CycleService.java:88)
\tat java.base/java.lang.Thread.run(Thread.java:840)
`;

const singleThreadProcess: ProcessNode = {
  pid: 41,
  name: "http-nio-8080-exec-7",
  status: "RUNNABLE",
  cpu_percent: 8.2,
  is_root: false,
  stack_capture: {
    status: "ready",
    text: singleThreadDump,
    collected_at: new Date().toISOString(),
  },
};

export const SingleThread: Story = {
  args: {
    process: singleThreadProcess,
    singleItem: true,
    collectBusy: false,
    onCollectStack: async () => {},
    headerActions: (
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent">
          ⚙ Decompile
        </button>
        <button className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent">
          ⭳ Download stack
        </button>
      </div>
    ),
  },
  render: (args) => (
    <div className="h-[480px] border border-border rounded-md">
      <DiagnosticsDetailPanel {...args} />
    </div>
  ),
};

export const AwaitingStack: Story = {
  args: {
    process: { ...sampleProcessTree, stack_capture: undefined },
    collectBusy: false,
    onCollectStack: async () => {},
  },
  render: (args) => (
    <div className="h-[480px] border border-border rounded-md">
      <DiagnosticsDetailPanel {...args} />
    </div>
  ),
};
