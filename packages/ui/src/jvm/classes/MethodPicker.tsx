import { Select } from "../../components/select";
import { methodKey, methodSignature, selectMethod } from "../model/class-fold";
import type { JvmMethodRange } from "../protocol/types";

export type MethodPickerProps = {
  /** Fully qualified name of the class the methods belong to; names its constructors. */
  forClass: string;
  methods: JvmMethodRange[];
  /** A method selector (name, or name and descriptor), or "" for the whole class. */
  value: string;
  /** Receives the exact overload selector, or "" for the whole class. */
  onChange: (selector: string) => void;
  disabled?: boolean | undefined;
};

/** Picks one method of a decompiled class to fold the source down to. */
export function MethodPicker({ forClass, methods, value, onChange, disabled = false }: MethodPickerProps) {
  const selected = selectMethod(methods, value);
  return (
    <Select
      aria-label="Jump to method"
      value={selected ? methodKey(selected) : ""}
      disabled={disabled || methods.length === 0}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Whole class</option>
      {methods.map((method) => (
        <option key={methodKey(method)} value={methodKey(method)}>
          {methodSignature(method, forClass)}
        </option>
      ))}
    </Select>
  );
}
