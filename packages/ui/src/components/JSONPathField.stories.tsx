import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { JSONPathField } from "./JSONPathField";

const SAMPLE = {
  messages: [
    {
      payload: { text: "Hello from Clicky UI" },
      destination: "DIQueue",
      "tenant-id": 7,
    },
  ],
};

function JSONPathFieldExample() {
  const [value, setValue] = useState("$.messages[0].payload");
  return (
    <div className="w-96 space-y-density-2">
      <label className="text-sm font-medium" htmlFor="json-path-story">Message body</label>
      <JSONPathField
        id="json-path-story"
        aria-label="Message body"
        json={SAMPLE}
        value={value}
        onChange={setValue}
        inputClassName="font-mono"
      />
      <p className="text-xs text-muted-foreground">Type a JSONPath or browse the uploaded sample.</p>
    </div>
  );
}

const meta = {
  title: "Controls/JSONPathField",
  component: JSONPathField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An editable JSONPath input with a tree dropdown generated from a caller-provided JSON sample. Consumers can constrain selectable nodes and project generated paths.",
      },
    },
  },
  render: () => <JSONPathFieldExample />,
} satisfies Meta<typeof JSONPathField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
