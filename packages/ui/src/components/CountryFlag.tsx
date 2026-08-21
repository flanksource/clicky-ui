import type { ComponentType, SVGProps } from "react";
import * as flagComponents from "country-flag-icons/react/3x2";
import { cn } from "../lib/utils";
import { getCountryOption, isCountryCode } from "./country-options";

export type CountryFlagProps = {
  countryCode: string;
  className?: string;
  decorative?: boolean;
  title?: string;
};

type FlagComponent = ComponentType<SVGProps<SVGSVGElement>>;
const flags = flagComponents as Record<string, FlagComponent | undefined>;

export function CountryFlag({
  countryCode,
  className,
  decorative = false,
  title,
}: CountryFlagProps) {
  if (!isCountryCode(countryCode)) {
    throw new Error(
      `CountryFlag received invalid ISO 3166-1 alpha-2 code "${countryCode}"`,
    );
  }

  const country = getCountryOption(countryCode);
  const Flag = flags[countryCode];
  if (!Flag) {
    throw new Error(
      `No flag component is available for country code "${countryCode}"`,
    );
  }

  return (
    <Flag
      className={cn(
        "h-4 w-6 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10",
        className,
      )}
      {...(decorative
        ? { "aria-hidden": true }
        : { "aria-label": title ?? `${country.name} flag`, role: "img" })}
    />
  );
}
