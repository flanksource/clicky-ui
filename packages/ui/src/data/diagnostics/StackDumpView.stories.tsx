import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { stackRecords } from "../traces/fixtures";
import { sampleStack } from "./fixtures";
import { StackDumpView } from "./StackDumpView";

const meta: Meta<typeof StackDumpView> = {
  title: "Data/Diagnostics/StackDumpView",
  component: StackDumpView,
  args: { text: sampleStack },
  parameters: {
    docs: {
      description: {
        component:
          "A captured stack dump: Go goroutines or JVM threads as searchable cards with state chips and a hide-runtime-only toggle, or the raw text when the format is not recognised. Used by the diagnostics panel, the process trace detail and failed-test panics.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[480px] max-w-3xl rounded-md border border-border p-density-3">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StackDumpView>;

export const GoGoroutines: Story = {
  args: { status: "ready", collectedAt: "2026-10-01T09:00:00.000Z", reason: "watchdog timeout" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/goroutines$/)).toBeInTheDocument();
  },
};

export const WithHeaderActions: Story = {
  args: {
    status: "ready",
    headerActions: (
      <button type="button" className="rounded border border-border px-2 py-1 text-[11px]">
        Refresh
      </button>
    ),
  },
};

export const JvmThreads: Story = {
  args: {
    text: `"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
\tat com.acme.billing.CycleService.process(CycleService.java:212)
\tat java.base/java.lang.Thread.run(Thread.java:840)

"main" #1 prio=5 os_prio=0 tid=0x00007f10 nid=0x101 waiting on condition [0x00007f0f]
   java.lang.Thread.State: WAITING (parking)
\tat jdk.internal.misc.Unsafe.park(Native Method)
\tat com.acme.App.main(App.java:20)
`,
  },
};

export const SingleGoroutine: Story = {
  args: {
    text: `goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
\t/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
\t/home/user/go/src/app/server/server.go:58 +0xe0
`,
    singleItem: true,
  },
};

export const RawNativeSample: Story = {
  args: {
    text: "Sampling process 4242 for 1 seconds\nCall graph:\n    1 Thread_1001  DispatchQueue_1: com.apple.main-thread\n      1 start  (in dyld)\n",
    status: "ready",
    reason: "native sample",
  },
};

const checkpoint = (id: string) => stackRecords.filter((record) => record.checkpointId === id);

export const GoroutineRecords: Story = {
  render: () => <StackDumpView records={checkpoint("ckpt-timeout")} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("3 / 3 goroutines")).toBeInTheDocument();
  },
};

export const NativeDumpRecord: Story = {
  render: () => <StackDumpView records={checkpoint("ckpt-native")} />,
};

export const FailedDumpRecord: Story = {
  render: () => <StackDumpView records={checkpoint("ckpt-exited")} />,
};

export const WithError: Story = {
  args: { error: "SIGQUIT delivered, but the dump was truncated at 1 MiB" },
};
