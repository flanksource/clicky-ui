import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../components/button";
import {
  UiFileCode,
  UiFileSpreadsheet,
  UiFileText,
  UiJson,
  UiMarkdown,
} from "../icons";
import type {
  FilterBarFilter,
  FilterBarMultiFilterMode,
} from "../components/FilterBar";
import { Modal } from "../overlay/Modal";
import {
  DataTable,
  type DataTableColumn,
  type DataTableMenuAction,
  type DataTableProps,
} from "./DataTable";

type Row = {
  service: string;
  status: string;
  restarts: number;
  owner: string;
  notes: string;
};

const rows: Row[] = [
  {
    service: "api",
    status: "healthy",
    restarts: 0,
    owner: "platform",
    notes:
      "Primary public API with long-form notes that should keep its width.",
  },
  {
    service: "worker",
    status: "degraded",
    restarts: 3,
    owner: "data",
    notes: "Background job processor with retry queues.",
  },
  {
    service: "cron",
    status: "healthy",
    restarts: 1,
    owner: "platform",
    notes: "Nightly maintenance and reporting runner.",
  },
];

const columns: DataTableColumn<Row>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  {
    key: "restarts",
    label: "Restarts",
    shrink: true,
    align: "right",
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "owner", label: "Owner", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

type CompactRow = {
  name: string;
  state: string;
  age: string;
};

const compactRows: CompactRow[] = [
  { name: "api", state: "healthy", age: "12m" },
  { name: "worker", state: "degraded", age: "4m" },
  { name: "cron", state: "healthy", age: "2h" },
];

const compactColumns: DataTableColumn<CompactRow>[] = [
  { key: "name", label: "Name", shrink: true },
  { key: "state", label: "State", shrink: true },
  { key: "age", label: "Age", shrink: true, align: "right" },
];

type FitRow = {
  service: string;
  status: string;
  region: string;
  version: string;
  owner: string;
  latency: number;
};

const fitRows: FitRow[] = [
  {
    service: "api",
    status: "healthy",
    region: "us-east",
    version: "2026.04.1",
    owner: "platform",
    latency: 42,
  },
  {
    service: "billing",
    status: "healthy",
    region: "eu-west",
    version: "2026.04.0",
    owner: "finance",
    latency: 58,
  },
  {
    service: "worker",
    status: "degraded",
    region: "us-west",
    version: "2026.03.9",
    owner: "data",
    latency: 131,
  },
];

const fitColumns: DataTableColumn<FitRow>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  { key: "region", label: "Region", shrink: true },
  { key: "version", label: "Version", shrink: true },
  { key: "owner", label: "Owner", shrink: true },
  {
    key: "latency",
    label: "Latency ms",
    shrink: true,
    align: "right",
    sortValue: (value) => Number(value ?? 0),
  },
];

type WideRow = {
  service: string;
  namespace: string;
  cluster: string;
  region: string;
  zone: string;
  status: string;
  owner: string;
  version: string;
  cpu: string;
  memory: string;
  latency: number;
  restarts: number;
  updated: string;
  notes: string;
};

const wideRows: WideRow[] = [
  {
    service: "api",
    namespace: "frontend",
    cluster: "prod-a",
    region: "us-east",
    zone: "use1-a",
    status: "healthy",
    owner: "platform",
    version: "2026.04.1",
    cpu: "62%",
    memory: "5.1 GiB",
    latency: 42,
    restarts: 0,
    updated: "4m ago",
    notes: "Primary public API serving customer traffic.",
  },
  {
    service: "worker",
    namespace: "jobs",
    cluster: "prod-b",
    region: "us-west",
    zone: "usw2-c",
    status: "degraded",
    owner: "data",
    version: "2026.03.9",
    cpu: "78%",
    memory: "7.8 GiB",
    latency: 131,
    restarts: 3,
    updated: "9m ago",
    notes: "Queue processor draining delayed retry batches.",
  },
  {
    service: "billing",
    namespace: "finance",
    cluster: "prod-eu",
    region: "eu-west",
    zone: "euw1-b",
    status: "healthy",
    owner: "finance",
    version: "2026.04.0",
    cpu: "41%",
    memory: "3.4 GiB",
    latency: 58,
    restarts: 1,
    updated: "18m ago",
    notes: "Ledger sync and invoice reconciliation service.",
  },
];

