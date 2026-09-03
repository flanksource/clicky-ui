import { useState } from "react";
import {
  AccordionList,
  Badge,
  Button,
  DataTable,
  Modal,
  Panel,
  StackedStatusBar,
  StatStrip,
  StatusRows,
  Timeline,
  Tree,
  cn,
  type DataTableColumn,
} from "@flanksource/clicky-ui";
import {
  UiActivity,
  UiChevronDown,
  UiChevronRight,
  UiRocket,
  UiWarningCircle,
} from "@flanksource/clicky-ui/icons";

import {
  SERVICES,
  SERVICE_EVENTS,
  SERVICE_TREE,
  STATUS_SEGMENTS,
  STATUS_TONE,
  type ServiceNode,
  type ServiceRow,
} from "./collection-data";

// One specimen per collection style. Each is deliberately small: the point of
// comparison is the shape of the presentation, not how much data it can hold.

const TABLE_COLUMNS: DataTableColumn<ServiceRow>[] = [
  { key: "service", label: "Service", grow: true, sortable: true },
  { key: "namespace", label: "Namespace", sortable: true },
  { key: "status", label: "Status", kind: "status", status: { showLabel: true }, sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "checked", label: "Last checked", align: "right" },
];

function StatusPill({ status }: { status: ServiceRow["status"] }) {
  return (
    <Badge tone={STATUS_TONE[status]} size="xxs" variant="soft" clickToCopy={false}>
      {status}
    </Badge>
  );
}

export function TableSpecimen() {
  return (
    <div className="h-[22rem] overflow-hidden rounded-lg border border-border bg-card">
      <DataTable
        data={SERVICES}
        columns={TABLE_COLUMNS}
        getRowId={(row) => row.service}
        className="h-full"
      />
    </div>
  );
}

