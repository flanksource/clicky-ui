import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Gauge } from "./Gauge";
import { TabButton } from "./TabButton";

const meta: Meta<typeof TabButton> = {
  title: "Data/TabButton",
  component: TabButton,
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const TabsWithCounts: Story = {
  render: () => {
    const [active, setActive] = useState("tests");
    return (
      <div className="flex gap-density-1">
        <TabButton
          active={active === "tests"}
          onClick={() => setActive("tests")}
          label="Tests"
          icon="codicon:beaker"
          count={120}
          countColor="bg-blue-500"
        />
        <TabButton
          active={active === "lint"}
          onClick={() => setActive("lint")}
          label="Lint"
          icon="codicon:warning"
          count={4}
          countColor="bg-yellow-500"
        />
        <TabButton
          active={active === "bench"}
          onClick={() => setActive("bench")}
          label="Benchmarks"
          icon="codicon:graph"
        />
      </div>
    );
  },
};

export const Gauges: StoryObj<typeof Gauge> = {
  render: () => (
    <div className="flex gap-density-3">
      <Gauge
        icon="codicon:pass"
        label="Passed"
        value={92}
        tone="success"
        subtitle="110 / 120 tests"
        meta="fresh"
      />
      <Gauge
        icon="codicon:error"
        label="Failed"
        value={3}
        tone="danger"
        subtitle="requires attention"
        meta="3m"
      />
      <Gauge
        icon="codicon:warning"
        label="Skipped"
        value={5}
        tone="warning"
        subtitle="intentionally skipped"
        meta="cached"
      />
    </div>
  ),
};
