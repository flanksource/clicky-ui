import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { UiRefresh } from "../../icons";
import { InlineError } from "../../rpc/InlineError";
import { LoggerLevelDialog } from "../logging/LoggerLevelDialog";
import { LoggersTable } from "../logging/LoggersTable";
import type { LoggerRow } from "../model/loggers";
import { MutationGate } from "../safety/MutationGate";
import { mutationAllowed } from "../safety/mutation-allowed";
import { useJvm, useJvmStatus } from "./jvm-context";

/** URL-shaped state the host persists (search params, router state, …). */
export type LoggingSurfaceState = { q?: string };

export type LoggingSurfaceProps = {
  state: LoggingSurfaceState;
  onStateChange: (next: LoggingSurfaceState) => void;
  /** The host lets this operator change the JVM. Default true. */
  canMutate?: boolean;
  /** Ask the operator to opt in before writes. Default true. */
  requireConsent?: boolean;
  className?: string;
};

/** java.util.logging loggers of the JVM in scope: filter them and change a logger's level. */
export function LoggingSurface({ state, onStateChange, canMutate = true, requireConsent = true, className }: LoggingSurfaceProps) {
  const { client, keys } = useJvm();
  const queryClient = useQueryClient();
  const status = useJvmStatus();
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState<LoggerRow>();
  const loggers = useQuery({ queryKey: keys.loggers, queryFn: ({ signal }) => client.loggers({ signal }), staleTime: 15_000 });

  if (loggers.isPending) return <Loading />;
  if (loggers.error) return <InlineError title="Logger inventory unavailable" error={loggers.error} />;

  const gate = { runtime: status.data?.allowMutation, permitted: canMutate, consent, requireConsent };
  return (
    <div className={className ?? "flex h-full min-h-0 flex-col gap-3 p-3"}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-muted-foreground">java.util.logging loggers. Choose (inherit) to use the parent&apos;s level.</p>
        <div className="ml-auto flex items-center gap-2">
          <MutationGate {...gate} label="Allow logger changes" onConsentChange={setConsent} />
          <Button size="sm" variant="outline" loading={loggers.isFetching} onClick={() => void loggers.refetch()}>
            <UiRefresh /> Refresh
          </Button>
        </div>
      </div>
      <LoggersTable loggers={loggers.data} filter={state.q ?? ""} onFilterChange={(q) => onStateChange({ ...state, q })} onEdit={setEditing} canEdit={mutationAllowed(gate)} />
      {editing ? (
        <LoggerLevelDialog
          key={editing.name}
          logger={editing}
          onClose={() => setEditing(undefined)}
          onSave={async (level) => {
            await client.setLoggerLevel({ name: editing.name, level });
            await Promise.all([queryClient.invalidateQueries({ queryKey: keys.loggers }), queryClient.invalidateQueries({ queryKey: keys.mbean("java.util.logging:type=Logging") })]);
          }}
        />
      ) : null}
    </div>
  );
}
