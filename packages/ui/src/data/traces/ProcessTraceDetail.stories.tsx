import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { processDetailRows, processFacetSampleRows, processSampleRows, stackRecords } from "./fixtures";
import { ProcessTraceDetail } from "./ProcessTraceDetail";
import { ProcessTraceTree } from "./ProcessTraceTree";

const byKey = (key: string) => processDetailRows.find((row) => row.key === key)!;

const meta: Meta<typeof ProcessTraceDetail> = {
  title: "Data/Traces/ProcessTraceDetail",
  component: ProcessTraceDetail,
  args: { node: byKey("101:100"), samples: processSampleRows, stacks: stackRecords },
  decorators: [
    (Story) => (
      <div className="h-[640px] max-w-3xl overflow-hidden rounded-md border border-border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "One process of a `process_tree` trace: command, lifetime, resource tiles and CPU/RSS/disk sparklines from `process_samples`, and its stack from the `stacks` kind with a chooser across the checkpoints that dumped it and collect buttons for the transports the node offers (a destructive one, sigquit, asks first). Tabs for open files, sockets, ports and connections appear when the samples carry that facet and show the latest stored list with its count over time; the Environment tab reads the node.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProcessTraceDetail>;

export const BusyChildWithNativeSample: Story = {
  args: { onCollectStack: async () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Native sample")).toBeInTheDocument();
    await expect(canvas.getByText("Dump goroutines & kill")).toBeInTheDocument();
  },
};

export const RootWithCheckpointChooser: Story = {
  args: { node: byKey("100:1"), onCollectStack: async () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Stack checkpoint" }), "ckpt-periodic");
    await expect(canvas.queryByText("g22")).not.toBeInTheDocument();
  },
};

export const Collecting: Story = {
  args: { onCollectStack: async () => {}, collecting: true },
};

export const CollectFailed: Story = {
  args: { onCollectStack: async () => {}, collectError: "session not found: the run has ended" },
};

export const ExitedWithFailedDump: Story = {
  args: { node: byKey("102:101"), samples: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("the process exited before a stack could be read"),
    ).toBeInTheDocument();
  },
};

export const WithoutSamples: Story = {
  args: { node: byKey("300:299"), samples: [], stacks: [] },
};

export const WithStepLink: Story = {
  args: {
    links: (
      <section>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Step</div>
        <a href="#step" className="text-sm text-primary hover:underline">
          go test ./pkg/...
        </a>
      </section>
    ),
  },
};

export const WithDiskAndFacets: Story = {
  args: { samples: processFacetSampleRows },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Disk read over time" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "Open files" }));
    await expect(await canvas.findByText("/work/repo/pkg")).toBeInTheDocument();
  },
};

export const EnvironmentTab: Story = {
  args: { node: byKey("100:1") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Environment" }));
    await expect(await canvas.findByText("GOFLAGS")).toBeInTheDocument();
  },
};

export const NothingSelected: Story = {
  args: { node: null, samples: [] },
};

export const BesideTheTree: Story = {
  decorators: [],
  render: (args) => {
    const [selectedKey, setSelectedKey] = useState<string | null>("101:100");
    return (
      <div className="flex h-[640px] overflow-hidden rounded-md border border-border">
        <div className="w-1/2 overflow-auto border-r border-border">
          <ProcessTraceTree
            nodes={processDetailRows}
            samples={processFacetSampleRows}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProcessTraceDetail
            {...args}
            node={processDetailRows.find((row) => row.key === selectedKey) ?? null}
            samples={processFacetSampleRows}
            onCollectStack={async () => {}}
          />
        </div>
      </div>
    );
  },
};
