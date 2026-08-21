import { countries } from "country-flag-icons";

export type CountryOption = {
  code: string;
  name: string;
};

const NON_ISO_CODES = new Set(["AC", "EU", "IC", "TA", "XA", "XC", "XK", "XO"]);
const displayNames = new Intl.DisplayNames(["en"], {
  type: "region",
  fallback: "none",
});

export const COUNTRY_OPTIONS: readonly CountryOption[] = countries
  .filter((code) => /^[A-Z]{2}$/.test(code) && !NON_ISO_CODES.has(code))
  .map((code) => {
    const name = displayNames.of(code);
    if (!name) {
      throw new Error(
        `No English country name is available for ISO 3166-1 code "${code}"`,
      );
    }
    return { code, name };
  })
  .sort((left, right) => left.name.localeCompare(right.name, "en"));

const countryByCode = new Map(
  COUNTRY_OPTIONS.map((option) => [option.code, option]),
);

export function isCountryCode(value: string): boolean {
  return countryByCode.has(value);
}

export function getCountryOption(value: string): CountryOption {
  const option = countryByCode.get(value);
  if (!option) {
    throw new Error(`Invalid ISO 3166-1 alpha-2 country code "${value}"`);
  }
  return option;
}
