import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MultiSelect } from "./MultiSelect";

function MultiSelectShowcase() {
  const [value, setValue] = useState<string[]>(["healthy"]);

  return (
    <MultiSelect
      placeholder="Status"
      value={value}
      onChange={setValue}
      options={[
        { value: "healthy", label: "Healthy" },
        { value: "degraded", label: "Degraded" },
        { value: "pending", label: "Pending" },
        { value: "unknown", label: "Unknown" },
      ]}
    />
  );
}

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelectShowcase,
} satisfies Meta<typeof MultiSelectShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
