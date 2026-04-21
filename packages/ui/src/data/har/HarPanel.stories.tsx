import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { HarPanel } from "./HarPanel";
import { sampleHarEntries } from "./fixtures";

const meta: Meta<typeof HarPanel> = {
  title: "Data/HarPanel",
  component: HarPanel,
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

export const Empty: Story = {
  render: () => (
    <div className="h-[240px] border border-border rounded-md">
      <HarPanel entries={[]} />
    </div>
  ),
};
