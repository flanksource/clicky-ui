export const RECENT_WINDOW = 7 * 24 * 60 * 60 * 1000;

export function isRecent(activity: { updated: number; commented: number } | undefined, now = Date.now()): boolean {
  return Math.max(activity?.updated ?? 0, activity?.commented ?? 0) >= now - RECENT_WINDOW;
}
