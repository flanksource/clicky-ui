import { useContext } from "react";
import {
  MissionControlContext,
  PluginScopeContext,
  type MissionControlContextValue,
  type PluginScopeContextValue,
} from "./context-state";

export function useMissionControl(): MissionControlContextValue {
  const client = useContext(MissionControlContext);
  if (!client) {
    throw new Error("useMissionControl must be used inside MissionControlProvider");
  }
  return client;
}

export function usePluginScope(): PluginScopeContextValue {
  const plugin = useContext(PluginScopeContext);
  if (!plugin) {
    throw new Error("usePluginScope must be used inside PluginScope");
  }
  return plugin;
}
