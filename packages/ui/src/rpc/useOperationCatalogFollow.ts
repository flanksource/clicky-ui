import { useMemo } from "react";
import { useLogTail, type UseLogTailResult } from "../hooks/use-log-tail";
import {
  deriveLogTailTarget,
  findSessionStartOperation,
  followSessionParams,
} from "./operationCatalogFollow";
import type { OpenAPIParameter, ResolvedOperation } from "./types";

export type OperationCatalogFollowOption = boolean
  | { mode?: "append"; maxRows?: number }
  | { mode: "reconcile"; params: Record<string, string>; maxRows?: number; onReconcile?: (sequence: number) => void }
  | undefined;

export type UseOperationCatalogFollowResult = {
  /** True when the host asked to follow (`follow` was truthy). */
  followEnabled: boolean;
  /** The `POST <listPath>/sessions` operation, once one is found. */
  sessionOperation: ResolvedOperation | undefined;
  /** `follow` was asked for but no session-start operation is advertised —
   *  the caller renders this as a loud, surface-naming error, never a
   *  silent no-op. */
  followMissing: boolean;
  tail: UseLogTailResult;
};

/**
 * Bundles OperationCatalog's `follow` wiring behind one hook call: resolving
 * whether the list operation advertises a session to follow, deriving the
 * `useLogTail` target from its path, and opening the tail with either the
 * list's filters or the stream scope supplied by a reconciling caller.
 */
export function useOperationCatalogFollow(options: {
  follow: OperationCatalogFollowOption;
  operations: ResolvedOperation[];
  listEndpoint: ResolvedOperation | undefined;
  listParameters: OpenAPIParameter[];
  effectiveFilters: Record<string, string>;
  showTable: boolean;
}): UseOperationCatalogFollowResult {
  const { follow, operations, listEndpoint, listParameters, effectiveFilters, showTable } = options;
  const followEnabled = follow === true || (typeof follow === "object" && follow !== null);
  const followMaxRows = typeof follow === "object" && follow !== null ? follow.maxRows : undefined;

  // The session-start operation is looked up in the *whole* operations list,
  // not a surface-filtered one: it is a distinct OpenAPI operation that may
  // carry no `x-clicky.surface` tag of its own, so filtering by surface
  // first would never find it.
  const sessionOperation = useMemo(
    () => (followEnabled ? findSessionStartOperation(operations, listEndpoint) : undefined),
    [followEnabled, operations, listEndpoint],
  );
  const followTarget = useMemo(
    () => (listEndpoint ? deriveLogTailTarget(listEndpoint.path) : undefined),
    [listEndpoint],
  );
  const followParams = useMemo(
    () => typeof follow === "object" && follow?.mode === "reconcile"
      ? follow.params
      : followSessionParams(listParameters, effectiveFilters),
    [follow, listParameters, effectiveFilters],
  );

  const tail = useLogTail({
    profile: followTarget?.profile ?? "",
    basePath: followTarget?.basePath,
    params: followParams,
    following: followEnabled && !!sessionOperation && !!followTarget,
    ...(followMaxRows !== undefined ? { maxRows: followMaxRows } : {}),
  });

  return {
    followEnabled,
    sessionOperation,
    followMissing: followEnabled && showTable && !sessionOperation,
    tail,
  };
}
