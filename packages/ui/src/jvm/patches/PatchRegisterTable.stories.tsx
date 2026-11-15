import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import type { JvmPatch } from "../protocol/types";
import { PatchRegisterTable } from "./PatchRegisterTable";

const NOW = Date.parse("2026-11-15T08:00:00Z");

const PATCHES: JvmPatch[] = [
  { class: "com.example.orders.OrderService", loader: "app", patched: true, leaseExpiresAt: NOW + 125_000 },
  { class: "com.example.payments.PaymentGateway", loader: "app", patched: true },
  { class: "com.example.legacy.ReportJob", loader: "gone", patched: false, error: "class is no longer loaded" },
];

const meta = {
  title: "JVM/PatchRegisterTable",
  component: PatchRegisterTable,
  parameters: { layout: "padded" },
  args: { patches: PATCHES, now: NOW, canMutate: true, onRestore: () => {}, onRenew: () => {} },
} satisfies Meta<typeof PatchRegisterTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("in 2m 5s")).toBeInTheDocument();
    await expect(canvas.getByText("no lease")).toBeInTheDocument();
  },
};

export const WritesDisabled: Story = {
  args: { canMutate: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Restore com.example.orders.OrderService" })).toBeDisabled();
  },
};

export const RowBusy: Story = {
  args: { busyKey: "app:com.example.orders.OrderService" },
};
