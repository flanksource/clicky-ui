import { useCallback, useMemo, useState, type ReactNode } from "react";
import { UiCloudDownload } from "../../icons";
import type { DataTableMenuAction } from "../DataTable";
import {
  ClickyExportDialog,
  type ClickyExportFormatOption,
  type ClickyExportScopeOption,
} from "./ClickyExportDialog";

export type UseClickyExportOptions = {
  formats: ClickyExportFormatOption[];
  scopes: ClickyExportScopeOption[];
  onDownload: (request: {
    format: string;
    scope: string | undefined;
  }) => Promise<void> | void;
  /** Menu row label. Defaults to "Export…". */
  label?: string | undefined;
  /** Dialog heading. Defaults to "Export". */
  title?: string | undefined;
};

export type UseClickyExportResult = {
  /** "Export…" for the table's overflow menu; absent with nothing to export. */
  action: DataTableMenuAction | undefined;
  /** Render alongside the table — the dialog the action opens. */
  dialog: ReactNode;
};

/**
 * useClickyExport puts a single "Export…" row in a table's overflow menu.
 *
 * One row rather than one per format-and-range: the choice belongs in a dialog
 * that has room to say what each range costs, and a menu whose formats outnumber
 * everything else in it is a menu whose other entries never get found.
 */
export function useClickyExport({
  formats,
  scopes,
  onDownload,
  label = "Export…",
  title,
}: UseClickyExportOptions): UseClickyExportResult {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const available = formats.length > 0;
  const action = useMemo<DataTableMenuAction | undefined>(
    () =>
      available
        ? {
            id: "export",
            label,
            icon: UiCloudDownload,
            section: "",
            onSelect: () => setOpen(true),
          }
        : undefined,
    [available, label],
  );

  if (!available) return { action: undefined, dialog: null };

  return {
    action,
    dialog: (
      <ClickyExportDialog
        open={open}
        onClose={close}
        formats={formats}
        scopes={scopes}
        onDownload={onDownload}
        {...(title ? { title } : {})}
      />
    ),
  };
}
