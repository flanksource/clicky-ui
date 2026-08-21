import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CountryPicker, type CountryPickerProps } from "./CountryPicker";

function Playground({
  initial = "",
  ...props
}: { initial?: string } & Omit<CountryPickerProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-80 space-y-3">
      <CountryPicker value={value} onChange={setValue} {...props} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/CountryPicker",
  component: CountryPicker,
  parameters: {
    docs: {
      description: {
        component:
          "A strict, searchable ISO 3166-1 alpha-2 country picker with offline SVG flags and English country names.",
      },
    },
  },
} satisfies Meta<typeof CountryPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Playground />,
};

export const Preselected: Story = {
  render: () => <Playground initial="ZA" />,
};

export const Required: Story = {
  render: () => <Playground initial="KE" required ariaRequired />,
};

export const InvalidControlledValue: Story = {
  render: () => <Playground initial="ZZ" describedBy="country-error" />,
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p id="country-error" className="mt-1 text-xs text-destructive">
          Choose an ISO 3166-1 country.
        </p>
      </div>
    ),
  ],
};
