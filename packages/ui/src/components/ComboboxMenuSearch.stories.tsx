import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "primary", label: "Primary database", group: "Live" },
  { value: "reporting", label: "Reporting database", group: "Live" },
  { value: "archive", label: "Archive database", group: "Historical" },
];

const meta = {
  title: "Components/Combobox/Menu filter",
  component: Combobox,
  parameters: {
    docs: {
      description: {
        component:
          "Set searchPlacement to menu to show a compact selection button with filtering inside its grouped popup. Typing leaves the selection unchanged; choose an option to commit, or dismiss to discard the search.",
      },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {
  render: () => {
    const [value, setValue] = useState("primary");
    return (
      <div className="w-64">
        <Combobox
          ariaLabel="Database"
          searchPlacement="menu"
          options={OPTIONS}
          value={value}
          onChange={setValue}
          allowCustomValue={false}
        />
      </div>
    );
  },
};
