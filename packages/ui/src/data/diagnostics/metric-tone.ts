import type { GaugeTone } from "../Gauge";

/** Tone of a CPU percentage: green while busy, amber from 60, red from 90. */
export function cpuTone(pct: number): GaugeTone {
  if (pct >= 90) return "danger";
  if (pct >= 60) return "warning";
  if (pct > 0) return "success";
  return "neutral";
}

/** Tone of resident memory against virtual size; neutral when either is unknown. */
export function memoryTone(rss: number | undefined, vms: number | undefined): GaugeTone {
  if (!rss || !vms) return "neutral";
  const ratio = rss / vms;
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.6) return "warning";
  return "info";
}
