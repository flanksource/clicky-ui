import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { METRICS } from "../fixtures/classes";
import { RuntimeInfo } from "./RuntimeInfo";

const meta = {
  title: "JVM/RuntimeInfo",
  component: RuntimeInfo,
  args: { runtime: METRICS.runtime },
} satisfies Meta<typeof RuntimeInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("21.0.5")).toBeInTheDocument();
  },
};

export const LoadUnavailable: Story = {
  args: { runtime: { ...METRICS.runtime, systemLoadAverage: -1 } },
};
