import { useCallback, useMemo, type ReactNode } from "react";
import type { DataTableMenuAction, DataTablePagination } from "./DataTable";
import { useClickyExport } from "./clicky-export/useClickyExport";
import {
  exportFormatOptions,
  exportScopeOptions,
  runClickyDownload,
  type ClickyDownloadOptions,
  type ClickyDownloadScope,
  type ClickyRemoteFormat,
} from "./clicky-download";
import { useDebugAction } from "./useDebugAction";

/**
 * The overflow-menu actions a Clicky result table carries — export (with its
 * dialog) and debug — for a host that renders a result through its own table.
 * Render `dialog` once alongside the table.
 */
export function useClickyTableMenu({
  url,
  download,
  pagination,
}: {
  url?: string | undefined;
  download?: ClickyDownloadOptions | undefined;
  pagination?: DataTablePagination | undefined;
}): { actions: DataTableMenuAction[]; dialog: ReactNode } {
  // The rows never show the query behind them. "Debug" reveals the console,
  // which holds the record for the run that produced these rows.
  const debugAction = useDebugAction();
  const exporter = useClickyExport({
    formats: useMemo(() => exportFormatOptions({ url, download }), [download, url]),
    scopes: useMemo(() => exportScopeOptions(download, pagination), [download, pagination]),
    onDownload: useCallback(
      ({ format, scope }: { format: string; scope: string | undefined }) =>
        runClickyDownload({
          url: url ?? "",
          format: format as ClickyRemoteFormat,
          scope: scope as ClickyDownloadScope | undefined,
          download,
        }),
      [download, url],
    ),
  });
  const actions = useMemo(
    () =>
      [exporter.action, debugAction].filter(
        (action): action is DataTableMenuAction => action !== undefined,
      ),
    [exporter.action, debugAction],
  );
  return { actions, dialog: exporter.dialog };
}
