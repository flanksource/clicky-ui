import { findViewportPreset } from "@flanksource/clicky-ui";

// `fit` renders the demo in place; a preset id frames it in an iframe of that
// exact size, so media queries see the preset width, not the kitchen-sink's;
// `sweep` lays every sub-desktop preset side by side.
export type ViewportMode = "fit" | "sweep" | (string & {});

export function parseViewportMode(value: string | null): ViewportMode {
  if (value === "sweep" || findViewportPreset(value)) return value as ViewportMode;
  return "fit";
}

export function frameUrl(demoId: string): string {
  return `?demo=${encodeURIComponent(demoId)}&frame=1`;
}
