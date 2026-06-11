import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type SVGProps,
} from "react";
import { cn } from "../lib/utils";

export type LoadingSize = "sm" | "md" | "lg" | "responsive";
export type LoadingVariant = "inline" | "centered";

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed size, or `responsive` (default) to scale with the container. */
  size?: LoadingSize;
  /** `inline` for a small in-flow loader, `centered` for a section/page loader. */
  variant?: LoadingVariant;
  /** Optional caption rendered beside (inline) or beneath (centered) the dots. */
  label?: ReactNode;
}

const FIXED_DOT_SIZE: Record<Exclude<LoadingSize, "responsive">, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
};

// Scales with the nearest `container-type` ancestor's inline size: floors at
// 1.5rem (24px) in tight panels, climbs to 4.5rem (72px) on full-page loads,
// interpolating smoothly between. Pure CSS — no ResizeObserver, SSR-safe.
const RESPONSIVE_DOT_SIZE = "size-[clamp(1.5rem,12cqi,4.5rem)]";
const RESPONSIVE_LABEL_SIZE = "text-[clamp(0.7rem,4cqi,0.95rem)]";

/**
 * Three bouncing dots. `fill="currentColor"` so the dots inherit the surrounding
 * theme text color (works in light and dark). Size is driven entirely by the
 * className (width + height); the viewBox keeps the 1:1 aspect.
 */
export const LoadingDots = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="4" cy="12" r="3">
        <animate
          id="clickyLoadDotA"
          fill="freeze"
          attributeName="opacity"
          begin="0;clickyLoadDotC.end-0.25s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
      <circle cx="12" cy="12" r="3" opacity="0.4">
        <animate
          fill="freeze"
          attributeName="opacity"
          begin="clickyLoadDotA.begin+0.15s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
      <circle cx="20" cy="12" r="3" opacity="0.3">
        <animate
          id="clickyLoadDotC"
          fill="freeze"
          attributeName="opacity"
          begin="clickyLoadDotA.begin+0.3s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
    </svg>
  ),
);
LoadingDots.displayName = "LoadingDots";

/**
 * Loading indicator built on the shared 3-dot animation.
 *
 * `centered` establishes a size container (`container-type: inline-size`) so the
 * default `responsive` size scales the dots to the space the loader is given —
 * small inside a narrow panel, large on a full-page route shell. The `inline`
 * variant is not a container, so a `responsive` request there renders at `sm`.
 */
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = "responsive", variant = "inline", label, className, ...props }, ref) => {
    const effectiveSize =
      variant === "inline" && size === "responsive" ? "sm" : size;
    const isResponsive = effectiveSize === "responsive";
    const dotClass = isResponsive
      ? RESPONSIVE_DOT_SIZE
      : FIXED_DOT_SIZE[effectiveSize];

    if (variant === "centered") {
      return (
        <div
          ref={ref}
          role="status"
          aria-label="Loading"
          className={cn(
            "flex min-h-32 w-full flex-col items-center justify-center gap-3 text-muted-foreground",
            "[container-type:inline-size]",
            className,
          )}
          {...props}
        >
          <LoadingDots className={dotClass} />
          {label != null && (
            <span className={cn(isResponsive ? RESPONSIVE_LABEL_SIZE : "text-sm")}>
              {label}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(
          "inline-flex items-center gap-2 text-muted-foreground",
          className,
        )}
        {...props}
      >
        <LoadingDots className={dotClass} />
        {label != null && <span className="text-sm">{label}</span>}
      </div>
    );
  },
);
Loading.displayName = "Loading";
