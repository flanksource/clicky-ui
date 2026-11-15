import type { JvmPatch } from "../protocol/types";

export type PatchRowState = "patched" | "stale" | "original";

/** `stale` is a register entry whose class could not be inspected, e.g. its loader went away. */
export function patchRowState(patch: JvmPatch): PatchRowState {
  if (patch.error) return "stale";
  return patch.patched ? "patched" : "original";
}

/**
 * `~`-prefixed loader ids group several real loaders for browsing. Patching
 * "in" one is meaningless — the class lives in exactly one real loader — so
 * the agent rejects writes against them.
 */
export function isVirtualLoader(loader: string): boolean {
  return loader.trim().startsWith("~");
}

export const VIRTUAL_LOADER_REASON =
  "This loader groups several real class loaders, so it cannot be restored here. Pick the class in the loader that defines it.";

/** Whether restore and renew may be offered for the row. */
export function canRestorePatch(patch: JvmPatch): boolean {
  return patchRowState(patch) === "patched" && !isVirtualLoader(patch.loader);
}

/**
 * Milliseconds until the agent restores the original bytecode, or null when no
 * lease is scheduled. Null means the JVM keeps the patch until someone restores
 * it, so callers must render it as its own state rather than as 0.
 */
export function leaseRemainingMs(patch: JvmPatch, now: number): number | null {
  if (patch.leaseExpiresAt === undefined || patch.leaseExpiresAt === null) return null;
  return Math.max(0, patch.leaseExpiresAt - now);
}

export function formatLeaseRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export type PatchSummary = {
  patched: number;
  stale: number;
  /** Patched with no lease: nothing will restore these automatically. */
  unleased: number;
};

export function summarisePatches(patches: readonly JvmPatch[]): PatchSummary {
  const summary: PatchSummary = { patched: 0, stale: 0, unleased: 0 };
  for (const patch of patches) {
    const state = patchRowState(patch);
    if (state === "stale") summary.stale++;
    if (state !== "patched") continue;
    summary.patched++;
    if (leaseRemainingMs(patch, 0) === null) summary.unleased++;
  }
  return summary;
}

/** A restore or renewal the agent rejected. */
export type PatchFailure = { key: string; className: string; message: string };

/** Identity of a register row: the same class name can be patched in several loaders. */
export function patchKey(patch: Pick<JvmPatch, "class" | "loader">): string {
  return `${patch.loader}:${patch.class}`;
}
