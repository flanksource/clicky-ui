import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "On/off toggle switch (`role=\"switch\"`). Density-aware — the track and knob scale with the active density.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ label }: { label?: string }) {
  const [on, setOn] = useState(false);
  return <Switch checked={on} onChange={setOn} label={label} aria-label={label ? undefined : "Toggle"} />;
}

export const Default: Story = { render: () => <Demo /> };

export const WithLabel: Story = { render: () => <Demo label="Dark mode" /> };

export const Disabled: Story = {
  render: () => <Switch checked onChange={() => {}} disabled aria-label="Locked" />,
};

export const Toggles: Story = {
  render: () => <Demo label="Notifications" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await step("starts off", async () => {
      await expect(sw).toHaveAttribute("aria-checked", "false");
    });
    await step("clicking flips it on", async () => {
      await userEvent.click(sw);
      await expect(sw).toHaveAttribute("aria-checked", "true");
    });
  },
};
