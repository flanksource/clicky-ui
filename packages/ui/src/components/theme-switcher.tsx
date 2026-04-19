import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { useTheme, type Theme } from "../hooks/use-theme";

const THEMES: Theme[] = ["light", "dark", "system"];

export type ThemeSwitcherProps = HTMLAttributes<HTMLDivElement>;

export const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ className, ...props }, ref) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          "inline-flex items-center gap-density-1 rounded-md border border-input bg-background p-density-1",
          className,
        )}
        {...props}
      >
        {THEMES.map((t) => {
          const active = theme === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              data-active={active || undefined}
              onClick={() => setTheme(t)}
              className={cn(
                "inline-flex h-control-h items-center justify-center rounded-sm px-density-3 text-sm capitalize transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {t}
            </button>
          );
        })}
        <span className="ml-density-2 text-xs text-muted-foreground">
          resolved: <span data-testid="resolved-theme">{resolvedTheme}</span>
        </span>
      </div>
    );
  },
);
ThemeSwitcher.displayName = "ThemeSwitcher";
