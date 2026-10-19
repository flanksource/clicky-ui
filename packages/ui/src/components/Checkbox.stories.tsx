import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Native, accessible checkbox styled like `ListMenu`'s row checkboxes. Controlled: `checked` + `onChange(next)`. Name it with a visible `label` or `aria-label`.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ label }: { label?: string }) {
  const [on, setOn] = useState(false);
  return (
    <Checkbox
      checked={on}
      onChange={setOn}
      {...(label ? { label } : { "aria-label": "Select item" })}
    />
  );
}

export const Default: Story = {
  args: { checked: false, onChange: () => {} },
  render: () => <Demo />,
};

export const WithLabel: Story = {
  args: { checked: false, onChange: () => {} },
  render: () => <Demo label="Include drafts" />,
};

export const Disabled: Story = {
  args: { checked: true, onChange: () => {}, disabled: true, "aria-label": "Locked" },
};

export const Toggles: Story = {
  args: { checked: false, onChange: () => {} },
  render: () => <Demo label="Notify me" />,
  play: async ({ canvasElement, step }) => {
    const box = within(canvasElement).getByRole("checkbox", { name: "Notify me" });
    await step("starts unchecked", async () => {
      await expect(box).not.toBeChecked();
    });
    await step("clicking the label checks it", async () => {
      await userEvent.click(within(canvasElement).getByText("Notify me"));
      await expect(box).toBeChecked();
    });
  },
};
