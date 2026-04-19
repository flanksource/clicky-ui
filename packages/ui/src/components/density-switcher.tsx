import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { useDensity, type Density } from "../hooks/use-density";

const DENSITIES: Density[] = ["compact", "comfortable", "spacious"];

export type DensitySwitcherProps = HTMLAttributes<HTMLDivElement>;

export const DensitySwitcher = forwardRef<HTMLDivElement, DensitySwitcherProps>(
  ({ className, ...props }, ref) => {
    const { density, setDensity } = useDensity();
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Density"
        className={cn(
          "inline-flex items-center gap-density-1 rounded-md border border-input bg-background p-density-1",
          className,
        )}
        {...props}
      >
        {DENSITIES.map((d) => {
          const active = density === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={active}
              data-active={active || undefined}
              onClick={() => setDensity(d)}
              className={cn(
                "inline-flex h-control-h items-center justify-center rounded-sm px-density-3 text-sm capitalize transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    );
  },
);
DensitySwitcher.displayName = "DensitySwitcher";
