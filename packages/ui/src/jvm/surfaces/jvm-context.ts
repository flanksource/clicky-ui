import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import type { JvmDiagnosticsClient } from "../protocol/client";
import type { jvmKeys } from "../protocol/query-keys";

export type JvmContextValue = {
  client: JvmDiagnosticsClient;
  /** Opaque identity of the JVM (agent id, deployment, …); namespaces the query cache. */
  scope: string;
  keys: ReturnType<typeof jvmKeys>;
};

export const JvmContext = createContext<JvmContextValue | null>(null);

export function useJvm(): JvmContextValue {
  const value = useContext(JvmContext);
  if (!value) throw new Error("useJvm must be used inside a <JvmProvider>");
  return value;
}

/** The agent's runtime capabilities, refreshed every 10s. */
export function useJvmStatus() {
  const { client, keys } = useJvm();
  return useQuery({ queryKey: keys.status, queryFn: ({ signal }) => client.status({ signal }), refetchInterval: 10_000 });
}
