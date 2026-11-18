import { useMemo, type ReactNode } from "react";
import { Button } from "../../components/button";
import { Badge } from "../../data/Badge";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import { UiRefresh, UiWarningTriangle } from "../../icons";
import {
  VIRTUAL_LOADER_REASON,
  canRestorePatch,
  formatLeaseRemaining,
  isVirtualLoader,
  leaseRemainingMs,
  patchKey,
  patchRowState,
  type PatchRowState,
} from "../model/patches";
import type { JvmPatch } from "../protocol/types";

export type PatchRegisterTableProps = {
  patches: JvmPatch[];
  /** Epoch ms the lease countdowns are measured against; one clock for the whole table. */
  now: number;
  /** Restore and renew are enabled. */
  canMutate: boolean;
  /** Key (`patchKey`) of the row with a write in flight. */
  busyKey?: string | undefined;
  /** Disables every row's actions, e.g. while "Restore all" runs. */
  busy?: boolean;
  onRestore: (patch: JvmPatch) => void;
  onRenew: (patch: JvmPatch) => void;
  /** Renders the class name, e.g. as a link to the class browser. */
  renderClassLink?: ((patch: JvmPatch) => ReactNode) | undefined;
  className?: string;
};

type PatchRow = { key: string; patch: JvmPatch; state: PatchRowState };

const STATE_TONE = { patched: "danger", stale: "neutral", original: "success" } as const satisfies Record<PatchRowState, string>;

function LeaseCell({ patch, now }: { patch: JvmPatch; now: number }) {
  if (patchRowState(patch) !== "patched") return <span className="text-xs text-muted-foreground">—</span>;
  const remaining = leaseRemainingMs(patch, now);
  if (remaining === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-300">
        <UiWarningTriangle className="size-3" /> no lease
      </span>
    );
  }
  if (remaining === 0) return <span className="text-xs text-muted-foreground">restoring now…</span>;
  return <span className="text-xs tabular-nums">in {formatLeaseRemaining(remaining)}</span>;
}

/** The register of classes the JVM runs modified bytecode for, with lease countdowns and per-row actions. */
export function PatchRegisterTable({ patches, now, canMutate, busyKey, busy = false, onRestore, onRenew, renderClassLink, className }: PatchRegisterTableProps) {
  const rows = useMemo<PatchRow[]>(() => patches.map((patch) => ({ key: patchKey(patch), patch, state: patchRowState(patch) })), [patches]);
  const columns = useMemo<DataTableColumn<PatchRow>[]>(
    () => [
      {
        key: "class",
        label: "Class",
        accessor: (row) => row.patch.class,
        grow: true,
        render: (_value, row) => (
          <div className="min-w-0">
            {renderClassLink ? renderClassLink(row.patch) : <span className="truncate font-mono text-xs">{row.patch.class}</span>}
            {row.patch.error ? <p className="truncate text-[11px] text-muted-foreground">{row.patch.error}</p> : null}
          </div>
        ),
      },
      {
        key: "loader",
        label: "Loader",
        accessor: (row) => row.patch.loader,
        render: (_value, row) => (
          <span className="font-mono text-xs text-muted-foreground" title={isVirtualLoader(row.patch.loader) ? VIRTUAL_LOADER_REASON : undefined}>
            {row.patch.loader}
            {isVirtualLoader(row.patch.loader) ? " (virtual)" : ""}
          </span>
        ),
      },
      {
        key: "state",
        label: "State",
        accessor: (row) => row.state,
        render: (_value, row) => (
          <Badge tone={STATE_TONE[row.state]} size="sm">
            {row.state}
          </Badge>
        ),
      },
      {
        key: "lease",
        label: "Restores itself",
        accessor: (row) => leaseRemainingMs(row.patch, now),
        // Patches that will never restore themselves sort first; rows with nothing to restore last.
        sortValue: (_value, row) => (row.state !== "patched" ? Number.POSITIVE_INFINITY : (leaseRemainingMs(row.patch, now) ?? Number.NEGATIVE_INFINITY)),
        render: (_value, row) => <LeaseCell patch={row.patch} now={now} />,
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        sortable: false,
        accessor: () => "",
        render: (_value, row) => {
          if (!canRestorePatch(row.patch)) {
            const virtual = isVirtualLoader(row.patch.loader);
            return (
              <span className="text-xs text-muted-foreground" title={virtual ? VIRTUAL_LOADER_REASON : undefined}>
                {virtual ? "not restorable here" : "nothing to restore"}
              </span>
            );
          }
          const rowBusy = busy || busyKey === row.key;
          return (
            <div className="flex justify-end gap-1">
              {leaseRemainingMs(row.patch, now) !== null ? (
                <Button size="xs" variant="ghost" disabled={!canMutate || rowBusy} aria-label={`Renew lease of ${row.patch.class}`} onClick={() => onRenew(row.patch)}>
                  <UiRefresh /> +2 min
                </Button>
              ) : null}
              <Button size="xs" variant="outline" disabled={!canMutate || rowBusy} loading={busyKey === row.key} aria-label={`Restore ${row.patch.class}`} onClick={() => onRestore(row.patch)}>
                Restore
              </Button>
            </div>
          );
        },
      },
    ],
    [now, canMutate, busy, busyKey, onRestore, onRenew, renderClassLink],
  );

  return (
    <DataTable<PatchRow>
      className={className ?? "min-h-0 flex-1"}
      data={rows}
      columns={columns}
      getRowId={(row) => row.key}
      defaultSort={{ key: "lease", dir: "asc" }}
      persistColumnWidths={false}
      persistColumnVisibility={false}
      hideableColumns={false}
      showHeaderFilters={false}
    />
  );
}
