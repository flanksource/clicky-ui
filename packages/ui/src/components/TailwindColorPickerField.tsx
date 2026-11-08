import type { TailwindPickerFieldProps } from "./tailwind-picker-types";
import { TailwindPickerField } from "./TailwindPickerField";
import { tailwindColorOptions } from "./tailwind-picker-options";

export type TailwindColorPickerFieldProps = TailwindPickerFieldProps & {
  utility?: "bg" | "text" | "fill" | "stroke" | "border";
  resolveColor?: (color: string) => string;
};

export function TailwindColorPickerField({ utility = "bg", resolveColor, ...props }: TailwindColorPickerFieldProps) {
  const options = tailwindColorOptions(utility).map(option => ({ ...option, ...(option.color && resolveColor ? { color: resolveColor(option.color) } : {}) }));
  const color = props.value.kind === "literal" ? String(props.value.value) : options.find(option => option.value === props.value.value)?.color;
  return <TailwindPickerField {...props} options={options} prefix={<span className="relative size-5">
    <svg aria-hidden="true" className="size-5 rounded border border-border" viewBox="0 0 16 16"><rect width="16" height="16" rx="2" fill={color === "" || color === undefined ? "transparent" : color} /></svg>
    <input type="color" aria-label={`${props.ariaLabel} color picker`} value={color && /^#[0-9a-f]{6}$/i.test(color) ? color : "#000000"} disabled={props.disabled === true} className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed" onChange={event => props.onChange({ kind: "literal", value: event.target.value })} />
  </span>} />;
}
