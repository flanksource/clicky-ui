import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { processEnvFixture, processFacetSampleRows } from "./fixtures";
import { latestFacetReading } from "./process-facets";
import { ProcessFacetTable } from "./ProcessFacetTable";

const reading = (facet: "openFiles" | "sockets" | "ports" | "connections", tick = 12) =>
  latestFacetReading(
    processFacetSampleRows.filter((row) => row.tick <= tick),
    "101:100",
    facet,
  );

const meta: Meta<typeof ProcessFacetTable> = {
  title: "Data/Traces/ProcessFacetTable",
  component: ProcessFacetTable,
  args: { facet: "openFiles", reading: reading("openFiles") },
  decorators: [
    (Story) => (
      <div className="max-w-3xl rounded-md border border-border p-density-3">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "One facet of a process as the trace stored it, in a filterable table: the latest stored list of its open files, sockets, listening ports or connections (with the time that list was read), or the environment recorded on its `process_tree` node. Nothing is fetched.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProcessFacetTable>;

export const OpenFiles: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("/dev/null")).toBeInTheDocument();
  },
};

export const Sockets: Story = { args: { facet: "sockets", reading: reading("sockets", 8) } };

export const Ports: Story = { args: { facet: "ports", reading: reading("ports") } };

export const Connections: Story = { args: { facet: "connections", reading: reading("connections", 8) } };

export const EmptyAfterClosing: Story = { args: { facet: "sockets", reading: reading("sockets", 12) } };

export const NothingStored: Story = { args: { reading: undefined } };

export const Environment: Story = { args: { facet: "env", environment: processEnvFixture } };

export const EnvironmentUnreadable: Story = {
  args: { facet: "env", error: "permission denied reading the environment of pid 102" },
};
