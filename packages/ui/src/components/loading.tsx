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

// Scales with the SMALLER of the container's two dimensions (`cqmin`, enabled by
// `container-type: size` on the centered wrapper). Using `cqmin` rather than the
// width alone means a wide-but-short panel reads as small — only a genuinely
// large area (a full-page load) grows the dots. Floors at 1.25rem (20px) in
// tight panels, climbs to 2.5rem (40px) on big loads. Pure CSS — no
// ResizeObserver, SSR-safe.
//
// These are inline styles, NOT Tailwind arbitrary classes (`size-[clamp(…)]`):
// a dynamic arbitrary class only ships if the consumer's Tailwind happens to
// scan a file containing that exact literal. The moment the served component
// and the scanned `dist` diverge (e.g. a linked local checkout vs a stale
// node_modules) the class is never generated, the SVG loses its width/height,
// and `h-full` balloons it to fill the page. Inline styles resolve natively in
// every consumer regardless of their content-scan config.
const RESPONSIVE_DOT_STYLE = {
  width: "clamp(1.25rem, 18cqmin, 2.5rem)",
  height: "clamp(1.25rem, 18cqmin, 2.5rem)",
} as const;
const RESPONSIVE_LABEL_STYLE = {
  fontSize: "clamp(0.72rem, 4.5cqmin, 0.9rem)",
} as const;

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
 * `centered` fills the space it is given (`h-full` within a `min-h-32` floor) and
 * establishes a size container (`container-type: size`) so the default
 * `responsive` size scales the dots to that space via `cqmin` — small inside a
 * narrow/short panel, large on a full-page route shell that stretches it tall.
 * The `inline` variant is not a container, so a `responsive` request there
 * renders at `sm`.
 */
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = "responsive", variant = "inline", label, className, ...props }, ref) => {
    const effectiveSize =
      variant === "inline" && size === "responsive" ? "sm" : size;
    const isResponsive = effectiveSize === "responsive";
    const dotClass = isResponsive ? "" : FIXED_DOT_SIZE[effectiveSize];
    const dotStyle = isResponsive ? RESPONSIVE_DOT_STYLE : undefined;

    if (variant === "centered") {
      return (
        <div
          ref={ref}
          role="status"
          aria-label="Loading"
          className={cn(
            "flex h-full min-h-32 w-full flex-col items-center justify-center gap-3 text-muted-foreground",
            "[container-type:size]",
            className,
          )}
          {...props}
        >
          <LoadingDots className={dotClass} style={dotStyle} />
          {label != null && (
            <span
              className={isResponsive ? undefined : "text-sm"}
              style={isResponsive ? RESPONSIVE_LABEL_STYLE : undefined}
            >
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
        <LoadingDots className={dotClass} style={dotStyle} />
        {label != null && <span className="text-sm">{label}</span>}
      </div>
    );
  },
);
Loading.displayName = "Loading";
