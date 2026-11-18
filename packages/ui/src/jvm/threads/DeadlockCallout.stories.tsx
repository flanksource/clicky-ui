import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { THREADS } from "../fixtures/threads";
import { DeadlockCallout } from "./DeadlockCallout";

const meta = {
  title: "JVM/DeadlockCallout",
  component: DeadlockCallout,
  args: { deadlocked: [22, 23], threads: THREADS, onSelect: fn() },
} satisfies Meta<typeof DeadlockCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoThreads: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("2 threads are each waiting");
    await userEvent.click(canvas.getByRole("button", { name: "http-nio-8080-exec-2" }));
    await expect(args.onSelect).toHaveBeenCalledWith(22);
  },
};

export const ThreadMissingFromSnapshot: Story = {
  args: { deadlocked: [22, 99] },
};
