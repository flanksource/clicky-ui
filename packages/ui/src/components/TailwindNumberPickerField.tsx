import type { TailwindPickerFieldProps } from "./tailwind-picker-types";
import { TailwindPickerField } from "./TailwindPickerField";
import { tailwindNumberOptions, type TailwindNumberProperty } from "./tailwind-picker-options";

export type TailwindNumberPickerFieldProps = TailwindPickerFieldProps & {
  property: TailwindNumberProperty;
};

export function TailwindNumberPickerField({ property, onChange, ...props }: TailwindNumberPickerFieldProps) {
  return <TailwindPickerField {...props} options={tailwindNumberOptions(property)} onChange={next => {
    if (next.kind === "literal" && typeof next.value === "string" && next.value.trim() !== "" && Number.isFinite(Number(next.value)) && String(Number(next.value)) === next.value.trim()) {
      onChange({ kind: "literal", value: Number(next.value) });
    } else onChange(next);
  }} />;
}
