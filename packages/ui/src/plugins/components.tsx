import { useMemo } from "react";
import { DataTable, type DataTableColumnInput, type DataTableProps } from "../data/DataTable";
import {
  TimeseriesPanel,
  type TimeseriesPanelProps,
  type TimeseriesResponse,
} from "../data/TimeseriesPanel";
import { usePluginScope } from "./context-hooks";
import { invokePluginJson, usePluginQuery } from "./hooks";

export type PluginDataTableProps<T extends Record<string, unknown>> = Omit<
  DataTableProps<T>,
  "data" | "columns" | "loading"
> & {
  operation: string;
  params?: Record<string, unknown>;
  columns: Array<DataTableColumnInput<T>>;
  data?: T[];
  loading?: boolean;
  refetchInterval?: number | false;
};

export function PluginDataTable<T extends Record<string, unknown>>({
  operation,
  params,
  columns,
  data,
  loading,
  refetchInterval,
  ...props
}: PluginDataTableProps<T>) {
  const query = usePluginQuery<T[]>({
    operation,
    ...(params ? { params } : {}),
    ...(refetchInterval !== undefined ? { refetchInterval } : {}),
    enabled: data === undefined,
    retry: 0,
  });

  return (
    <DataTable
      {...props}
      data={data ?? query.data ?? []}
      columns={columns}
      loading={loading ?? query.isLoading}
    />
  );
}

export type PluginTimeseriesPanelProps = Omit<TimeseriesPanelProps, "url" | "fetcher"> & {
  operation?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
};

export function PluginTimeseriesPanel({
  operation,
  params,
  series,
  baseUrl,
  ...props
}: PluginTimeseriesPanelProps) {
  const plugin = usePluginScope();
  const queryParams = useMemo(() => params ?? {}, [params]);
  const fetcher = async (requestUrl: string): Promise<TimeseriesResponse> => {
    const url = new URL(requestUrl, window.location.origin);
    const requestParams: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== null && value !== undefined) requestParams[key] = value;
    }
    url.searchParams.forEach((value, key) => {
      requestParams[key] = value;
    });

    const op = operation ?? url.pathname.replace(/^\/+/, "");
    return invokePluginJson<TimeseriesResponse>(plugin, op, requestParams);
  };

  return (
    <TimeseriesPanel
      {...props}
      baseUrl={baseUrl ?? ""}
      {...(series ? { series } : operation ? { series: [{ id: operation }] } : {})}
      fetcher={fetcher}
    />
  );
}
