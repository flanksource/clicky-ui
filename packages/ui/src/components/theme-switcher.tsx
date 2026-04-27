import { forwardRef } from "react";
import { Icon } from "../data/Icon";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";
import { useTheme, type Theme } from "../hooks/use-theme";

const THEME_OPTIONS: IconMenuOption<Theme>[] = [
  { value: "light", icon: "ph:sun", label: "light" },
  { value: "dark", icon: "ph:moon", label: "dark" },
  { value: "system", icon: "ph:desktop", label: "system" },
];

export type ThemeSwitcherProps = {
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
};

export const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ className, triggerClassName, menuClassName }, ref) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const footer =
      theme === "system" ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon name={resolvedTheme === "dark" ? "ph:moon" : "ph:sun"} width={12} height={12} />
          <span>
            resolves to{" "}
            <span data-testid="resolved-theme" className="font-medium text-foreground">
              {resolvedTheme}
            </span>
          </span>
        </span>
      ) : null;
    return (
      <IconMenuPicker<Theme>
        ref={ref}
        value={theme}
        onChange={setTheme}
        options={THEME_OPTIONS}
        ariaLabel="Theme"
        footer={footer}
        className={className}
        triggerClassName={triggerClassName}
        menuClassName={menuClassName}
      />
    );
  },
);
ThemeSwitcher.displayName = "ThemeSwitcher";
