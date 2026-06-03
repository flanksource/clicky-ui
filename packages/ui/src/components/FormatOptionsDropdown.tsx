import { type ReactNode } from "react";
import { type ButtonProps } from "./button";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiCheck, UiComment, UiEye, UiFileCode, UiTable } from "../icons";
import { SplitButton } from "./SplitButton";

export type FormatOption = {
  /** Stable identifier emitted by `onChange`. */
  value: string;
  /** Visible label. */
  label: string;
  /** Secondary description shown in the menu. */
  description?: string;
  /** Icon rendered before the label. */
  icon?: StaticIconComponent;
};

/**
 * Clicky output formats with their label, description, and icon. Mirrors the
 * metadata in `Clicky.tsx`'s `getRemoteFormatMeta` so the format picker can live
 * as a standalone component.
 */
export const CLICKY_FORMAT_OPTIONS: FormatOption[] = [
  { value: "clicky", label: "Clicky", description: "Rendered Clicky JSON with the rich Clicky viewer", icon: UiEye },
  { value: "json", label: "JSON", description: "Plain JSON for inspecting the raw response body", icon: UiFileCode },
  { value: "yaml", label: "YAML", description: "YAML for config-friendly inspection and export", icon: UiFileCode },
  { value: "csv", label: "CSV", description: "Comma-separated values for spreadsheets and imports", icon: UiTable },
  { value: "markdown", label: "Markdown", description: "Markdown formatted for docs, comments, and chat", icon: UiFileCode },
  { value: "html", label: "HTML", description: "Browser-ready HTML preview of the formatted output", icon: UiFileCode },
  { value: "pdf", label: "PDF", description: "Portable document for sharing and printing", icon: UiFileCode },
  { value: "pretty", label: "Pretty", description: "Human-readable plain text output from the formatter", icon: UiFileCode },
  { value: "excel", label: "Excel", description: "Spreadsheet workbook for offline analysis", icon: UiTable },
  { value: "slack", label: "Slack", description: "Slack Block Kit JSON for chat-native output", icon: UiComment },
];

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
