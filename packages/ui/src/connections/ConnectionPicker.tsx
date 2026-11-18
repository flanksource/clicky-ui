import { useMemo } from "react";
import { Combobox } from "../components/Combobox";
import type { ComboboxSingleProps } from "../components/combobox-types";
import type { FieldOption } from "../components/json-schema-form-types";
import { fieldOptionToComboboxOption } from "../components/lookup-option-view";
import { Icon } from "../data/Icon";
import { UiAdd } from "../icons";
import { connectionTypeLabel, connectionTypeOfIcon } from "./connectionTypes";

/** The connection a picker's footer asks to create; `type` is absent for an any-type picker. */
export type ConnectionCreateRequest = { type?: string };

export type ConnectionPickerProps = Pick<
  ComboboxSingleProps,
  | "id"
  | "size"
  | "disabled"
  | "loading"
  | "onSearch"
  | "invalid"
  | "ariaRequired"
  | "describedBy"
  | "clearable"
  | "clearLabel"
  | "onClear"
  | "className"
> & {
  /**
   * The connections to offer, as the lookup returned them: `icon` is the type's
   * mark, `description` the endpoint, `badges` how it is reached. The picker
   * holds no connection model of its own.
   */
  options: FieldOption[];
  /** The selected connection's `connection://[namespace/]name` ref. */
  value: string;
  onChange: (ref: string) => void;
  /**
   * The connection types the field accepts (`x-connection-types`). Exactly one
   * makes a typed picker: its icon is pinned in the control, no group headers
   * and the footer creates that type. Otherwise rows group under a type header.
   */
  types?: string[];
  /** Runtime icon name per type (the connection schema's `x-enum-icons`). A type without one uses its own name. */
  typeIcons?: Record<string, string>;
  /** Display label per type (the schema's `x-enum-labels`); an absent type is title-cased. */
  typeLabels?: Record<string, string>;
  /** Shows the "New {type} connection…" footer and is called when it is clicked. Omit where connections cannot be created. */
  onCreate?: (request: ConnectionCreateRequest) => void;
};

/**
 * Picks one connection from the options a lookup returned. The value is the
 * `connection://` ref, free text is refused, and — only when `onCreate` is
 * given — the menu ends with a "New {type} connection…" footer.
 */
export function ConnectionPicker({
  options,
  value,
  onChange,
  types,
  typeIcons,
  typeLabels,
  onCreate,
  ...combobox
}: ConnectionPickerProps) {
  const type = types?.length === 1 ? types[0] : undefined;
  const comboboxOptions = useMemo(() => {
    const grouped = options.map((option) => {
      const optionType = connectionTypeOfIcon(option.icon, typeIcons);
      return {
        option,
        group: type ? undefined : (option.group ?? (optionType ? connectionTypeLabel(optionType, typeLabels) : undefined)),
      };
    });
    // Groups are contiguous runs, so gather each group's rows under its first appearance.
    const order = [...new Set(grouped.map((entry) => entry.group))];
    return order
      .flatMap((group) => grouped.filter((entry) => entry.group === group))
      .map(({ option, group }) => {
        const { group: _listed, ...row } = fieldOptionToComboboxOption(option);
        return group ? { ...row, group } : row;
      });
  }, [options, type, typeIcons, typeLabels]);
  const unlisted = value !== "" && !options.some((option) => option.value === value);
  const rows = unlisted ? [{ value, label: value, selectedLabel: value }, ...comboboxOptions] : comboboxOptions;

  const noun = type ? `${connectionTypeLabel(type, typeLabels)} connection` : "connection";
  const footer = onCreate ? (
    <button
      type="button"
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-muted/60"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onCreate(type ? { type } : {})}
    >
      <UiAdd className="size-4" />
      {`New ${noun}…`}
    </button>
  ) : undefined;

  return (
    <Combobox
      {...combobox}
      options={rows}
      value={value}
      onChange={onChange}
      allowCustomValue={false}
      placeholder={`Select a ${noun}`}
      ariaLabel={type ? `${connectionTypeLabel(type, typeLabels)} connection` : "Connection"}
      menuWidth={540}
      {...(type ? { prefix: <Icon name={typeIcons?.[type] ?? type} className="text-base" /> } : {})}
      {...(footer ? { footer } : {})}
    />
  );
}
