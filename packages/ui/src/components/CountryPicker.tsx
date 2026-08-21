import {
  Combobox,
  type ComboboxOption,
  type ComboboxSingleProps,
} from "./Combobox";
import { CountryFlag } from "./CountryFlag";
import { COUNTRY_OPTIONS, isCountryCode } from "./country-options";

export type CountryPickerProps = Omit<
  ComboboxSingleProps,
  | "allowCustomValue"
  | "loading"
  | "multiple"
  | "onCreate"
  | "onNew"
  | "onSearch"
  | "options"
  | "prefix"
  | "tristate"
>;

const options: ComboboxOption[] = COUNTRY_OPTIONS.map(({ code, name }) => ({
  value: code,
  label: name,
  description: code,
  selectedLabel: `${name} · ${code}`,
  icon: <CountryFlag countryCode={code} decorative />,
}));

export function CountryPicker({
  ariaLabel = "Country",
  invalid = false,
  placeholder = "Search country or code…",
  value,
  ...props
}: CountryPickerProps) {
  return (
    <Combobox
      {...props}
      value={value}
      options={options}
      ariaLabel={ariaLabel}
      allowCustomValue={false}
      invalid={invalid || (!!value && !isCountryCode(value))}
      placeholder={placeholder}
    />
  );
}