export function RowsSpecimen() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {SERVICES.slice(0, 5).map((row) => (
        <div key={row.service} className="flex items-start justify-between gap-density-3 p-density-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{row.service}</p>
            <p className="truncate text-xs text-muted-foreground">{row.summary}</p>
          </div>
          <div className="flex shrink-0 items-center gap-density-3">
            <span className="text-xs text-muted-foreground">{row.checked}</span>
            <StatusPill status={row.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardsSpecimen() {
  const groups = (["Healthy", "Warning", "Failed"] as const).map(
    (status) =>
      [status, SERVICES.slice(0, 6).filter((row) => row.status === status)] as const,
  );
  return (
    <div className="space-y-density-4">
      <StatStrip
        columns={4}
        items={[
          { label: "Services", value: SERVICES.length, sub: "3 states" },
          { label: "Healthy", value: SERVICES.filter((row) => row.status === "Healthy").length, tone: "success" },
          { label: "Warning", value: SERVICES.filter((row) => row.status === "Warning").length, tone: "warning" },
          { label: "Failed", value: SERVICES.filter((row) => row.status === "Failed").length, tone: "danger" },
        ]}
      />
      {groups.map(([status, rows]) => (
        <section key={status} className="space-y-density-2">
          <header className="flex items-center gap-density-2">
            <StatusPill status={status as ServiceRow["status"]} />
            <span className="text-xs text-muted-foreground">{rows.length} services</span>
          </header>
          <div className="grid gap-density-3 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]">
            {rows.map((row) => (
              <article key={row.service} className="flex min-h-36 flex-col rounded-lg border border-border bg-card p-density-3">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-primary">
                  <UiActivity className="size-4" />
                </span>
                <h4 className="mt-density-3 text-sm font-semibold text-foreground">{row.service}</h4>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{row.summary}</p>
                <p className="mt-auto pt-density-3 text-[11px] text-muted-foreground">{row.owner} · {row.checked}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ServiceDetail({ service }: { service: ServiceRow }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-density-4 gap-y-density-2 text-sm">
      <dt className="text-muted-foreground">Status</dt><dd><StatusPill status={service.status} /></dd>
      <dt className="text-muted-foreground">Namespace</dt><dd>{service.namespace}</dd>
      <dt className="text-muted-foreground">Owner</dt><dd>{service.owner}</dd>
      <dt className="text-muted-foreground">Last checked</dt><dd>{service.checked}</dd>
      <dt className="text-muted-foreground">Summary</dt><dd>{service.summary}</dd>
    </dl>
  );
}

export function MasterDialogSpecimen() {
  const [selected, setSelected] = useState<ServiceRow>();
  return (
    <>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {SERVICES.slice(0, 5).map((row) => (
          <button key={row.service} type="button" onClick={() => setSelected(row)} className="flex w-full items-center gap-density-3 px-density-3 py-density-2 text-left hover:bg-muted/40">
            <UiActivity className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.service}</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">{row.namespace}</span>
            <StatusPill status={row.status} />
            <UiChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      {selected && (
        <Modal open onClose={() => setSelected(undefined)} title={selected.service} size="sm">
          <ServiceDetail service={selected} />
        </Modal>
      )}
    </>
  );
}

export function MasterRowDetailSpecimen() {
  const [selected, setSelected] = useState(SERVICES[0]!.service);
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {SERVICES.slice(0, 5).map((row) => {
        const open = selected === row.service;
        return (
          <article key={row.service}>
            <Button type="button" variant="ghost" onClick={() => setSelected(open ? "" : row.service)} className="h-auto w-full justify-start rounded-none px-density-3 py-density-2 text-left">
              {open ? <UiChevronDown className="size-4" /> : <UiChevronRight className="size-4" />}
              <span className="min-w-0 flex-1 truncate">{row.service}</span>
              <StatusPill status={row.status} />
            </Button>
            {open && <div className="border-t border-border bg-muted/20 p-density-3"><ServiceDetail service={row} /></div>}
          </article>
        );
      })}
    </div>
  );
}

export function TreeSpecimen() {
  const [selected, setSelected] = useState<ServiceNode | null>(null);
  return (
    <div className="h-[22rem] overflow-auto rounded-lg border border-border bg-card p-density-2">
      <Tree<ServiceNode>
        roots={SERVICE_TREE}
        getKey={(node) => node.key}
        getChildren={(node) => node.children}
        selected={selected}
        onSelect={setSelected}
        defaultOpen={(_node, depth) => depth === 0}
        ariaLabel="Services by namespace"
        renderRow={({ node, selected: isSelected }) => (
          <div className={cn("flex min-w-0 flex-1 items-center gap-density-2 py-0.5", isSelected && "font-medium")}>
            <span className="truncate text-sm text-foreground">{node.label}</span>
            {node.meta && <span className="truncate text-[11px] text-muted-foreground">{node.meta}</span>}
            {node.status && <StatusPill status={node.status} />}
          </div>
        )}
      />
    </div>
  );
}

export function TimelineSpecimen() {
  return (
    <div className="rounded-lg border border-border bg-card p-density-4">
      <Timeline
        items={SERVICE_EVENTS.map((event) => ({
          id: event.id,
          tone: event.tone,
          icon: event.tone === "danger" ? UiWarningCircle : event.tone === "info" ? UiRocket : UiActivity,
          actor: event.actor,
          action: event.action,
          timestamp: event.timestamp,
          ...(event.body ? { body: <p className="text-xs text-muted-foreground">{event.body}</p> } : {}),
        }))}
      />
    </div>
  );
}

export function AccordionSpecimen() {
  const [items, setItems] = useState(SERVICES.slice(0, 4));
  return (
    <div className="rounded-lg border border-border bg-card p-density-3">
      <AccordionList
        items={items}
        onChange={setItems}
        renderHeader={({ item }) => (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-density-3">
            <span className="truncate text-sm font-medium text-foreground">{item.service}</span>
            <span className="flex shrink-0 items-center gap-density-2">
              <span className="text-xs text-muted-foreground">{item.namespace}</span>
              <StatusPill status={item.status} />
            </span>
          </div>
        )}
        renderBody={({ item }) => (
          <dl className="grid grid-cols-[auto_1fr] gap-x-density-3 gap-y-density-2 p-density-3 text-sm">
            <dt className="text-muted-foreground">Summary</dt>
            <dd className="text-foreground">{item.summary}</dd>
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="text-foreground">{item.owner}</dd>
            <dt className="text-muted-foreground">Last checked</dt>
            <dd className="text-foreground">{item.checked}</dd>
          </dl>
        )}
      />
    </div>
  );
}

export function AggregateSpecimen() {
  const failing = SERVICES.filter((row) => row.status !== "Healthy").length;
  return (
    <div className="space-y-density-3">
      <StatStrip
        items={[
          { label: "Services", value: SERVICES.length, sub: "in scope" },
          { label: "Needs attention", value: failing, tone: failing > 0 ? "warning" : "success", sub: "warning or failed" },
          { label: "Namespaces", value: SERVICE_TREE.length },
          { label: "Oldest check", value: "21m", sub: "audit-export" },
        ]}
      />
      <Panel title="Status mix" padded>
        <div className="space-y-density-3">
          <StackedStatusBar segments={STATUS_SEGMENTS} ariaLabel="Service status mix" />
          <StatusRows segments={STATUS_SEGMENTS} ariaLabel="Service status rows" />
        </div>
      </Panel>
    </div>
  );
}
