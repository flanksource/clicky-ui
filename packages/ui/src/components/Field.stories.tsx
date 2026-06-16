import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./Field";
import { Select } from "./select";

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Generic label-over-control chrome: a label (with optional required `*`), the control, and an inline error or helper line beneath it. The same primitive `JsonSchemaForm` renders internally, exposed for hand-built forms. Pair with `useForm` for blur/submit-gated errors.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    helper: { control: "text", description: "Muted description shown when there's no error." },
    error: { control: "text", description: "Destructive validation message; replaces helper." },
    required: { control: "boolean" },
    htmlFor: { control: "text" },
  },
  args: {
    label: "Region",
    htmlFor: "region",
    required: false,
    helper: "Where your workloads are deployed.",
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

const control = (
  <Select
    id="region"
    options={[
      { value: "us-east-1", label: "US East (N. Virginia)" },
      { value: "eu-west-1", label: "EU (Ireland)" },
    ]}
  />
);

export const WithHelper: Story = {
  render: (args) => (
    <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
  ),
};

export const Required: Story = {
  args: { required: true, helper: undefined },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
  ),
};

export const WithError: Story = {
  args: { required: true, error: "Select a region to continue." },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
  ),
};
