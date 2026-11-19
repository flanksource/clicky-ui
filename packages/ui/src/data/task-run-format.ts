/**
 * A run's duration for a dense list row: 850ms, 3.9s, 31s, 1m 2s, 1h 5m. One
 * decimal only below ten seconds, where it still tells two quick runs apart.
 */
export function formatTaskDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error(`formatTaskDuration: expected a non-negative duration, got ${ms}`);
  }
  const whole = Math.round(ms);
  if (whole < 1000) return `${whole}ms`;
  if (ms < 10_000) return `${Number((ms / 1000).toFixed(1))}s`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return seconds % 60 ? `${minutes}m ${seconds % 60}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
}
