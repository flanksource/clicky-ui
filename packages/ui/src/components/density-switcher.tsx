import { forwardRef } from "react";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";
import { useDensity, type Density } from "../hooks/use-density";
import { UiListDashes, UiListFlat, UiRows } from "@flanksource/icons/ui";

const DENSITY_OPTIONS: IconMenuOption<Density>[] = [
  { value: "compact", icon: UiRows, label: "compact" },
  { value: "comfortable", icon: UiListFlat, label: "comfortable" },
  { value: "spacious", icon: UiListDashes, label: "spacious" },
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
