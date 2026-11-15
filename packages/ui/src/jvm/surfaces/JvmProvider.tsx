import { useMemo, type ReactNode } from "react";
import type { JvmDiagnosticsClient } from "../protocol/client";
import { jvmKeys } from "../protocol/query-keys";
import { JvmContext } from "./jvm-context";

export type JvmProviderProps = {
  client: JvmDiagnosticsClient;
  /** Opaque identity of the JVM (agent id, deployment, …); namespaces the query cache. */
  scope: string;
  children: ReactNode;
};

/** Supplies the JVM every surface below talks to. Needs a react-query `QueryClientProvider` above it. */
export function JvmProvider({ client, scope, children }: JvmProviderProps) {
  const value = useMemo(() => ({ client, scope, keys: jvmKeys(scope) }), [client, scope]);
  return <JvmContext.Provider value={value}>{children}</JvmContext.Provider>;
}
