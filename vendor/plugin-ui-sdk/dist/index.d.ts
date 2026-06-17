export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;
export type ConnectionMode = "pass-through" | "proxy";
export type PluginComponentType = "panel" | "table" | "timeseries" | "action";
export type PluginInvokeOptions = Omit<RequestInit, "body"> & {
  /** Use Mission Control's /proxy/:operation endpoint instead of /invoke/:operation. */
  proxy?: boolean;
};
export type MissionControlPluginClientOptions = {
  mode: ConnectionMode;
  baseUrl: string;
  fetch?: typeof fetch;
  EventSource?: typeof EventSource;
};
export type MissionControlPluginClient = {
  mode: ConnectionMode;
  baseUrl: string;
  New(pluginRef: string, configId?: string): MissionControlPluginInstance;
};
export type MissionControlPluginInstance = {
  pluginRef: string;
  configId?: string;
  invoke(operation: string, bodyOrQueryParams?: unknown, options?: PluginInvokeOptions): Promise<Response>;
  stream(operation: string, query?: QueryParams): EventSource;
};
export type PluginManifest = {
  ref: string;
  name: string;
  version?: string;
  description?: string;
  operations?: PluginOperation[];
  components?: PluginComponent[];
};
export type PluginOperation = {
  name: string;
  method?: "GET" | "POST";
  streaming?: boolean;
  inputSchema?: unknown;
  outputSchema?: unknown;
};
export type PluginComponent = {
  name: string;
  type: PluginComponentType;
  operation?: string;
};
/** Creates a Mission Control plugin client. */
export declare function createMissionControlPluginClient(options: MissionControlPluginClientOptions): MissionControlPluginClient;
export declare const createMissionControlClient: typeof createMissionControlPluginClient;