const wideColumns: DataTableColumn<WideRow>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "namespace", label: "Namespace", shrink: true },
  { key: "cluster", label: "Cluster", shrink: true },
  { key: "region", label: "Region", shrink: true },
  { key: "zone", label: "Zone", shrink: true },
  { key: "status", label: "Status", shrink: true },
  { key: "owner", label: "Owner", shrink: true },
  { key: "version", label: "Version", shrink: true },
  { key: "cpu", label: "CPU", align: "right", shrink: true },
  { key: "memory", label: "Memory", align: "right", shrink: true },
  {
    key: "latency",
    label: "Latency ms",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  {
    key: "restarts",
    label: "Restarts",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "updated", label: "Updated", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

function DataTableShowcase(args: DataTableProps<Row>) {
  const [timeFrom, setTimeFrom] = useState("now-24h");
  const [timeTo, setTimeTo] = useState("now");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <DataTable
      key={[
        args.theme ?? "system",
        args.defaultSort?.key ?? "",
        args.defaultSort?.dir ?? "",
      ].join(":")}
      {...args}
      filterBarProps={{
        timeRange: {
          from: timeFrom,
          to: timeTo,
          onApply: (from, to) => {
            setTimeFrom(from);
            setTimeTo(to);
          },
        },
        dateRange: {
          from: dateFrom,
          to: dateTo,
          onApply: (from, to) => {
            setDateFrom(from);
            setDateTo(to);
          },
        },
      }}
      renderExpandedRow={(row) => (
        <div className="text-sm text-muted-foreground">
          {row.service} is owned by <strong>{row.owner}</strong>.
        </div>
      )}
    />
  );
}

function FewColumnsShowcase() {
  return (
    <DataTable
      data={compactRows}
      columns={compactColumns}
      defaultSort={{ key: "name", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-few-columns"
    />
  );
}

function EverythingFitsShowcase() {
  return (
    <DataTable
      data={fitRows}
      columns={fitColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-everything-fits"
    />
  );
}

function LotsOfColumnsShowcase() {
  return (
    <DataTable
      data={wideRows}
      columns={wideColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-lots-of-columns"
    />
  );
}

function LoadingShowcase() {
  return (
    <DataTable
      data={[]}
      columns={wideColumns}
      loading
      loadingMessage="Loading execution results…"
      loadingRowCount={8}
      showGlobalFilter={false}
      columnResizeStorageKey="clicky-ui-story-data-table-loading"
    />
  );
}

const downloadMenuActions: DataTableMenuAction[] = [
  {
    id: "download-yaml",
    label: "YAML",
    icon: UiFileCode,
    iconClassName: "text-violet-600 dark:text-violet-400",
    onSelect: () => {
      console.info("Download YAML");
    },
  },
  {
    id: "download-json",
    label: "JSON",
    icon: UiJson,
    onSelect: () => {
      console.info("Download JSON");
    },
  },
  {
    id: "download-csv",
    label: "CSV",
    icon: UiFileSpreadsheet,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    onSelect: () => {
      console.info("Download CSV");
    },
  },
  {
    id: "download-pdf",
    label: "PDF",
    icon: UiFileText,
    iconClassName: "text-rose-600 dark:text-rose-400",
    onSelect: () => {
      console.info("Download PDF");
    },
  },
  {
    id: "download-markdown",
    label: "Markdown",
    icon: UiMarkdown,
    onSelect: () => {
      console.info("Download Markdown");
    },
  },
];

function MenuActionsShowcase() {
  return (
    <DataTable
      data={wideRows}
      columns={wideColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      menuActions={downloadMenuActions}
      columnResizeStorageKey="clicky-ui-story-data-table-menu-actions"
    />
  );
}

// View-switch entries carry section: "View" so they group above the download
// formats — this is how Clicky surfaces a table's view modes and download
// formats inside the overflow ("3-dot") menu instead of a standalone bar.
const sectionedMenuActions: DataTableMenuAction[] = [
  {
    id: "view-clicky",
    label: "Clicky",
    icon: UiJson,
    section: "View",
    disabled: true,
    onSelect: () => {
      console.info("View Clicky");
    },
  },
  {
    id: "view-json",
    label: "JSON",
    icon: UiJson,
    section: "View",
    onSelect: () => {
      console.info("View JSON");
    },
  },
  {
    id: "view-pdf",
    label: "PDF",
    icon: UiFileText,
    iconClassName: "text-rose-600 dark:text-rose-400",
    section: "View",
    onSelect: () => {
      console.info("View PDF");
    },
  },
  ...downloadMenuActions,
];

function GroupedMenuActionsShowcase() {
  return (
    <DataTable
      data={wideRows}
      columns={wideColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      menuActions={sectionedMenuActions}
      columnResizeStorageKey="clicky-ui-story-data-table-grouped-menu-actions"
    />
  );
}

type LogRow = {
  ts: string;
  level: string;
  service: string;
  message: string;
  tags: string[];
};

function makeLogRows(spread: "subMinute" | "sameDay" | "multiYear"): LogRow[] {
  const base = new Date("2026-04-15T12:04:33Z").getTime();
  const services = ["api", "worker", "billing", "auth"];
  const levels = ["INFO", "WARN", "error", "ERR", "failed", "ok"];
  const tagPool = [
    ["region:us-east", "tier:edge", "v=2026.04.1"],
    ["region:eu-west", "tier:core"],
    ["region:us-west", "tier:edge", "v=2026.04.0", "owner=platform"],
    ["region:eu-west", "tier:core", "owner=finance"],
    ["region:us-east"],
    ["region:ap-south", "tier:edge", "v=2026.03.9"],
  ];

  const stepMs =
    spread === "subMinute"
      ? 8_000
      : spread === "sameDay"
        ? 1_800_000
        : 86_400_000 * 90;

  return Array.from({ length: 6 }, (_, i) => ({
    ts: new Date(base + stepMs * i).toISOString(),
    level: levels[i % levels.length],
    service: services[i % services.length],
    message: `event #${i} from ${services[i % services.length]}`,
    tags: tagPool[i % tagPool.length],
  }));
}

const logColumns: DataTableColumn<LogRow>[] = [
  { key: "ts", label: "Timestamp", kind: "timestamp", shrink: true },
  {
    key: "level",
    label: "Status",
    kind: "status",
    shrink: true,
    status: { showLabel: true },
  },
  { key: "service", label: "Service", shrink: true },
  { key: "message", label: "Message", grow: true },
  {
    key: "tags",
    label: "Tags",
    kind: "tags",
    grow: true,
    tags: { maxVisible: 2 },
  },
];

function TimestampsShowcase() {
  const [spread, setSpread] = useState<"subMinute" | "sameDay" | "multiYear">(
    "sameDay",
  );
  const data = makeLogRows(spread);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Data spread:</span>
        {(["subMinute", "sameDay", "multiYear"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSpread(option)}
            className={`rounded-md border px-2 py-1 text-xs ${
              spread === option
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <DataTable
        data={data}
        columns={logColumns}
        autoFilter
        defaultSort={{ key: "ts", dir: "desc" }}
        columnResizeStorageKey={`clicky-ui-story-data-table-timestamps-${spread}`}
      />
    </div>
  );
}

type TagRow = {
  id: string;
  name: string;
  tags: string[];
};

const tagRows: TagRow[] = [
  {
    id: "1",
    name: "auth-service",
    tags: [
      "env=prod",
      "team=identity",
      "tier=edge",
      "region=us-east",
      "v=2026.04.1",
    ],
  },
  {
    id: "2",
    name: "billing-svc",
    tags: ["env=prod", "team=finance", "tier=core"],
  },
  {
    id: "3",
    name: "ingest-pipeline",
    tags: ["env=staging", "team=data", "tier=core"],
  },
  { id: "4", name: "marketing-site", tags: ["env=prod", "team=growth"] },
  {
    id: "5",
    name: "many-tags",
    tags: Array.from({ length: 30 }, (_, i) => `label-${i}=value-${i}`),
  },
];

const tagColumns: DataTableColumn<TagRow>[] = [
  { key: "id", label: "ID", shrink: true },
  { key: "name", label: "Name", grow: true },
  {
    key: "tags",
    label: "Tags",
    kind: "tags",
    grow: true,
    tags: { maxVisible: 3 },
  },
];

function TagsShowcase() {
  return (
    <DataTable
      data={tagRows}
      columns={tagColumns}
      autoFilter
      columnResizeStorageKey="clicky-ui-story-data-table-tags"
    />
  );
}

type StatusRow = {
  service: string;
  state: string;
  notes: string;
};

const statusRows: StatusRow[] = [
  { service: "api", state: "ok", notes: "running normally" },
  { service: "worker", state: "ERROR", notes: "stack overflow" },
  { service: "billing", state: "warning", notes: "latency p95 elevated" },
  { service: "auth", state: "healthy", notes: "all checks green" },
  { service: "search", state: "failed", notes: "circuit broken" },
  { service: "cron", state: "degraded", notes: "1/3 retries" },
  { service: "router", state: "info", notes: "info-only event" },
  {
    service: "unknown",
    state: "mystery",
    notes: "unmapped value falls through",
  },
];

const statusColumns: DataTableColumn<StatusRow>[] = [
  {
    key: "state",
    label: "Status",
    kind: "status",
    shrink: true,
    status: { showLabel: true },
  },
  { key: "service", label: "Service", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

function StatusDotShowcase() {
  return (
    <DataTable
      data={statusRows}
      columns={statusColumns}
      autoFilter
      columnResizeStorageKey="clicky-ui-story-data-table-status-dot"
    />
  );
}

function RowDetailDialogShowcase() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      defaultSort={{ key: "restarts", dir: "asc" }}
      detailStyle="dialog"
      detailDialogTitle={(row) => `${row.service} details`}
      columnResizeStorageKey="clicky-ui-story-data-table-detail-dialog"
      renderExpandedRow={(row) => (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            {row.service} is owned by <strong>{row.owner}</strong>.
          </p>
          <pre className="overflow-auto rounded border border-border bg-muted p-2 text-xs">
            {JSON.stringify(row, null, 2)}
          </pre>
        </div>
      )}
    />
  );
}

function FilterDescriptionsShowcase() {
  const [status, setStatus] = useState<Record<string, FilterBarMultiFilterMode>>(
    {},
  );
  const [owner, setOwner] = useState("");
  const [minRestarts, setMinRestarts] = useState("");
  const [service, setService] = useState("");

  const filters: FilterBarFilter[] = [
    {
      key: "service",
      kind: "enum",
      label: "Service",
      description:
        "Single-select: show only the chosen service, or leave empty for all.",
      placeholder: "any service",
      value: service,
      options: rows.map((row) => ({ value: row.service })),
      onChange: setService,
    },
    {
      key: "status",
      kind: "multi",
      label: "Status",
      description:
        "Include or exclude services by health. Click once to include, again to exclude.",
      value: status,
      options: [
        { value: "healthy", label: "healthy" },
        { value: "degraded", label: "degraded" },
      ],
      onChange: setStatus,
    },
    {
      key: "owner",
      kind: "text",
      label: "Owner",
      description:
        "Match the owning team by substring, e.g. `plat` matches `platform`.",
      placeholder: "team name…",
      value: owner,
      onChange: setOwner,
    },
    {
      key: "restarts",
      kind: "number",
      label: "Min restarts",
      description:
        "Only show services that have restarted at least this many times.",
      value: { min: minRestarts },
      domainMin: 0,
      domainMax: 5,
      step: 1,
      onChange: (value) => setMinRestarts(value.min ?? ""),
    },
  ];

  const includes = Object.entries(status)
    .filter(([, mode]) => mode === "include")
    .map(([value]) => value);
  const excludes = Object.entries(status)
    .filter(([, mode]) => mode === "exclude")
    .map(([value]) => value);
  const ownerQuery = owner.trim().toLowerCase();
  const minRestartCount = minRestarts === "" ? null : Number(minRestarts);

  const filtered = rows.filter((row) => {
    if (service && row.service !== service) return false;
    if (includes.length > 0 && !includes.includes(row.status)) return false;
    if (excludes.includes(row.status)) return false;
    if (ownerQuery && !row.owner.toLowerCase().includes(ownerQuery)) {
      return false;
    }
    if (minRestartCount !== null && row.restarts < minRestartCount) {
      return false;
    }
    return true;
  });

  return (
    <DataTable
      data={filtered}
      columns={columns}
      defaultSort={{ key: "restarts", dir: "asc" }}
      externalFilters={filters}
      columnResizeStorageKey="clicky-ui-story-data-table-filter-descriptions"
    />
  );
}

type PersonRow = {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  status: string;
};

const FIRST_NAMES = [
  "Ada", "Grace", "Alan", "Linus", "Katherine", "Edsger",
  "Barbara", "Dennis", "Margaret", "Ken", "Radia", "Donald",
];
const LAST_NAMES = [
  "Lovelace", "Hopper", "Turing", "Torvalds", "Johnson", "Dijkstra",
  "Liskov", "Ritchie", "Hamilton", "Thompson", "Perlman", "Knuth",
];
const TEAMS = ["Platform", "Finance", "Data", "Growth", "Identity", "Support"];
const ROLES = ["Admin", "Editor", "Viewer"];
const PERSON_STATUSES = ["active", "invited", "disabled"];

// 120 deterministic rows so the pagination footer has real pages to move through.
const people: PersonRow[] = Array.from({ length: 120 }, (_, index) => {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];
  return {
    id: `person-${index + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${index + 1}`.toLowerCase() + "@example.com",
    team: TEAMS[index % TEAMS.length],
    role: ROLES[index % ROLES.length],
    status: PERSON_STATUSES[index % PERSON_STATUSES.length],
  };
});

const peopleColumns: DataTableColumn<PersonRow>[] = [
  { key: "name", label: "Name", grow: true },
  { key: "email", label: "Email", grow: true },
  { key: "team", label: "Team", shrink: true },
  { key: "role", label: "Role", shrink: true },
  {
    key: "status",
    label: "Status",
    kind: "status",
    shrink: true,
    status: { showLabel: true },
  },
];

// The DataTable never slices or reorders server-paginated data, so the story
// owns sorting over the full set before it hands the current page to the table.
function sortPeople(
  data: PersonRow[],
  sort: { key: string; dir: "asc" | "desc" } | null,
): PersonRow[] {
  if (!sort) return data;
  const factor = sort.dir === "asc" ? 1 : -1;
  const key = sort.key as keyof PersonRow;
  return [...data].sort(
    (left, right) => factor * String(left[key]).localeCompare(String(right[key])),
  );
}

function DialogTableShowcase() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>({
    key: "name",
    dir: "asc",
  });
  // Keyed by row id so a selection made on page 1 survives paging to page 3.
  const [selected, setSelected] = useState<Record<string, PersonRow>>({});

  const sorted = sortPeople(people, sort);
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const selectedCount = Object.keys(selected).length;

  return (
    <>
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        Add people
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add people"
        size="xl"
        expandable
        // Body owns no scroll — only the table's row region moves, so the sticky
        // header, filter bar, and pagination footer stay pinned.
        scrollBody={false}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {selectedCount === 0
                ? "Select one or more people from the table."
                : `${selectedCount} selected`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setSelected({})}
                disabled={selectedCount === 0}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
                onClick={() => setOpen(false)}
                disabled={selectedCount === 0}
              >
                {selectedCount > 0 ? `Add ${selectedCount}` : "Add"}
              </button>
            </div>
          </div>
        }
      >
        <DataTable
          // Fill the scrollBody=false modal body so only the rows scroll.
          className="min-h-0 flex-1"
          data={pageRows}
          columns={peopleColumns}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          manualSort
          columnResizeStorageKey="clicky-ui-story-data-table-dialog"
          rowSelection={{
            selectedRowIds: Object.keys(selected),
            toggleOnRowClick: true,
            onSelectionChange: (nextIds, nextRows) => {
              const rowById = new Map(nextRows.map((row) => [row.id, row]));
              setSelected(
                Object.fromEntries(
                  nextIds.map((id) => [id, rowById.get(id) ?? selected[id]]),
                ),
              );
            },
          }}
          pagination={{
            page,
            pageSize,
            total: people.length,
            pageSizeOptions: [10, 25, 50],
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPage(0);
              setPageSize(size);
            },
          }}
        />
      </Modal>
    </>
  );
}

function SelectionActionsShowcase() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.service}
      rowSelection={{
        selectedRowIds: selected,
        onSelectionChange: (ids) => setSelected(ids),
      }}
      getRowClassName={(row) =>
        row.restarts >= 3
          ? "bg-amber-400/10 [[data-theme=dark]_&]:bg-amber-400/10"
          : undefined
      }
      footer={({ visibleRowCount, totalRowCount }) =>
        `Showing ${visibleRowCount} of ${totalRowCount} services · ${rows.reduce((sum, row) => sum + row.restarts, 0)} restarts total`
      }
      selectionActions={({ selectedRows, clearSelection }) => (
        <>
          <span className="text-xs">
            <b>{selectedRows.length} selected</b>
            <span className="opacity-70">
              {" · "}
              {selectedRows.reduce((sum, row) => sum + row.restarts, 0)}{" "}
              restarts
            </span>
          </span>
          <span className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
            <Button size="sm">Restart {selectedRows.length}</Button>
          </span>
        </>
      )}
    />
  );
}

const meta = {
  title: "Data/DataTable",
  component: DataTable,
  render: (args) => <DataTableShowcase {...args} />,
  args: {
    data: rows,
    columns,
    loading: false,
    loadingMessage: "Loading services…",
    loadingRowCount: 8,
    emptyMessage: "No services",
    autoFilter: true,
    showGlobalFilter: true,
    globalFilterPlaceholder: "Search all columns…",
    defaultSort: { key: "restarts", dir: "asc" },
    resizableColumns: true,
    hideableColumns: true,
    persistColumnWidths: true,
    persistColumnVisibility: true,
    persistDensity: true,
    showDensityControl: true,
    showThemeControl: false,
    showHeaderFilters: true,
    showFullscreenControl: false,
    fullscreenTitle: "Services",
    fullscreenButtonLabel: "Open table full screen",
  },
  argTypes: {
    data: { control: false, table: { category: "Data" } },
    columns: { control: false, table: { category: "Data" } },
    loading: { control: "boolean", table: { category: "State" } },
    loadingMessage: { control: "text", table: { category: "State" } },
    loadingRowCount: {
      control: { type: "range", min: 1, max: 20, step: 1 },
      table: { category: "State" },
    },
    emptyMessage: { control: "text", table: { category: "State" } },
    autoFilter: { control: "boolean", table: { category: "Filtering" } },
    showGlobalFilter: {
      control: "boolean",
      table: { category: "Filtering" },
    },
    globalFilterPlaceholder: {
      control: "text",
      table: { category: "Filtering" },
    },
    showHeaderFilters: {
      control: "boolean",
      table: { category: "Filtering" },
    },
    resizableColumns: {
      control: "boolean",
      table: { category: "Columns" },
    },
    persistColumnWidths: {
      control: "boolean",
      table: { category: "Columns" },
    },
    hideableColumns: {
      control: "boolean",
      table: { category: "Columns" },
    },
    persistColumnVisibility: {
      control: "boolean",
      table: { category: "Columns" },
    },
    persistDensity: {
      control: "boolean",
      table: { category: "Preferences" },
    },
    showDensityControl: {
      control: "boolean",
      table: { category: "Preferences" },
    },
    showThemeControl: {
      control: "boolean",
      table: { category: "Preferences" },
    },
    showFullscreenControl: {
      control: "boolean",
      table: { category: "Fullscreen" },
    },
    fullscreenTitle: { control: "text", table: { category: "Fullscreen" } },
    fullscreenButtonLabel: {
      control: "text",
      table: { category: "Fullscreen" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Feature-rich data grid for operational screens. It supports generated filters, sortable and resizable columns, density/theme controls, row details, fullscreen mode, pagination, and specialized timestamp/tag/status columns.",
      },
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  args: {
    showFullscreenControl: true,
    fullscreenButtonLabel: "Open controlled table",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Open controlled table" }),
    ).toBeVisible();
  },
};

export const FewColumns: Story = {
  render: () => <FewColumnsShowcase />,
};

export const InitialLoading: Story = {
  render: () => <LoadingShowcase />,
};

export const EverythingFits: Story = {
  render: () => <EverythingFitsShowcase />,
};

export const LotsOfColumns: Story = {
  render: () => <LotsOfColumnsShowcase />,
};

export const MenuActions: Story = {
  render: () => <MenuActionsShowcase />,
};

export const GroupedMenuActions: Story = {
  render: () => <GroupedMenuActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          "Menu actions with a `section` heading group together in the overflow menu. Clicky uses this to host a table's view modes (Clicky/JSON/PDF) and download formats in the 3-dot menu instead of a standalone view bar.",
      },
    },
  },
};

export const Timestamps: Story = {
  render: () => <TimestampsShowcase />,
};

export const Tags: Story = {
  render: () => <TagsShowcase />,
};

export const StatusDots: Story = {
  render: () => <StatusDotShowcase />,
};

export const RowDetailDialog: Story = {
  render: () => <RowDetailDialogShowcase />,
};

export const InDialogWithPagingAndSelection: Story = {
  render: () => <DialogTableShowcase />,
  parameters: {
    docs: {
      description: {
        story: [
          "A DataTable hosted inside a `Modal` with server-style pagination and controlled multi-row selection — the pattern behind the chat \"Add context\" picker.",
          "",
          "- **Only the rows scroll.** The dialog sets `scrollBody={false}`, so the modal body is a non-scrolling flex column and the table's own row region owns the scroll. The sticky header, filter/search bar, pagination footer, and the selection action bar all stay pinned.",
          "- **Selection persists across pages.** It is keyed by `getRowId`, so a row checked on page 1 stays checked after paging to page 3; the footer shows the running count and the primary action is disabled until at least one row is selected.",
          "- **Pagination is server-shaped.** The DataTable never slices `data`, so the story sorts and slices the current page itself and reports the true `total` for \"Page X of Y\".",
        ].join("\n"),
      },
    },
  },
};

export const SelectionActionsAndFooter: Story = {
  render: () => <SelectionActionsShowcase />,
  parameters: {
    docs: {
      description: {
        story: [
          "`selectionActions` renders a bulk action bar pinned to the bottom of the table shell whenever `rowSelection` holds a non-empty selection — it receives the selected rows and a `clearSelection` callback, so the caller owns the copy and the actions but not the plumbing.",
          "",
          "`footer` replaces the default \"N of M rows\" strip, and `getRowClassName` tints the degraded row.",
        ].join("\n"),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Showing 3 of 3 services/),
    ).toBeInTheDocument();
    await expect(canvas.queryByText("3 of 3 rows")).toBeNull();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row worker" }),
    );
    const bar = within(canvas.getByTestId("data-table-selection-actions"));
    await expect(bar.getByText("1 selected")).toBeVisible();
    await expect(bar.getByText(/3 restarts/)).toBeVisible();

    await userEvent.click(bar.getByRole("button", { name: "Clear" }));
    await expect(
      canvas.queryByTestId("data-table-selection-actions"),
    ).toBeNull();
  },
};

export const FilterDescriptions: Story = {
  render: () => <FilterDescriptionsShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          "Caller-owned filters that each carry a `description`, shown as helper text in the filter popover (and as the control's tooltip). The filters here actually narrow the rows: status include/exclude, an owner substring match, and a minimum restart count.",
      },
    },
  },
};
