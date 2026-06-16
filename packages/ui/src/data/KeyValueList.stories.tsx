import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeyValueList } from "./KeyValueList";

const meta = {
  title: "Data/KeyValueList",
  component: KeyValueList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A bordered, divided `<dl>` of label/value rows for compact detail panels. Items marked `hidden` are filtered out; an empty list renders `emptyMessage`. For richer rows with actions use `Properties`.",
      },
    },
  },
  argTypes: {
    items: { control: false },
    emptyMessage: { control: "text" },
  },
  args: {
    items: [
      { key: "name", label: "Name", value: "payments-api" },
      { key: "namespace", label: "Namespace", value: "prod" },
      { key: "image", label: "Image", value: <code className="font-mono text-xs">ghcr.io/acme/payments:1.4.2</code> },
      { key: "replicas", label: "Replicas", value: "3 / 3" },
      { key: "internal", label: "Internal", value: "secret", hidden: true },
    ],
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <KeyValueList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { items: [], emptyMessage: "No metadata available" },
};
