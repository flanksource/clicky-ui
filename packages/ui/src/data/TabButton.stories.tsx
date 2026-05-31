import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TabButton } from "./TabButton";
import { UiBeaker, UiGraph, UiWarningCircle } from "../icons";

const meta: Meta<typeof TabButton> = {
  title: "Data/TabButton",
  component: TabButton,
  args: {
    active: true,
    label: "Overview",
    count: 3,
    onClick: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact tab button with optional icon and count badge. It renders `role=\"tab\"` and keeps selection state controlled by the parent.",
      },
    },
  },
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
          icon={UiBeaker}
          count={120}
          countColor="bg-blue-500"
        />
        <TabButton
          active={active === "lint"}
          onClick={() => setActive("lint")}
          label="Lint"
          icon={UiWarningCircle}
          count={4}
          countColor="bg-yellow-500"
        />
        <TabButton
          active={active === "bench"}
          onClick={() => setActive("bench")}
          label="Benchmarks"
          icon={UiGraph}
        />
      </div>
    );
  },
};
