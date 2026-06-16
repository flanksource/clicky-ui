import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AcceptPicker, type AcceptPickerProps } from "./AcceptPicker";
import { ACCEPT_OPTIONS, type OperationPreviewMode } from "./accept-options";

function AcceptPickerControlled({ value: initial, previewMode: initialMode, ...args }: AcceptPickerProps) {
  const [value, setValue] = useState(initial ?? ACCEPT_OPTIONS[0]?.value ?? "");
  const [previewMode, setPreviewMode] = useState<OperationPreviewMode>(initialMode ?? "curl");
  return (
    <div className="space-y-3">
      <AcceptPicker
        {...args}
        value={value}
        onChange={setValue}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        accept={value} preview={previewMode}
      </div>
    </div>
  );
}

const meta = {
  title: "Clicky-RPC/AcceptPicker",
  component: AcceptPicker,
  tags: ["autodocs"],
  render: (args) => <AcceptPickerControlled {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "A single overflow (⋯) menu that picks the response representation (Accept header) for an operation — JSON, Clicky, raw, etc. — and the request-preview mode (cURL / CLI / hidden). The trigger shows the active format. Controlled through `value`/`onChange` and `previewMode`/`onPreviewModeChange`.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    value: { control: false },
    previewMode: { control: false },
  },
  args: { size: "md" },
} satisfies Meta<typeof AcceptPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: "sm" } };
