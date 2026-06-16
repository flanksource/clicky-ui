import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)", disabled: true },
];

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Thin wrapper over a native `<select>` with the shared control chrome and a chevron adornment. Pass `options` for the common case or `children` (`<option>`/`<optgroup>`) for full control. For a searchable popover use `Combobox`.",
      },
    },
  },
  argTypes: {
    placeholder: { control: "text", description: "Disabled leading option shown when value is empty." },
    disabled: { control: "boolean" },
    options: { control: false },
  },
  args: {
    options: REGIONS,
    placeholder: "Select a region",
    defaultValue: "",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = { args: { defaultValue: "us-west-2" } };

export const Disabled: Story = { args: { disabled: true, defaultValue: "us-east-1" } };

export const WithChildren: Story = {
  args: { options: undefined, placeholder: undefined, defaultValue: "json" },
  render: (args) => (
    <Select {...args}>
      <optgroup label="Structured">
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
      </optgroup>
      <optgroup label="Tabular">
        <option value="csv">CSV</option>
      </optgroup>
    </Select>
  ),
};
