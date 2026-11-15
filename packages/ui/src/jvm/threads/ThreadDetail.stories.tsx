import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { THREADS, recursiveThreadText, threadStackFixture } from "../fixtures/threads";
import type { JvmThread } from "../protocol/types";
import { ThreadDetail } from "./ThreadDetail";

const byId = (id: number) => THREADS.find((thread) => thread.id === id) as JvmThread;
const blocked = byId(22);
const worker = byId(21);

const meta = {
  title: "JVM/ThreadDetail",
  component: ThreadDetail,
  decorators: [
    (Story) => (
      <div className="w-[720px] border border-border">
        <Story />
      </div>
    ),
  ],
  args: {
    threadId: 22,
    thread: blocked,
    inSnapshot: true,
    cpuTimeEnabled: true,
    stack: threadStackFixture(22),
    stackError: null,
    refreshing: false,
    onRefresh: fn(),
    onSelectThread: fn(),
    onDownloadStack: fn(),
    onDownloadDump: fn(),
  },
} satisfies Meta<typeof ThreadDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlockedOnALock: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "http-nio-8080-exec-3" }));
    await expect(args.onSelectThread).toHaveBeenCalledWith(23);
  },
};

export const DeepRecursionFolded: Story = {
  args: { threadId: 21, thread: worker, stack: { thread: worker, text: recursiveThreadText(worker, 150), frames: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/block repeats 150× on this stack/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Show all 302 frames/ }));
    await expect(canvas.getByRole("button", { name: "Fold repeats" })).toBeInTheDocument();
  },
};

export const ThreadHasEnded: Story = {
  args: { inSnapshot: false },
};

export const LoadingStack: Story = {
  args: { stack: undefined },
};

export const StackFailed: Story = {
  args: { stack: undefined, stackError: new Error("java.lang.IllegalStateException: Thread 22 has ended") },
};

export const HostStackAndAnalysis: Story = {
  args: {
    extra: <p className="rounded border border-border bg-muted/30 p-2">Host analysis: this thread waits on Inventory, held by exec-3.</p>,
    renderStack: (stack) => <pre className="rounded border border-border p-2 font-mono text-[11px]">{stack.text}</pre>,
  },
};

export const NoDownloads: Story = {
  render: ({ onDownloadStack: _stack, onDownloadDump: _dump, ...args }) => <ThreadDetail {...args} />,
};
