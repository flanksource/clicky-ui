import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { FieldClearButton, type ClearableFieldProps } from "./field-clear-button";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & ClearableFieldProps & {
  options?: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, children, clearable, onClear, clearLabel, ...props }, ref) => {
    const showClear = clearable && props.value !== undefined && props.value !== "" && !props.disabled;
    return (
      <div data-clearable-field className="relative inline-flex w-full items-center">
        <select
          ref={ref}
          className={cn(
            "h-control-h w-full appearance-none rounded-md border border-input bg-background px-control-px pr-8 text-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
            showClear && "pr-14",
          )}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {showClear && <span className="absolute inset-y-0 right-7 flex items-center"><FieldClearButton {...(onClear ? { onClear } : {})} {...(clearLabel ? { clearLabel } : {})} /></span>}
        <Icon
          icon={UiChevronDown}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
