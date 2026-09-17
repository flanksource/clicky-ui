export const COPY_STATUS_RESET_MS = 2000;
export const GAUGE_RADIUS = 15;
export const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export function contextBarTone(pct: number): string {
  return pct > 80
    ? "bg-red-600 [[data-theme=dark]_&]:bg-red-400"
    : pct > 50
      ? "bg-amber-700 [[data-theme=dark]_&]:bg-amber-400"
      : "bg-emerald-600 [[data-theme=dark]_&]:bg-emerald-400";
}

export function contextRingTone(pct: number): string {
  return pct > 80
    ? "text-red-600 [[data-theme=dark]_&]:text-red-400"
    : pct > 50
      ? "text-amber-700 [[data-theme=dark]_&]:text-amber-400"
      : "text-emerald-600 [[data-theme=dark]_&]:text-emerald-400";
}

export function contextTextTone(pct: number): string {
  return pct > 80
    ? "text-red-700 [[data-theme=dark]_&]:text-red-400"
    : pct > 50
      ? "text-amber-700 [[data-theme=dark]_&]:text-amber-400"
      : "text-emerald-700 [[data-theme=dark]_&]:text-emerald-400";
}
