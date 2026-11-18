import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ClassDownloads } from "./ClassDownloads";

const meta = {
  title: "JVM/ClassDownloads",
  component: ClassDownloads,
  args: {
    qualifiedName: "com.example.orders.OrderService",
    source: "package com.example.orders;\n\npublic class OrderService {}\n",
    loadBytecode: async () => "yv66vgAAAEEAEQ==",
  },
} satisfies Meta<typeof ClassDownloads>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const NoClass: Story = {
  args: { qualifiedName: "", source: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Download .class" })).toBeDisabled();
  },
};
