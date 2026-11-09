import type { ReactNode } from "react";
import {
  FieldClearButton,
  type ClearableFieldProps,
} from "./field-clear-button";

export function ClearableFieldGroup({
  children,
  clearable,
  onClear,
  clearLabel,
}: ClearableFieldProps & { children: ReactNode }) {
  if (!clearable) return children;
  return (
    <div
      data-clearable-field
      className="relative min-w-0 rounded-md border border-input bg-background p-2 pt-9"
    >
      <span className="absolute right-1 top-1">
        <FieldClearButton
          {...(onClear ? { onClear } : {})}
          {...(clearLabel ? { clearLabel } : {})}
        />
      </span>
      {children}
    </div>
  );
}
