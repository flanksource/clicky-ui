import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../components/loading";
import { InlineError } from "../../rpc/InlineError";
import { PatchRegister } from "../patches/PatchRegister";
import { useNow } from "../patches/use-now";
import type { JvmPatch } from "../protocol/types";
import { MutationGate } from "../safety/MutationGate";
import { mutationAllowed } from "../safety/mutation-allowed";
import { useJvm, useJvmStatus } from "./jvm-context";
import { usePatchActions } from "./use-patch-actions";

export type PatchesSurfaceProps = {
  /** The host lets this operator change the JVM. Default true. */
  canMutate?: boolean;
  /** Ask the operator to opt in before writes. Default true. */
  requireConsent?: boolean;
  /** Renders a class name, e.g. as a link to the host's class browser. */
  renderClassLink?: (patch: JvmPatch) => ReactNode;
  /** Appended to the empty-register message. */
  emptyHint?: ReactNode;
  className?: string;
};

/**
 * Every class the JVM runs modified bytecode for, with lease countdowns. A
 * lease expires on its own, so the register refetches every 10s.
 */
export function PatchesSurface({ canMutate = true, requireConsent = true, renderClassLink, emptyHint, className }: PatchesSurfaceProps) {
  const { client, keys } = useJvm();
  const status = useJvmStatus();
  const [consent, setConsent] = useState(false);
  const now = useNow(1000);
  const actions = usePatchActions();
  const patches = useQuery({ queryKey: keys.patches, queryFn: ({ signal }) => client.patches({ signal }), refetchInterval: 10_000 });

  if (patches.isPending) return <Loading />;
  if (patches.error) return <InlineError title="Patch register unavailable" error={patches.error} />;

  const gate = { runtime: status.data?.allowMutation, permitted: canMutate, consent, requireConsent };
  return (
    <PatchRegister
      patches={patches.data}
      now={now}
      canMutate={mutationAllowed(gate)}
      busyKey={actions.busyKey}
      restoringAll={actions.restoringAll}
      failures={actions.failures}
      onRestore={(patch) => void actions.restore(patch)}
      onRestoreAll={(restorable) => void actions.restoreAll(restorable)}
      onRenew={(patch) => void actions.renew(patch)}
      onRefresh={() => void patches.refetch()}
      refreshing={patches.isFetching}
      {...(renderClassLink ? { renderClassLink } : {})}
      {...(emptyHint ? { emptyHint } : {})}
      toolbar={<MutationGate {...gate} label="Allow patch changes" onConsentChange={setConsent} />}
      className={className ?? "flex h-full min-h-0 flex-col gap-3 p-3"}
    />
  );
}
