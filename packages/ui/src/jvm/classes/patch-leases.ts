/** How long a patch lives before the agent restores the original bytecode. */
export const LEASE_OPTIONS = [
  { seconds: 120, label: "2 minutes" },
  { seconds: 300, label: "5 minutes" },
  { seconds: 900, label: "15 minutes" },
] as const;

export const DEFAULT_LEASE_SECONDS = 900;

/** A lease as a duration phrase: "2 minutes", "1 minute", "90 seconds". */
export function leaseLabel(seconds: number): string {
  if (seconds % 60 !== 0) return `${seconds} seconds`;
  const minutes = seconds / 60;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
