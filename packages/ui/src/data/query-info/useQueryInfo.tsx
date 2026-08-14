import { useCallback, useMemo, useState, type ReactNode } from "react";
import { UiDebug } from "../../icons";
import type { DataTableMenuAction } from "../DataTable";
import { QueryInfoDialog } from "./QueryInfoDialog";
import { fetchQueryInfo, type QueryInfoLoader } from "./queryInfo";

export type UseQueryInfoOptions = {
  /** Result URL to ask what it runs. Ignored when `load` is given. */
  url?: string | undefined;
  /** Reads the details some other way — a console re-running its own query. */
  load?: QueryInfoLoader | undefined;
  /** Dialog heading. */
  title?: string | undefined;
};

export type UseQueryInfoResult = {
  /** "Debug" for the table's overflow menu; absent with nothing to ask. */
  action: DataTableMenuAction | undefined;
  /** Render alongside the table — the dialog the action opens. */
  dialog: ReactNode;
};

/**
 * useQueryInfo puts "Debug" in a result table's overflow menu.
 *
 * The details are read when the menu item is chosen, never before: asking costs
 * a second execution against the same backend, which is a price only a user who
 * wants the answer should pay.
 */
export function useQueryInfo({
  url,
  load,
  title,
}: UseQueryInfoOptions): UseQueryInfoResult {
  const [open, setOpen] = useState(false);
  const loader = useMemo<QueryInfoLoader | undefined>(() => {
    if (load) return load;
    if (!url) return undefined;
    return () => fetchQueryInfo(url);
  }, [load, url]);
  const close = useCallback(() => setOpen(false), []);
  // The action lands in a memoized menu-action list, so a fresh object each
  // render would rebuild that list — and the table's menu — on every render.
  const action = useMemo<DataTableMenuAction | undefined>(
    () =>
      loader
        ? {
            id: "show-query",
            label: "Debug",
            icon: UiDebug,
            // No heading and no description: one word under a "Debug" heading
            // beside a one-line gloss of itself is three ways of saying the
            // same thing in a menu with room for one.
            section: "",
            onSelect: () => setOpen(true),
          }
        : undefined,
    [loader],
  );

  if (!loader) return { action: undefined, dialog: null };

  return {
    action,
    dialog: (
      <QueryInfoDialog
        open={open}
        onClose={close}
        load={loader}
        {...(title ? { title } : {})}
      />
    ),
  };
}
