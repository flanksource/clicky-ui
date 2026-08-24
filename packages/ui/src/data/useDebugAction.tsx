import { useMemo, useSyncExternalStore } from "react";
import { UiDebug } from "../icons";
import type { DataTableMenuAction } from "./DataTable";
import {
  debugConsoleAvailable,
  revealDebugConsole,
  subscribeToDebugConsole,
} from "./debugConsoleSignal";

/**
 * Puts "Debug" in a result table's overflow menu.
 *
 * It reveals the console rather than opening a dialog. The dialog it replaces
 * had to *re-run the query* to say what it ran, so what you inspected was never
 * the execution you were looking at — and it closed the moment you changed a
 * filter, which is precisely when you wanted to compare two runs. The console
 * already holds the record for the run that happened.
 *
 * The action is absent when no console is mounted. A menu item that silently
 * does nothing reads as broken; an absent one reads as a feature this app does
 * not have, which is the truth.
 */
export function useDebugAction(): DataTableMenuAction | undefined {
  const available = useSyncExternalStore(
    subscribeToDebugConsole,
    debugConsoleAvailable,
    // A server render has no console mounted, so the action is absent there too
    // rather than hydrating into existence and shifting the menu.
    () => false,
  );

  // Memoized because it lands in a memoized menu-action list: a fresh object
  // each render would rebuild that list, and the table's menu with it.
  return useMemo<DataTableMenuAction | undefined>(
    () =>
      available
        ? {
            id: "show-query",
            label: "Debug",
            icon: UiDebug,
            // No heading and no description: one word under a "Debug" heading
            // beside a one-line gloss of itself is three ways of saying the same
            // thing in a menu with room for one.
            section: "",
            onSelect: () => revealDebugConsole({ tab: "queries" }),
          }
        : undefined,
    [available],
  );
}
