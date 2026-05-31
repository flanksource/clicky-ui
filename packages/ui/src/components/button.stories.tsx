import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Primary command button with Clicky density tokens, shadcn-style variants, optional loading state, and Radix Slot support via `asChild`.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Visual treatment for the command.",
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      description: "Button size preset. `icon` creates a square icon-only button.",
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { description: "Disable pointer and keyboard activation.", control: "boolean" },
    loading: { description: "Show spinner and disable the button while pending.", control: "boolean" },
    loadingLabel: { description: "Content shown while loading; defaults to `children`." },
    asChild: { description: "Render styles onto the child element with Radix Slot." },
    onClick: { description: "Click handler.", action: "click" },
  },
  args: { children: "Button", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = { args: { variant: "destructive" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Link: Story = { args: { variant: "link" } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true, children: "Saving" } };

export const ClickInteraction: Story = {
  args: { children: "Click me" },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: /click me/i });

    await step("button is focusable via keyboard", async () => {
      btn.focus();
      await expect(btn).toHaveFocus();
    });

    await step("click fires the handler", async () => {
      await userEvent.click(btn);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
};
