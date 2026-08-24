import { useMemo, useState } from "react";
import {
  Badge,
  DataTable,
  Panel,
  type DataTableColumn,
} from "@flanksource/clicky-ui";
import type { SortState } from "@flanksource/clicky-ui/hooks";

import { SERVICES, STATUS_TONE, type ServiceRow } from "./collection-data";

const COLUMNS: DataTableColumn<ServiceRow>[] = [
  { key: "service", label: "Service", grow: true, sortable: true },
  { key: "namespace", label: "Namespace", sortable: true },
  { key: "status", label: "Status", kind: "status", status: { showLabel: true }, sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "checked", label: "Last checked", align: "right" },
];

function matches(row: ServiceRow, query: string): boolean {
  return Object.values(row).some((value) =>
    String(value).toLowerCase().includes(query),
  );
}

export function CollectionsPattern() {
  const [selected, setSelected] = useState(SERVICES[0]!);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);

  /*
   * `pagination` is DataTable's server-side contract: the table searches and
   * sorts only the rows it is handed. Slicing first would therefore search one
   * page while the footer counted the whole collection, so this pattern owns
   * search and sort over every row and takes the page slice last — the same
   * order a real backend would use.
   */
  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? SERVICES.filter((row) => matches(row, needle))
      : SERVICES;
    if (!sort) return filtered;
    const direction = sort.dir === "desc" ? -1 : 1;
    return [...filtered].sort(
      (a, b) =>
        String(a[sort.key]).localeCompare(String(b[sort.key])) * direction,
    );
  }, [query, sort]);

  const rows = useMemo(
    () => matching.slice(page * pageSize, (page + 1) * pageSize),
    [matching, page, pageSize],
  );

  return (
    <div className="grid min-h-[32rem] gap-density-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="h-[32rem] min-h-0 overflow-hidden rounded-xl border border-border bg-card">
        <DataTable
          data={rows}
          columns={COLUMNS}
          globalFilter={query}
          onGlobalFilterChange={(next) => {
            setQuery(next);
            setPage(0);
          }}
          sort={sort}
          onSortChange={setSort}
          globalFilterPlaceholder="Search services…"
          getRowId={(row) => row.service}
          onRowClick={setSelected}
          isRowClickable={() => true}
          getRowClassName={(row) => row.service === selected.service ? "bg-primary/5" : undefined}
          pagination={{
            page,
            pageSize,
            total: matching.length,
            onPageChange: setPage,
            onPageSizeChange: (next) => {
              setPage(0);
              setPageSize(next);
            },
            pageSizeOptions: [4, 8],
          }}
          className="h-full"
        />
      </div>

      <Panel title="Selected service" tone={selected.status === "Failed" ? "danger" : "default"} padded>
        <div className="space-y-density-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{selected.service}</p>
            <p className="text-xs text-muted-foreground">{selected.namespace} namespace</p>
          </div>
          <Badge tone={STATUS_TONE[selected.status]} clickToCopy={false}>
            {selected.status}
          </Badge>
          <dl className="grid grid-cols-[auto_1fr] gap-x-density-3 gap-y-density-2 text-sm">
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="text-right font-medium text-foreground">{selected.owner}</dd>
            <dt className="text-muted-foreground">Checked</dt>
            <dd className="text-right text-foreground">{selected.checked}</dd>
          </dl>
          <p className="border-t border-border pt-density-3 text-xs leading-5 text-muted-foreground">
            Selection opens context without replacing the collection or losing its filters.
          </p>
        </div>
      </Panel>
    </div>
  );
}
