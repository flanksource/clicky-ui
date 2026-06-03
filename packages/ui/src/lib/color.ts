// Resolves a series/segment "color" that may be expressed either as a CSS color
// value (e.g. "#10b981", "rgb(16 185 129)", "var(--chart-3)") or as a Tailwind
// utility class (e.g. "bg-emerald-500", "text-rose-500"). Consumers that need a
// real CSS value — recharts stroke/fill, inline backgroundColor — call
// resolveCssColor; the class→value resolution is done once per class via a probe
// element and cached.

const TAILWIND_COLOR_CLASS = /^(?:bg|text|border|fill|stroke)-/;

/** True when `color` looks like a Tailwind color utility class rather than a CSS value. */
export function isTailwindColorClass(color: string): boolean {
  return TAILWIND_COLOR_CLASS.test(color.trim());
}

const computedCache = new Map<string, string>();

/**
 * Reads the rendered color of a Tailwind class by mounting an off-screen probe
 * and reading getComputedStyle. `text-`/`stroke-`/`fill-` classes resolve from
 * `color`; everything else (incl. `bg-`/`border-`) from `backgroundColor`.
 * Returns undefined when no document is available (SSR) or the property is
 * empty/transparent (so callers can fall back). No inline color is set on the
 * probe — an inline value outranks the class and would mask the class's color.
 */
function computeClassColor(cssClass: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const probe = document.createElement("span");
  probe.className = cssClass;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const usesText = /^(?:text|stroke|fill)-/.test(cssClass.trim());
  const value = usesText ? style.color : style.backgroundColor;
  document.body.removeChild(probe);
  if (!value || value === "rgba(0, 0, 0, 0)" || value === "transparent") return undefined;
  return value;
}

/**
 * Returns a usable CSS color value for `color`. CSS values pass through
 * unchanged; Tailwind color classes are resolved to their computed value
 * (memoized). Falls back to the original string when resolution is impossible
 * (SSR, unknown class) so callers still get something to render.
 */
export function resolveCssColor(color: string): string {
  if (!isTailwindColorClass(color)) return color;
  const cached = computedCache.get(color);
  if (cached !== undefined) return cached;
  const computed = computeClassColor(color) ?? color;
  computedCache.set(color, computed);
  return computed;
}
