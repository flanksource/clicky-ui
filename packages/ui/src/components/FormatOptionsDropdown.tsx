import { type ReactNode } from "react";
import { type ButtonProps } from "./button";
import { Icon } from "../data/Icon";
import { UiCheck } from "../icons";
import { SplitButton } from "./SplitButton";
import { CLICKY_FORMAT_OPTIONS, type FormatOption } from "./format-options";

export type FormatOptionsDropdownProps = {
  /** Active format value. */
  value: string;
  /** Called with the chosen format value. */
  onChange: (value: string) => void;
  /** Available formats. Defaults to the clicky output formats. */
  options?: FormatOption[];
  /** Override the primary button label. Defaults to the active option's label. */
  label?: ReactNode;
  /** Variant forwarded to the split button. */
  variant?: ButtonProps["variant"];
  /** Size forwarded to the split button. */
  size?: ButtonProps["size"];
  /** Classes applied to the wrapper. */
  className?: string;
};

export function FormatOptionsDropdown({
  value,
  onChange,
  options = CLICKY_FORMAT_OPTIONS,
  label,
  variant = "outline",
  size = "default",
  className,
}: FormatOptionsDropdownProps) {
  const active = options.find((option) => option.value === value);

  return (
    <SplitButton
      label={label ?? active?.label ?? value}
      {...(active?.icon ? { icon: active.icon } : {})}
      onClick={() => onChange(value)}
      variant={variant}
      size={size}
      title="Choose format"
      {...(className ? { className } : {})}
      menuClassName="min-w-[18rem]"
      items={options.map((option) => ({
        ...(option.icon ? { icon: option.icon } : {}),
        ...(option.description ? { title: option.description } : {}),
        label: (
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 font-medium">
              {option.label}
              {option.value === value && <Icon icon={UiCheck} className="text-xs text-muted-foreground" />}
            </span>
            {option.description && (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </span>
        ),
        onSelect: () => onChange(option.value),
      }))}
    />
  );
}
