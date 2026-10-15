import { useMemo } from "react";
import { HarPanel, type HarPanelProps } from "../har/HarPanel";
import { exchangeToHarEntry } from "./har-adapter";
import type { HttpExchangeRow } from "./types";

export type TraceHarViewProps = Omit<HarPanelProps, "entries"> & {
  /** `http` / `http_proxy` trace records. */
  rows: HttpExchangeRow[];
};

/**
 * `http` / `http_proxy` trace records rendered by the shared HarPanel. Bodies
 * the store parsed into structure are shown as JSON; a tunnelled CONNECT shows
 * its bytes in and out where a body would be.
 */
export function TraceHarView({ rows, emptyLabel = "No HTTP exchanges recorded", ...panel }: TraceHarViewProps) {
  const entries = useMemo(
    () => rows.map((row, index) => exchangeToHarEntry(row, { id: `${row.startedAt}#${index}` })),
    [rows],
  );
  return <HarPanel entries={entries} emptyLabel={emptyLabel} {...panel} />;
}
