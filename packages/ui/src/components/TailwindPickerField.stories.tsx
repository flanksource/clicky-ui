import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TailwindColorPickerField } from "./TailwindColorPickerField";
import { TailwindNumberPickerField } from "./TailwindNumberPickerField";
import type { TailwindPickerValue } from "./tailwind-picker-types";

const meta = { title: "Forms/Tailwind pickers", component: TailwindColorPickerField, tags: ["autodocs"] } satisfies Meta<typeof TailwindColorPickerField>;
export default meta;
type Story = StoryObj<typeof meta>;

function PickerExample() {
  const [color, setColor] = useState<TailwindPickerValue>({ kind: "literal", value: "#326ce5" });
  const [size, setSize] = useState<TailwindPickerValue>({ kind: "utility", value: "text-sm" });
  const [opacity, setOpacity] = useState<TailwindPickerValue>({ kind: "literal", value: 0.75 });
  return <div className="grid w-full max-w-lg gap-density-3">
    <label htmlFor="tailwind-fill">Fill</label>
    <TailwindColorPickerField id="tailwind-fill" ariaLabel="Fill" utility="fill" value={color} onChange={setColor} onReset={() => setColor({ kind: "literal", value: "" })} />
    <label htmlFor="tailwind-size">Font size</label>
    <TailwindNumberPickerField id="tailwind-size" ariaLabel="Font size" property="fontSize" value={size} onChange={setSize} />
    <label htmlFor="tailwind-opacity">Opacity</label>
    <TailwindNumberPickerField id="tailwind-opacity" ariaLabel="Opacity" property="opacity" value={opacity} onChange={setOpacity} />
    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify({ color, size, opacity }, null, 2)}</pre>
  </div>;
}

export const CombinedFields: Story = { render: () => <PickerExample /> };
