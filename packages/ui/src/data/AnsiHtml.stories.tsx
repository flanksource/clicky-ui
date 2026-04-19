import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnsiHtml } from "./AnsiHtml";

const meta: Meta<typeof AnsiHtml> = {
  title: "Data/AnsiHtml",
  component: AnsiHtml,
};

export default meta;
type Story = StoryObj<typeof AnsiHtml>;

export const Colors: Story = {
  args: {
    text: "\x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m \x1b[34mblue\x1b[0m \x1b[1mbold\x1b[0m",
  },
};

export const TestOutput: Story = {
  args: {
    text: `\x1b[32m  \u2713 passes\x1b[0m\n\x1b[31m  \u2717 fails\x1b[0m\n\x1b[33m  ! skipped\x1b[0m`,
  },
};

export const InlineSpan: Story = {
  args: {
    as: "span",
    text: 'level=\x1b[31merror\x1b[0m msg="boom"',
  },
};
