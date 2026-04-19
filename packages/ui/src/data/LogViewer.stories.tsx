import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogViewer } from "./LogViewer";

const meta: Meta<typeof LogViewer> = {
  title: "Data/LogViewer",
  component: LogViewer,
};

export default meta;
type Story = StoryObj<typeof LogViewer>;

const sample = Array.from({ length: 40 }, (_, i) => `[line ${i + 1}] processing item...`).join(
  "\n",
);

export const Default: Story = { args: { logs: sample } };

export const Short: Story = { args: { logs: "line 1\nline 2\nline 3" } };
