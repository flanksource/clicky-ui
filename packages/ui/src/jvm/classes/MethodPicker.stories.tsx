import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { classSourceFixture } from "../fixtures/classes";
import type { JvmMethodRange } from "../protocol/types";
import { MethodPicker } from "./MethodPicker";

const CLASS = "com.example.orders.OrderService";
const METHODS = classSourceFixture(CLASS, "6d06d69c").methods;
const OVERLOADS: JvmMethodRange[] = [
  ...METHODS,
  { name: "price", descriptor: "(Ljava/lang/String;)D", line: 25, endLine: 27 },
  { name: "price", descriptor: "(Ljava/lang/String;ILjava/util/Map;)D", line: 29, endLine: 31 },
];

function Demo({ initial, methods }: { initial: string; methods: JvmMethodRange[] }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-72">
      <MethodPicker forClass={CLASS} methods={methods} value={value} onChange={setValue} />
    </div>
  );
}

const meta = { title: "JVM/MethodPicker", component: Demo, args: { initial: "", methods: METHODS } } satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WholeClass: Story = {};

export const Selected: Story = {
  args: { initial: "checkout(Ljava/lang/String;)D" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Jump to method" })).toHaveValue("checkout(Ljava/lang/String;)D");
  },
};

export const BareNameFromLink: Story = { args: { initial: "cancel" } };

export const Overloads: Story = { args: { methods: OVERLOADS, initial: "price(Ljava/lang/String;ILjava/util/Map;)D" } };

export const NoMethods: Story = { args: { methods: [] } };
