import { createContext } from "react";
import type {
  MissionControlPluginClient,
  MissionControlPluginInstance,
} from "@flanksource/plugin-ui-sdk";

export type MissionControlContextValue = MissionControlPluginClient;

export type PluginScopeContextValue = MissionControlPluginInstance;

export const MissionControlContext = createContext<MissionControlContextValue | null>(null);
export const PluginScopeContext = createContext<PluginScopeContextValue | null>(null);
