import type { FormSize } from "./json-schema-form-size";

export type TailwindPickerValue = { kind: "literal"; value: string | number } | { kind: "utility"; value: string };
export type TailwindPickerFieldProps = {
  value: TailwindPickerValue;
  onChange: (value: TailwindPickerValue) => void;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  size?: FormSize;
  onReset?: () => void;
  resetLabel?: string;
};
