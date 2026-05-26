import { forwardRef } from "react";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";
import { useDensity, type Density } from "../hooks/use-density";
import { PhListDashesIcon, PhListIcon, PhRowsIcon } from "../data/static-icons";

const DENSITY_OPTIONS: IconMenuOption<Density>[] = [
  { value: "compact", icon: PhRowsIcon, label: "compact" },
  { value: "comfortable", icon: PhListIcon, label: "comfortable" },
  { value: "spacious", icon: PhListDashesIcon, label: "spacious" },
];

export type DensitySwitcherProps = {
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
};

export const DensitySwitcher = forwardRef<HTMLDivElement, DensitySwitcherProps>(
  ({ className, triggerClassName, menuClassName }, ref) => {
    const { density, setDensity } = useDensity();
    return (
      <IconMenuPicker<Density>
        ref={ref}
        value={density}
        onChange={setDensity}
        options={DENSITY_OPTIONS}
        ariaLabel="Density"
        className={className}
        triggerClassName={triggerClassName}
        menuClassName={menuClassName}
      />
    );
  },
);
DensitySwitcher.displayName = "DensitySwitcher";
