import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MultiSelect, type MultiSelectProps } from "./MultiSelect";

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

function MultiSelectPlayground({
  value: initialValue,
  ...args
}: MultiSelectProps) {
  const [value, setValue] = useState<string[]>(initialValue);

  return (
    <div className="space-y-3">
      <MultiSelect {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value=[{value.join(", ") || "empty"}]
      </div>
    </div>
  );
}

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  render: () => <MultiSelectShowcase />,
  args: {
    options: [
      { value: "healthy", label: "Healthy" },
      { value: "degraded", label: "Degraded" },
      { value: "pending", label: "Pending" },
    ],
    value: ["healthy"],
    placeholder: "Status",
    disabled: false,
    onChange: () => undefined,
  },
  argTypes: {
    placeholder: {
      control: "text",
      description:
        "Trigger text when nothing is selected; also labels the menu.",
      table: { category: "Appearance" },
    },
    disabled: {
      control: "boolean",
      description: "Disables opening and changing selections.",
      table: { category: "Behavior" },
    },
    value: { control: false, table: { category: "Value" } },
    options: { control: false, table: { category: "Value" } },
    onChange: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Compact controlled multi-select menu used by filters and dense table chrome.",
          "",
          "**Controlled selection**",
          "- `value` is the complete array of selected option `value`s; `onChange` receives the full next array after each toggle.",
          "- `options` carry a stable `value` and a `label` (which may be a node). Use `disabled` per option to show but block a choice.",
          "- The trigger summarizes the selection: the labels when ≤2 are selected, otherwise an `N selected` count.",
          "",
          "**Usage**",
          "```tsx",
          'const [value, setValue] = useState<string[]>(["healthy"]);',
          '<MultiSelect placeholder="Status" value={value} onChange={setValue}',
          '  options={[{ value: "healthy", label: "Healthy" }, ...]} />',
          "```",
          "",
          "Options are objects, so they aren't editable from the controls panel — the **Playground** keeps live selection state while you toggle `placeholder` and `disabled`.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => <MultiSelectPlayground {...args} />,
};
