import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Search field with a leading magnifier and an optional trailing `⌘K` keyboard hint (the Gavel app-bar search). Controlled.",
      },
    },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: { shortcut?: string | null; placeholder?: string }) {
  const [value, setValue] = useState("");
  return (
    <div style={{ width: 440 }}>
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder={props.placeholder ?? "Search pull requests, branches, #id…"}
        shortcut={props.shortcut}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };

export const NoShortcut: Story = { render: () => <Demo shortcut={null} /> };

export const Typing: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox");

    await step("typing updates the controlled value", async () => {
      await userEvent.type(input, "faro");
      await expect(input).toHaveValue("faro");
    });
  },
};
