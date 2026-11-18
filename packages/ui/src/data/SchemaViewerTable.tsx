import { useMemo, type ReactNode } from "react";
import { DataTable, type DataTableColumn } from "./DataTable";
import { SchemaTypeIcon } from "./SchemaTypeIcon";
import type { SchemaViewerFieldMeta, SchemaViewerNode } from "./schema-viewer-model";
import type { SchemaViewerSectionNodes } from "./schema-viewer-sections";

type SchemaRow = { path: string; depth: number; node: SchemaViewerNode };

function schemaRows(nodes: SchemaViewerNode[], parent = "", depth = 0): SchemaRow[] {
  return nodes.filter((node) => !node.detail).flatMap((node) => {
    const path = node.path ?? (parent ? `${parent}.${node.label}` : node.label);
    return [{ path, depth, node }, ...schemaRows(node.children ?? [], path, depth + 1)];
  });
}

const COLUMNS: DataTableColumn<SchemaRow>[] = [
  { key: "path", label: "Field", render: (_, row) => <span className="whitespace-nowrap font-mono text-xs" style={{ paddingLeft: row.depth * 12 }}>{row.path}</span> },
  { key: "type", label: "Type", accessor: (row) => row.node.badge, render: (_, row) => <span className="flex items-center gap-2">
    {row.node.badge && <SchemaTypeIcon type={row.node.badge} />}
    {row.node.platformType && <span className="text-xs">{row.node.platformType}</span>}
  </span> },
  { key: "value", label: "Default / value", accessor: (row) => row.node.meta?.constValue ?? row.node.meta?.defaultValue,
    render: (value) => value === undefined ? null : <code className="break-all text-xs">{String(value)}</code> },
  { key: "description", label: "Description", grow: true, accessor: (row) => row.node.description,
    cellClassName: "whitespace-normal min-w-48", render: (value, row) => <span className="whitespace-normal break-words text-xs text-muted-foreground">
      {value === undefined ? null : String(value)}
      {row.node.ascode && <code className="ml-2">code: {row.node.ascode}</code>}
    </span> },
];

export function SchemaViewerTable({ groups, renderDetail, showControls, actions, query, onQueryChange }: {
  groups: SchemaViewerSectionNodes[];
  renderDetail: (meta: SchemaViewerFieldMeta) => ReactNode;
  showControls: boolean;
  actions: ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const rows = useMemo(() => groups.flatMap((group) => schemaRows(group.nodes).map((row) => ({ ...row, section: group.id }))), [groups]);
  return <DataTable<SchemaRow & { section: string }>
    data={rows}
    columns={COLUMNS}
    getRowId={(row) => row.node.key}
    className="min-w-0"
    showGlobalFilter={showControls}
    globalFilterPlaceholder="Filter schema fields"
    globalFilter={query}
    onGlobalFilterChange={onQueryChange}
    {...(showControls ? { externalSearch: { value: query, onChange: onQueryChange, placeholder: "Filter schema fields", debounceMs: 0 } } : {})}
    filterBarProps={{ trailing: actions, className: "schema-viewer-toolbar" }}
    {...(groups.some((group) => group.title) ? { grouping: {
      getGroupKey: (row: SchemaRow & { section: string }) => row.section,
      getGroupLabel: (key: string) => groups.find((group) => group.id === key)?.title,
      getGroupMeta: (key: string) => groups.find((group) => group.id === key)?.description,
      metaClassName: "min-w-0 max-w-[50%] truncate",
    } } : {})}
    resizableColumns={false}
    persistColumnWidths={false}
    hideableColumns={false}
    showHeaderFilters={false}
    renderExpandedRow={(row) => {
      const detail = row.node.children?.find((child) => child.detail)?.detail;
      return detail ? renderDetail(detail) : null;
    }}
  />;
}
