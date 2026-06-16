import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loading, LoadingDots } from "./loading";

const meta = {
  title: "Components/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Three-dot loading indicator. `inline` sits in the flow of text/buttons; `centered` fills the space it is given and, with the default `responsive` size, scales the dots to the container via `cqmin`.",
      },
    },
  },
  argTypes: {
    size: {
      description: "Fixed dot size, or `responsive` to scale with the container.",
      control: "inline-radio",
      options: ["sm", "md", "lg", "responsive"],
      table: { defaultValue: { summary: "responsive" } },
    },
    variant: {
      description: "`inline` in-flow loader, `centered` section/page loader.",
      control: "inline-radio",
      options: ["inline", "centered"],
      table: { defaultValue: { summary: "inline" } },
    },
    label: { control: "text", description: "Optional caption beside/beneath the dots." },
  },
  args: {
    variant: "inline",
    size: "md",
    label: "Loading…",
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Loading size="sm" label="sm" />
      <Loading size="md" label="md" />
      <Loading size="lg" label="lg" />
    </div>
  ),
};

export const Centered: Story = {
  args: { variant: "centered", size: "responsive", label: "Loading dashboard…" },
  render: (args) => (
    <div className="h-64 w-96 rounded-md border border-border">
      <Loading {...args} />
    </div>
  ),
};

export const DotsOnly: Story = {
  render: () => <LoadingDots className="size-8 text-primary" />,
};
