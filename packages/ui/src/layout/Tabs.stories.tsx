import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UiBeaker, UiGraph, UiWarningCircle } from "../icons";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Layout/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Controlled tab strip built on TabButton. Defaults to the `underline` variant (the row carries a bottom border and the active tab's underline overlaps it). Render the matching panel yourself from `value`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const items = [
  { id: "overview", label: "Overview" },
  { id: "checks", label: "Checks", icon: UiBeaker, count: 6 },
  { id: "bench", label: "Bench", icon: UiGraph },
  { id: "issues", label: "Issues", icon: UiWarningCircle, count: 2, countColor: "bg-rose-500" },
];

export const Underline: Story = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>
    );
  },
};

export const Pill: Story = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} variant="pill" />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>
    );
  },
};

export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <div className="w-[480px]">
        <Tabs
          tabs={[...items.slice(0, 2), { id: "locked", label: "Locked", disabled: true }]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
