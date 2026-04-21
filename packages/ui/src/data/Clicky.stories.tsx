import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clicky } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

const meta: Meta<typeof Clicky> = {
  title: "Data/Clicky",
  component: Clicky,
};

export default meta;
type Story = StoryObj<typeof Clicky>;

export const RichDocument: Story = {
  args: {
    data: clickyFixture,
  },
};

export const JsonStringPayload: Story = {
  args: {
    data: JSON.stringify(clickyFixture),
  },
};
