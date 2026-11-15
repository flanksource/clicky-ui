import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../components/loading";
import { InlineError } from "../../rpc/InlineError";
import { RuntimeDashboard } from "../runtime/RuntimeDashboard";
import { useJvm } from "./jvm-context";

export type RuntimeSurfaceProps = {
  /** How often the snapshot is refetched. Default 10s. */
  refetchIntervalMs?: number;
  className?: string;
};

/** Runtime, memory, garbage collection and pool snapshot of the JVM in scope. The protocol has no history, so it is refetched, not charted. */
export function RuntimeSurface({ refetchIntervalMs = 10_000, className }: RuntimeSurfaceProps) {
  const { client, keys } = useJvm();
  const metrics = useQuery({ queryKey: keys.metrics, queryFn: ({ signal }) => client.metrics({ signal }), refetchInterval: refetchIntervalMs });

  if (metrics.isPending) return <Loading />;
  if (metrics.error) return <InlineError title="JVM metrics unavailable" error={metrics.error} />;
  return <RuntimeDashboard metrics={metrics.data} onRefresh={() => void metrics.refetch()} refreshing={metrics.isFetching} className={className ?? "h-full space-y-4 overflow-auto p-3"} />;
}
