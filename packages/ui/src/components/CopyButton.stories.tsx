import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CopyButton } from "./CopyButton";

const meta = {
  title: "Components/CopyButton",
  component: CopyButton,
  argTypes: {
    label: { control: "text" },
    className: { table: { disable: true } },
    iconClassName: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A borderless copy-to-clipboard icon button. Falls back to a hidden-textarea execCommand copy when the async Clipboard API is unavailable (an http origin, or an embedded WebView), and surfaces a rejected copy as 'Copy failed' rather than silently doing nothing. Pass a thunk as `value` when the payload is expensive to build.",
      },
    },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "SELECT * FROM AsPolicy", label: "Copy SQL" },
};

export const LazyValue: Story = {
  args: {
    label: "Copy report",
    value: () => `generated at ${new Date(0).toISOString()}`,
  },
};

export const Copies: Story = {
  args: { value: "copied payload", label: "Copy payload" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Headless chromium denies writeText without the clipboard-write
    // permission, so stub it and assert the affordance itself.
    const writeText = fn();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    await userEvent.click(canvas.getByRole("button", { name: "Copy payload" }));

    await expect(writeText).toHaveBeenCalledWith("copied payload");
    await expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  },
};
