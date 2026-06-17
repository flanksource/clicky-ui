import { useCallback } from "react";
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { PluginInvokeOptions, QueryParams } from "@flanksource/plugin-ui-sdk";
import { usePluginScope } from "./context-hooks";

export type PluginQueryParams = Record<string, unknown>;

export type PluginQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, readonly unknown[]>,
  "queryKey" | "queryFn"
> & {
  operation: string;
  params?: PluginQueryParams;
  invoke?: PluginInvokeOptions;
};

export type PluginMutationOptions<TInput, TData> = Omit<
  UseMutationOptions<TData, Error, TInput>,
  "mutationFn"
> & {
  operation: string;
  invoke?: PluginInvokeOptions;
};

export type PluginStream = (operation: string, query?: QueryParams) => EventSource;

export function usePluginQuery<TData = unknown>({
  operation,
  params,
  invoke,
  enabled = true,
  ...options
}: PluginQueryOptions<TData>) {
  const plugin = usePluginScope();

  return useQuery<TData, Error, TData, readonly unknown[]>({
    ...options,
    enabled,
    queryKey: ["plugin", plugin.pluginRef, plugin.configId ?? "", operation, params, invoke],
    queryFn: async () => invokePluginJson<TData>(plugin, operation, params, invoke),
  });
}

export function usePluginMutation<TInput = unknown, TData = unknown>({
  operation,
  invoke,
  ...options
}: PluginMutationOptions<TInput, TData>) {
  const plugin = usePluginScope();

  return useMutation<TData, Error, TInput>({
    ...options,
    mutationFn: (input) => invokePluginJson<TData>(plugin, operation, input, invoke),
  });
}

export function usePluginStream(): PluginStream {
  const plugin = usePluginScope();
  return useCallback((operation: string, query?: QueryParams) => plugin.stream(operation, query), [plugin]);
}

export async function invokePluginJson<TData = unknown>(
  plugin: { invoke: (operation: string, body?: unknown, options?: PluginInvokeOptions) => Promise<Response> },
  operation: string,
  body?: unknown,
  options?: PluginInvokeOptions,
): Promise<TData> {
  const response = await plugin.invoke(operation, body, options);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) return undefined as TData;
  const text = await response.text();
  if (!text) return undefined as TData;
  return JSON.parse(text) as TData;
}
