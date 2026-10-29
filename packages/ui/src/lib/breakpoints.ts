/**
 * The one breakpoint scale for the library: Tailwind's default screens plus the
 * preset's `3xl`. Components that branch in JS (`useMediaQuery`) must phrase
 * their query through `belowBreakpoint` so the JS switch lands on the same pixel
 * as the `sm:`/`md:` classes that style the other side of it.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Matches viewports narrower than `bp` — the complement of Tailwind's `bp:` prefix. */
export function belowBreakpoint(bp: Breakpoint): string {
  return `(max-width: ${BREAKPOINTS[bp] - 1}px)`;
}

export type ViewportPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  kind: "phone" | "tablet" | "desktop";
};

/**
 * Viewports worth checking a layout at, smallest first. Each sits on a side of a
 * breakpoint that real devices land on, so sweeping the list exercises every
 * branch: 320 (smallest supported phone), 390 (current iPhone), 768 (tablet
 * portrait, exactly `md`), 844×390 (phone landscape: `md` width, phone height),
 * 1024 (tablet landscape / small laptop, exactly `lg`), then desktop widths.
 * Storybook's viewport toolbar, the kitchen-sink sweep and the e2e overflow
 * check all read this list.
 */
export const VIEWPORT_PRESETS: readonly ViewportPreset[] = [
  { id: "phone-sm", label: "Phone S", width: 320, height: 568, kind: "phone" },
  { id: "phone", label: "Phone", width: 390, height: 844, kind: "phone" },
  { id: "phone-lg", label: "Phone L", width: 430, height: 932, kind: "phone" },
  { id: "tablet", label: "Tablet", width: 768, height: 1024, kind: "tablet" },
  { id: "phone-landscape", label: "Phone landscape", width: 844, height: 390, kind: "phone" },
  { id: "tablet-landscape", label: "Tablet landscape", width: 1024, height: 768, kind: "tablet" },
  { id: "laptop", label: "Laptop", width: 1280, height: 800, kind: "desktop" },
  { id: "desktop", label: "Desktop", width: 1440, height: 900, kind: "desktop" },
  { id: "wide", label: "Wide", width: 1920, height: 1080, kind: "desktop" },
];

export function findViewportPreset(id: string | null | undefined): ViewportPreset | undefined {
  return VIEWPORT_PRESETS.find((preset) => preset.id === id);
}
