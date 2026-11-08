import type { ReactNode } from "react";
import { UiClose } from "../icons";
import { Button } from "./button";
import { Combobox } from "./Combobox";
import type { TailwindPickerFieldProps } from "./tailwind-picker-types";
import type { TailwindPickerOption } from "./tailwind-picker-options";

export function TailwindPickerField({ value, onChange, options, ariaLabel, id, disabled = false, size = "sm", onReset, resetLabel, prefix }: TailwindPickerFieldProps & {
  options: TailwindPickerOption[];
  prefix?: ReactNode;
}) {
  const change = (raw: string) => onChange(options.some(option => option.value === raw) ? { kind: "utility", value: raw } : { kind: "literal", value: raw });
  return <div onKeyDown={event => { if (event.key === "Escape" && event.defaultPrevented) event.stopPropagation(); }}><Combobox
    {...(id === undefined ? {} : { id })}
    ariaLabel={ariaLabel}
    size={size}
    disabled={disabled}
    required
    value={String(value.value)}
    options={options.map(({ color, ...option }) => ({ ...option, ...(color ? { trailing: <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill={color} /></svg> } : {}) }))}
    onChange={change}
    onInputValueChange={change}
    prefix={prefix}
    placeholder="Value or Tailwind class…"
    suffix={onReset ? <Button type="button" size="xs" variant="ghost" disabled={disabled} aria-label={resetLabel ?? `Reset ${ariaLabel}`} onClick={onReset}><UiClose /></Button> : undefined}
  /></div>;
}
