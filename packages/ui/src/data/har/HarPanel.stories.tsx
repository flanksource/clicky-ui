import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { HarPanel } from "./HarPanel";
import { pendingHarEntry, sampleHarEntries, transportErrorHarEntry } from "./fixtures";

const meta: Meta<typeof HarPanel> = {
  title: "Data/HarPanel",
  component: HarPanel,
  args: {
    entries: sampleHarEntries,
    emptyLabel: "No HTTP traffic captured",
  },
  parameters: {
    docs: {
      description: {
        component:
          "HAR entry table for HTTP diagnostics. It filters captured requests, summarizes method/url/status/timing/size, and expands rows into request and response details. Entries flagged `_pending` render as running with a live elapsed clock; entries with `_error` render as ERR with the transport error.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HarPanel>;

export const Default: Story = {
  render: () => (
    <div className="h-[480px] border border-border rounded-md">
      <HarPanel entries={sampleHarEntries} />
    </div>
  ),
};

export const WithExternalSearch: Story = {
  render: () => {
    const [q, setQ] = useState("");
    return (
      <div className="space-y-density-2">
        <input
          className="border border-border rounded-md px-density-2 py-1 text-sm w-full"
          placeholder="Filter URL, method, or body..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="h-[440px] border border-border rounded-md">
          <HarPanel entries={sampleHarEntries} search={q} />
        </div>
      </div>
    );
  },
};

const IN_FLIGHT_FOR_MS = 40_000;
const SNAPSHOT_ELAPSED_MS = 38_500;

/**
 * One request still in flight next to completed ones. The running row's clock
 * ticks from `startedDateTime`, and the footer counts it.
 */
export const InFlight: Story = {
  name: "In flight",
  render: () => (
    <div className="h-[480px] border border-border rounded-md">
      <HarPanel
        entries={[
          ...sampleHarEntries,
          pendingHarEntry(new Date(Date.now() - IN_FLIGHT_FOR_MS), SNAPSHOT_ELAPSED_MS),
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("running")).toBeInTheDocument();
    await expect(canvas.getByText(/· 1 running$/)).toBeInTheDocument();
  },
};

/** A request that never got a response: status 0 with the transport error beside the URL. */
export const TransportError: Story = {
  name: "Transport error",
  render: () => (
    <div className="h-[480px] border border-border rounded-md">
      <HarPanel
        entries={[
          ...sampleHarEntries,
          transportErrorHarEntry(new Date(), "dial tcp 10.0.4.12:443: connection reset by peer"),
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ERR")).toBeInTheDocument();
    await expect(canvas.getByText(/connection reset by peer/)).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => (
    <div className="h-[240px] border border-border rounded-md">
      <HarPanel entries={[]} />
    </div>
  ),
};
