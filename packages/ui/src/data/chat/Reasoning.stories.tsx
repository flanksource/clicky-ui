import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reasoning } from "./Reasoning";

const TEXT =
  "The user wants the pods in the default namespace. I'll call listPods with namespace=default, then summarize the names and count in the answer.";

const meta = {
  title: "Chat/Reasoning",
  component: Reasoning,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A collapsible block showing the model's reasoning (\"thinking\") trace, kept out of the way of the answer. Collapsed by default; renders nothing when `text` is empty.",
      },
    },
  },
  argTypes: { defaultOpen: { control: "boolean" } },
  args: { text: TEXT, defaultOpen: false },
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
  ),
};

export const Expanded: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
  ),
};
