import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { patchKey, type PatchFailure } from "../model/patches";
import type { JvmPatch } from "../protocol/types";
import { useJvm } from "./jvm-context";

/** Seconds a lease is renewed for. */
export const RENEW_LEASE_SECONDS = 120;

function failureOf(patch: JvmPatch, error: unknown): PatchFailure {
  return { key: patchKey(patch), className: patch.class, message: error instanceof Error ? error.message : String(error) };
}

/**
 * Restore, restore-all and lease renewal against the patch register. A restore
 * puts original bytecode back, so decompiled sources cached while the class ran
 * modified bytes are invalidated along with the register.
 */
export function usePatchActions() {
  const { client, keys } = useJvm();
  const queryClient = useQueryClient();
  const [busyKey, setBusyKey] = useState<string>();
  const [restoringAll, setRestoringAll] = useState<string>();
  const [failures, setFailures] = useState<PatchFailure[]>([]);

  const refresh = useCallback(
    () => Promise.all([queryClient.invalidateQueries({ queryKey: keys.patches }), queryClient.invalidateQueries({ queryKey: keys.classSources })]),
    [queryClient, keys],
  );

  const restoreOne = useCallback((patch: JvmPatch) => client.restoreClass({ class: patch.class, loader: patch.loader }), [client]);

  const restore = useCallback(
    async (patch: JvmPatch) => {
      setBusyKey(patchKey(patch));
      setFailures([]);
      try {
        await restoreOne(patch);
      } catch (error) {
        setFailures([failureOf(patch, error)]);
      } finally {
        setBusyKey(undefined);
        await refresh();
      }
    },
    [restoreOne, refresh],
  );

  /**
   * One class at a time: a half-applied concurrent batch gives no report of which
   * half applied. A failure does not stop the rest — each class is independent.
   */
  const restoreAll = useCallback(
    async (patches: JvmPatch[]) => {
      const failed: PatchFailure[] = [];
      setFailures([]);
      try {
        for (const patch of patches) {
          setRestoringAll(patch.class);
          try {
            await restoreOne(patch);
          } catch (error) {
            failed.push(failureOf(patch, error));
          }
        }
      } finally {
        setRestoringAll(undefined);
        setFailures(failed);
        await refresh();
      }
    },
    [restoreOne, refresh],
  );

  const renew = useCallback(
    async (patch: JvmPatch) => {
      setBusyKey(patchKey(patch));
      setFailures([]);
      try {
        await client.renewClassLease({ class: patch.class, loader: patch.loader, seconds: RENEW_LEASE_SECONDS });
      } catch (error) {
        setFailures([failureOf(patch, error)]);
      } finally {
        setBusyKey(undefined);
        await queryClient.invalidateQueries({ queryKey: keys.patches });
      }
    },
    [client, queryClient, keys],
  );

  return { busyKey, restoringAll, failures, restore, restoreAll, renew };
}
