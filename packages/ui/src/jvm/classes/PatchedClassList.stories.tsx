import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { APP_LOADER } from "../fixtures/classes";
import { PatchedClassList } from "./PatchedClassList";

const meta = {
  title: "JVM/PatchedClassList",
  component: PatchedClassList,
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: {
    onSelect: fn(),
    patches: [
      { class: "com.example.orders.OrderService", loader: APP_LOADER, patched: true, leaseExpiresAt: 1_800_000_000_000 },
      { class: "com.example.orders.Ledger", loader: APP_LOADER, patched: true },
    ],
  },
} satisfies Meta<typeof PatchedClassList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "com.example.orders.Ledger" }));
    await expect(args.onSelect).toHaveBeenCalledWith({ name: "com.example.orders.Ledger", loader: APP_LOADER });
  },
};

export const ClassInView: Story = { args: { selected: { name: "com.example.orders.OrderService", loader: APP_LOADER } } };

export const StalePatch: Story = {
  args: { patches: [{ class: "com.example.orders.Gone", loader: APP_LOADER, patched: true, error: "class is no longer loaded" }] },
};
