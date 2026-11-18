import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import type { JvmPoolMetric } from "../protocol/types";

export type PoolMetricsTableProps = {
  pools: JvmPoolMetric[];
  /** Accessible name of the table. */
  label: string;
  className?: string;
};

const NON_ATTRIBUTE_KEYS = new Set(["name", "objectName"]);

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/**
 * Connector thread pools or connection pools. Columns are the attributes the
 * agent selected for these MBeans, in first-seen order.
 */
export function PoolMetricsTable({ pools, label, className }: PoolMetricsTableProps) {
  const columns = useMemo<DataTableColumn<JvmPoolMetric>[]>(() => {
    const attributes = [...new Set(pools.flatMap((pool) => Object.keys(pool)))].filter((key) => !NON_ATTRIBUTE_KEYS.has(key));
    return [
      {
        key: "name",
        label: "Name",
        accessor: (pool) => pool.name,
        grow: true,
        render: (_value, pool) => (
          <span className="font-mono text-xs" title={pool.objectName}>
            {pool.name}
          </span>
        ),
      },
      ...attributes.map<DataTableColumn<JvmPoolMetric>>((attribute) => ({
        key: `attribute:${attribute}`,
        label: attribute,
        accessor: (pool) => pool[attribute],
        align: "right",
        render: (value) => <span className="tabular-nums">{cell(value)}</span>,
      })),
    ];
  }, [pools]);

  return (
    <div role="region" aria-label={label} className={className}>
      <DataTable<JvmPoolMetric>
        data={pools}
        columns={columns}
        getRowId={(pool) => pool.objectName ?? pool.name}
        persistColumnWidths={false}
        persistColumnVisibility={false}
        hideableColumns={false}
        showHeaderFilters={false}
        emptyMessage={`No ${label.toLowerCase()}`}
      />
    </div>
  );
}
