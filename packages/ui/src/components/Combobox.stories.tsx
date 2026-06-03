import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Combobox, type ComboboxProps } from "./Combobox";

const DATABASE_OPTIONS = [
  { value: "PrimaryDB", label: "PrimaryDB" },
  { value: "ArchiveDB", label: "ArchiveDB" },
  { value: "IVS", label: "IVS" },
  { value: "ReportServer", label: "ReportServer" },
];

function ComboboxShowcase() {
  const [value, setValue] = useState("");
  return (
    <div className="w-64">
      <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
    </div>
  );
}

function ComboboxPlayground({ value: initialValue, ...args }: ComboboxProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="w-64 space-y-3">
      <Combobox {...args} value={value} onChange={setValue} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  render: () => <ComboboxShowcase />,
  args: {
    options: DATABASE_OPTIONS,
    value: "",
    placeholder: "Select database",
    disabled: false,
    loading: false,
    onChange: () => undefined,
  },
  argTypes: {
    placeholder: { control: "text", table: { category: "Appearance" } },
    disabled: { control: "boolean", table: { category: "Behavior" } },
    required: { control: "boolean", table: { category: "Behavior" } },
    loading: { control: "boolean", table: { category: "Behavior" } },
    value: { control: false, table: { category: "Value" } },
    options: { control: false, table: { category: "Value" } },
    onChange: { control: false, table: { category: "Events" } },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => <ComboboxPlayground {...args} />,
};

export const Loading: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
  ),
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return (
      <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return (
      <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>
    );
  },
};

export const WithInlineLabel: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>
    );
  },
};

export const Strict: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64 space-y-3">
        <Combobox
          label="Database"
          placeholder="Pick one"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
          allowCustomValue={false}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-64 space-y-3">
        <Combobox
          multiple
          label="Databases"
          placeholder="Pick databases"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
          allowCustomValue={false}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};
