import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";
import { UiRobotAi } from "../icons";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Single-select toggle group (the Gavel `Segmented` Mine / All / Bots pattern). Built on clicky density + theme tokens; keyboard-navigable with arrow keys.",
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const SCOPE_OPTIONS: SegmentedOption[] = [
  { id: "me", label: "Mine" },
  { id: "all", label: "All" },
  { id: "bots", label: "Bots", icon: UiRobotAi },
];

function Demo({ size }: { size?: "sm" | "md" }) {
  const [value, setValue] = useState("all");
  return (
    <SegmentedControl
      aria-label="Scope"
      value={value}
      onChange={setValue}
      options={SCOPE_OPTIONS}
      size={size}
    />
  );
}

export const Default: Story = { render: () => <Demo /> };

export const Small: Story = { render: () => <Demo size="sm" /> };

export const WithDisabledOption: Story = {
  render: () => {
    const [value, setValue] = useState("day");
    return (
      <SegmentedControl
        aria-label="Range"
        value={value}
        onChange={setValue}
        options={[
          { id: "hour", label: "Hour" },
          { id: "day", label: "Day" },
          { id: "week", label: "Week", disabled: true },
        ]}
      />
    );
  },
};

export const SelectAndKeyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("radio", { name: "All" });
    const mine = canvas.getByRole("radio", { name: "Mine" });

    await step("default selection is reflected via aria-checked", async () => {
      await expect(all).toHaveAttribute("aria-checked", "true");
      await expect(mine).toHaveAttribute("aria-checked", "false");
    });

    await step("clicking a segment selects it", async () => {
      await userEvent.click(mine);
      await expect(mine).toHaveAttribute("aria-checked", "true");
      await expect(all).toHaveAttribute("aria-checked", "false");
    });

    await step("arrow key moves the selection", async () => {
      mine.focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect(all).toHaveAttribute("aria-checked", "true");
    });
  },
};
