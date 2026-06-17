import { useMemo, type PropsWithChildren } from "react";
import {
  createMissionControlPluginClient,
  type ConnectionMode,
  type MissionControlPluginClient,
  type MissionControlPluginClientOptions,
  type MissionControlPluginInstance,
} from "@flanksource/plugin-ui-sdk";
import { useMissionControl } from "./context-hooks";
import { MissionControlContext, PluginScopeContext } from "./context-state";

export type MissionControlProviderProps = PropsWithChildren<
  Omit<MissionControlPluginClientOptions, "fetch" | "EventSource"> & {
    fetch?: typeof fetch;
    EventSource?: typeof EventSource;
  }
>;

export type PluginScopeProps = PropsWithChildren<{
  pluginRef: string;
  configId?: string;
}>;

export function MissionControlProvider({
  mode,
  baseUrl,
  fetch,
  EventSource,
  children,
}: MissionControlProviderProps) {
  const client = useMemo(
    () =>
      createMissionControlPluginClient({
        mode,
        baseUrl,
        ...(fetch ? { fetch } : {}),
        ...(EventSource ? { EventSource } : {}),
      }),
    [mode, baseUrl, fetch, EventSource],
  );

  return (
    <MissionControlContext.Provider value={client}>{children}</MissionControlContext.Provider>
  );
}

export function PluginScope({ pluginRef, configId, children }: PluginScopeProps) {
  const client = useMissionControl();
  const plugin = useMemo(() => client.New(pluginRef, configId), [client, pluginRef, configId]);

  return <PluginScopeContext.Provider value={plugin}>{children}</PluginScopeContext.Provider>;
}

export type { ConnectionMode, MissionControlPluginClient, MissionControlPluginInstance };
