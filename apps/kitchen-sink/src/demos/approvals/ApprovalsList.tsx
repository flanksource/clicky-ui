import { useMemo, useState } from "react";
import {
  Button,
  DataTable,
  EntityCell,
  Icon,
  StatStrip,
  type BadgeTone,
  type DataTableColumn,
  type FilterBarFilter,
} from "@flanksource/clicky-ui";
import { MvBadge, MvChip, MvDirChip } from "./chrome";
import {
  DIRECTION_META,
  ICONS,
  ICON_TONES,
  KIND_META,
  ageHours,
  isStale,
  money,
  ruleName,
  shortId,
} from "./meta";
import type { Approval, ApprovalState } from "./types";

const STATE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "open", label: "Open" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_TONE: Record<string, BadgeTone> = {
  Ready: "success",
  "Needs review": "warning",
  Blocked: "danger",
  Approved: "success",
  Rejected: "danger",
};

/** The label the Status column shows — readiness while open, outcome once resolved. */
function statusLabel(approval: Approval) {
  if (approval.state === "proposed") return approval.readiness;
  return approval.state === "approved" ? "Approved" : "Rejected";
}

const COLUMNS: Array<DataTableColumn<Approval>> = [
  {
    key: "title",
    label: "Change",
    grow: true,
    minWidth: 320,
    sortable: true,
    filterable: false,
    render: (_value, row) => (
      <EntityCell
        className="text-mv-md"
        icon={ICONS[row.icon]}
        iconTone={ICON_TONES[row.icon]}
        // Merivio draws the row's primary link in `--accent-2`; the cell's own
        // `text-foreground` sits on the wrapper, so a child span wins.
        title={<span className="text-mv-accent-2">{row.title}</span>}
        subtitle={
          <span className="text-mv-sm">
            {row.subtitle}
            <span className="px-1 text-mv-muted-2">·</span>
            <span className="font-mono">{shortId(row.id)}</span>
          </span>
        }
      />
    ),
  },
  {
    key: "kind",
    label: "Kind",
    sortable: true,
    filterable: true,
    shrink: true,
    accessor: (row) => KIND_META[row.kind].label,
    render: (value) => <MvChip>{String(value)}</MvChip>,
  },
  {
    key: "direction",
    label: "Direction",
    sortable: true,
    filterable: true,
    accessor: (row) => DIRECTION_META[row.direction].label,
    render: (value, row) => (
      <MvDirChip icon={DIRECTION_META[row.direction].icon}>
        {String(value)}
      </MvDirChip>
    ),
  },
  {
    key: "module",
    label: "Rule · module",
    sortable: true,
    filterable: true,
    minWidth: 180,
    render: (_value, row) => (
      <div className="min-w-0">
        <div className="truncate font-mono text-mv-base text-mv-ink-2">
          {ruleName(row.id)}
        </div>
        <div className="truncate text-mv-sm text-mv-muted">
          {row.module} · v{row.ruleVersion}
        </div>
      </div>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    sortable: true,
    filterable: false,
    shrink: true,
    sortValue: (_value, row) => row.amount ?? Number.NEGATIVE_INFINITY,
    render: (_value, row) =>
      row.amount === null ? (
        <span className="font-mono text-mv-base text-mv-muted-2">—</span>
      ) : (
        <span
          className={
            row.amount < 0
              ? "font-mono text-mv-base tabular-nums text-mv-negative"
              : "font-mono text-mv-base font-medium tabular-nums text-mv-ink"
          }
        >
          {money(row.amount)}
        </span>
      ),
  },
  {
    key: "age",
    label: "Age",
    align: "right",
    sortable: true,
    filterable: false,
    shrink: true,
    minWidth: 64,
    sortValue: (_value, row) => ageHours(row.age),
    render: (_value, row) => (
      <span
        className={
          isStale(row.age)
            ? "font-mono text-mv-base text-mv-warm"
            : "font-mono text-mv-base text-mv-muted"
        }
      >
        {row.age}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: false,
    shrink: true,
    accessor: statusLabel,
    render: (value) => (
      <MvBadge tone={STATUS_TONE[String(value)] ?? "info"}>
        {String(value)}
      </MvBadge>
    ),
  },
];

export type ApprovalsListProps = {
  /** Every approval, already carrying its resolved state. */
  approvals: Approval[];
  onOpen: (id: string) => void;
  onResolve: (ids: string[], state: ApprovalState) => void;
};

export function ApprovalsList({
  approvals,
  onOpen,
  onResolve,
}: ApprovalsListProps) {
  const [stateFilter, setStateFilter] = useState("open");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const open = useMemo(
    () => approvals.filter((approval) => approval.state === "proposed"),
    [approvals],
  );
  const held = open.filter((approval) => approval.readiness !== "Ready");
  const valueAwaiting = open.reduce(
    (total, approval) => total + (approval.amount ?? 0),
    0,
  );
  const oldest = open.reduce<string | undefined>(
    (worst, approval) =>
      worst === undefined || ageHours(approval.age) > ageHours(worst)
        ? approval.age
        : worst,
    undefined,
  );

  const rows = useMemo(() => {
    if (stateFilter === "all") return approvals;
    const wanted =
      stateFilter === "open" ? "proposed" : (stateFilter as ApprovalState);
    return approvals.filter((approval) => approval.state === wanted);
  }, [approvals, stateFilter]);

  const stateFilterPill: FilterBarFilter = {
    key: "state",
    kind: "enum",
    label: "State",
    value: stateFilter,
    options: STATE_FILTERS,
    onChange: (value) => {
      setStateFilter(value);
      setSelectedRowIds([]);
    },
  };

  function resolve(ids: string[], state: ApprovalState) {
    onResolve(ids, state);
    setSelectedRowIds([]);
  }

  return (
    <div className="flex min-h-0 flex-col gap-density-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-1 flex items-center gap-2 text-mv-xs font-medium uppercase tracking-[0.12em] text-mv-muted">
            <span className="grid size-[22px] shrink-0 place-items-center rounded-mv-sm bg-mv-ink text-base text-mv-paper">
              <Icon icon={ICONS.awaiting} />
            </span>
            Change control
          </div>
          <h1 className="text-[34px] font-semibold leading-none tracking-[-0.02em] text-mv-ink">
            Approval requests
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap pb-1.5 text-mv-base text-mv-muted">
          <span>Queue</span>
          <span className="text-mv-ink-2">Merivio Trading (Pty) Ltd</span>
          <span className="px-1 text-mv-muted-2">·</span>
          <span>Connector</span>
          <span className="text-mv-ink-2">Xero</span>
        </div>
      </div>

      <StatStrip
        className="rounded-mv-lg border-mv-border bg-mv-hair shadow-mv-card"
        classNames={{
          cell: "gap-1.5 bg-mv-surface px-[22px] py-[14px]",
          label:
            "text-mv-xs font-semibold uppercase tracking-[0.08em] text-mv-muted",
          // Merivio's `.bs-value` is always ink — the strip reports, it does
          // not signal, so no item carries a tone.
          value: "font-sans text-mv-stat font-semibold text-mv-ink",
          sub: "text-mv-sm text-mv-muted",
        }}
        items={[
          {
            label: "Open requests",
            value: String(open.length),
            sub: "Awaiting a decision",
          },
          {
            label: "Ready",
            value: String(open.length - held.length),
            sub: "All pre-flight checks clear",
          },
          {
            label: "Held",
            value: String(held.length),
            sub: held.length ? "Blocked or needs review" : "Nothing held",
          },
          {
            label: "Value awaiting",
            value: money(valueAwaiting, 0),
            sub: "ZAR · excludes chart changes",
          },
        ]}
      />

      <DataTable<Approval>
        data={rows}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        autoFilter
        showGlobalFilter
        globalFilterPlaceholder="Search rule, module, requester…"
        externalFilters={[stateFilterPill]}
        defaultSort={{ key: "age", dir: "desc" }}
        emptyMessage="Nothing matches this filter — the queue is clear."
        scrollContainerClassName="max-h-[32rem] rounded-mv-lg rounded-b-none border-b-0 border-mv-border bg-mv-surface"
        onRowClick={(row) => onOpen(row.id)}
        // Merivio only ever tints a row it has selected, so an aged request
        // recedes onto the second surface rather than shouting in warm.
        getRowClassName={(row) =>
          row.state === "proposed" && isStale(row.age)
            ? "bg-mv-surface-2"
            : undefined
        }
        rowSelection={{
          selectedRowIds,
          onSelectionChange: (ids) => setSelectedRowIds(ids),
        }}
        selectionActions={({ selectedRows, clearSelection }) => {
          const selectedValue = selectedRows.reduce(
            (total, row) => total + (row.amount ?? 0),
            0,
          );
          const heldCount = selectedRows.filter(
            (row) => row.readiness !== "Ready",
          ).length;
          return (
            <>
              <span className="text-mv-base">
                <b className="font-medium">{selectedRows.length} selected</b>
                {selectedValue !== 0 && (
                  <span className="text-mv-muted">
                    {" "}
                    · {money(selectedValue)} ZAR
                  </span>
                )}
                {heldCount > 0 && (
                  <span className="text-mv-muted"> · {heldCount} held</span>
                )}
              </span>
              <span className="flex items-center gap-density-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-mv-muted hover:bg-mv-ink-2 hover:text-mv-paper"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-mv-muted bg-transparent text-mv-paper hover:bg-mv-ink-2 hover:text-mv-paper"
                  onClick={() =>
                    resolve(
                      selectedRows.map((row) => row.id),
                      "rejected",
                    )
                  }
                >
                  <Icon icon={ICONS.reversal} />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-mv-paper text-mv-ink hover:bg-mv-paper-2"
                  onClick={() =>
                    resolve(
                      selectedRows.map((row) => row.id),
                      "approved",
                    )
                  }
                >
                  <Icon icon={ICONS.paid} />
                  Approve {selectedRows.length}
                </Button>
              </span>
            </>
          );
        }}
        footer={({ visibleRowCount, totalRowCount }) => (
          // Merivio's `.pager` sits welded to the bottom of the table card, so
          // the strip cancels the shell's footer inset and the 12px flex gap
          // above it and draws the card's own closing edge.
          <span className="-mx-1 -mt-3 flex flex-wrap items-center justify-between gap-2 rounded-b-mv-lg border border-mv-border bg-mv-surface-2 px-4 py-3 text-mv-base text-mv-muted">
            <span>
              Showing <b className="font-medium text-mv-ink-2">{visibleRowCount}</b>{" "}
              of {totalRowCount} requests · oldest {oldest ?? "—"}
            </span>
            <span className="font-mono text-mv-sm text-mv-muted-2">
              Merivio · change control
            </span>
          </span>
        )}
      />
    </div>
  );
}
