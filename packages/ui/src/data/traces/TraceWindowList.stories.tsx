import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { goProfileRecords, httpExchangeRows, processNodeRows, stackRecords, traceWindows } from "./fixtures";
import { TraceWindowList } from "./TraceWindowList";
import type { TraceRow } from "./types";

const meta: Meta<typeof TraceWindowList> = {
  title: "Data/Traces/TraceWindowList",
  component: TraceWindowList,
  args: {
    windows: traceWindows,
    resolve: () => ({ mount: "/query/run-1" }),
    formats: (kind) => (kind === "http_proxy" ? [{ name: "har" }] : []),
    fetchRecords: async (window) =>
      (window.kind === "process_tree" ? processNodeRows : httpExchangeRows) as unknown as TraceRow[],
    exportUrl: (window, format) => `#export-${window.kind}.${format}`,
    openUrl: (window) => `#open-${window.kind}`,
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The trace windows one fixture step armed: kind, record count, summary chips, a link into the query app at that window, per-format export downloads and an inline `TraceView`. Windows of a run whose store is not served say why once. Props-only: the host resolves stores and builds the URLs.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TraceWindowList>;

export const Windows: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "View" })[1]!);
    await expect(await canvas.findByText("orphan")).toBeInTheDocument();
  },
};

export const ProfileAndStackWindows: Story = {
  args: {
    windows: [
      { kind: "goprof", stream: "step-1", run_id: "run-1", count: goProfileRecords.length, summary: { profiles: 2 } },
      { kind: "stacks", stream: "step-1", run_id: "run-1", count: stackRecords.length, summary: { checkpoints: 4 } },
    ],
    formats: (kind) => (kind === "goprof" ? [{ name: "pprof" }] : []),
    fetchRecords: async (window) => (window.kind === "goprof" ? goProfileRecords : stackRecords) as unknown as TraceRow[],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "View" })[0]!);
    await expect(await canvas.findByRole("combobox", { name: "Profile checkpoint" })).toBeInTheDocument();
  },
};

export const StoreNotServed: Story = {
  args: { resolve: () => ({ unavailable: "run-1 was pruned since this run finished" }) },
};

export const WindowReadError: Story = {
  args: { windows: [{ ...traceWindows[0]!, error: "stream step-1 not found in run-1" }, traceWindows[1]!] },
};

export const ViewerRefusesRecords: Story = {
  args: { fetchRecords: async () => [{ unexpected: true }] as TraceRow[] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "View" })[0]!);
    await expect(await canvas.findByRole("alert")).toBeInTheDocument();
  },
};
