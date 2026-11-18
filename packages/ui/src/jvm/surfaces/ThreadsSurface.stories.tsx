import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import { THREADS, recursiveThreadText } from "../fixtures/threads";
import type { JvmDiagnosticsClient } from "../protocol/client";
import { JvmProvider } from "./JvmProvider";
import { ThreadsSurface, type ThreadsSurfaceProps, type ThreadsSurfaceState } from "./ThreadsSurface";

type Args = Partial<Omit<ThreadsSurfaceProps, "state" | "onStateChange">> & { initial: ThreadsSurfaceState; recursion?: boolean };

function Demo({ initial, recursion = false, ...props }: Args) {
  const [client] = useState<JvmDiagnosticsClient>(() => {
    const base = fakeJvmClient();
    const worker = THREADS.find((thread) => thread.id === 21);
    if (!recursion || !worker) return base;
    return { ...base, threadStack: async (id) => (id === 21 ? { thread: worker, text: recursiveThreadText(worker, 150), frames: [] } : base.threadStack(id)) };
  });
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [state, setState] = useState(initial);
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[680px]">
          <ThreadsSurface state={state} onStateChange={setState} {...props} />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/ThreadsSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { initial: {} },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Deadlock");
    await expect(canvas.getByText("Select a thread to read its stack.")).toBeInTheDocument();
  },
};

export const DeadlockedThreadSelected: Story = {
  args: { initial: { thread: "22" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "http-nio-8080-exec-2" })).toBeInTheDocument();
    await userEvent.click(within(canvas.getByRole("alert")).getByRole("button", { name: "http-nio-8080-exec-3" }));
    await expect(await canvas.findByRole("heading", { name: "http-nio-8080-exec-3" })).toBeInTheDocument();
  },
};

export const RecursionFolded: Story = {
  args: { initial: { thread: "21" }, recursion: true },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/block repeats 150× on this stack/)).toBeInTheDocument();
  },
};

export const FilteredToBlocked: Story = {
  args: { initial: { states: "BLOCKED", sort: "name" } },
};

export const HostSlots: Story = {
  args: {
    initial: { thread: "21" },
    rowExtra: (thread) => (thread.cpuPercent !== null && thread.cpuPercent > 10 ? <span>hot thread</span> : null),
    toolbarActions: <button type="button" className="rounded border border-border px-2 text-[11px]">Analyze</button>,
    renderDetailExtra: (stack) => <p className="rounded border border-border bg-muted/30 p-2">Host analysis of {stack.thread.name}</p>,
  },
};

export const WithoutDownloads: Story = {
  args: { initial: { thread: "21" }, canDownload: false },
};
