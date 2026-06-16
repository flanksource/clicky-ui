import type { StatusSegment } from "./StatusBreakdown";

/** Builds a StatusSegment, clamping the count to a non-negative integer. */
export function segment(key: string, label: string, count: number, className: string): StatusSegment {
  return { key, label, count: Math.max(0, count || 0), className };
}
