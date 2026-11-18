import { useMemo, useState } from "react";
import { Badge, DataTable, FilterBar, Properties, Tabs, formatBytes, formatDuration, type DataTableColumn } from "@flanksource/clicky-ui";
import type { WorkerActivity } from "../activity-schema.ts";
import { activityLibraries, summarizeActivity, type ActivityLibrary, type ActivityLoad, type ActivitySummary, type RuntimeActivityState } from "./activity-state.ts";

const sizes = (value: number | null) => value === null ? "Unavailable" : formatBytes(value);
const requestColumns: DataTableColumn<WorkerActivity>[] = [
  { key: "kind", label: "Kind", render: (_, r) => <Badge>{r.kind}</Badge> },
  { key: "url", label: "File", render: (_, r) => <span title={r.url}>{r.package ? `${r.package.name}@${r.package.version}/${r.package.path}` : new URL(r.url).pathname}</span> },
  { key: "source", label: "Source" }, { key: "transferredBytes", label: "Transferred", align: "right", render: (_, r) => sizes(r.transferredBytes) },
  { key: "decodedBytes", label: "Decoded", align: "right", render: (_, r) => sizes(r.decodedBytes) },
  { key: "outputBytes", label: "Output", align: "right", render: (_, r) => sizes(r.outputBytes) },
  { key: "totalMs", label: "Time", align: "right", render: (_, r) => formatDuration(r.totalMs) }, { key: "status", label: "Status", align: "right" },
];
const libraryColumns: DataTableColumn<ActivityLibrary>[] = [
  { key: "id", label: "Package" }, { key: "role", label: "Runtime set", render: (_, r) => <Badge>{r.role}</Badge> },
  { key: "origin", label: "Origin", render: (_, r) => <span title={r.origin}>{r.origin}</span> },
  { key: "files", label: "Files", align: "right" }, { key: "transferredBytes", label: "Transferred", align: "right", render: (_, r) => `${formatBytes(r.transferredBytes)}${r.unknownTransfers ? " + unknown" : ""}` },
  { key: "decodedBytes", label: "Decoded", align: "right", render: (_, r) => formatBytes(r.decodedBytes) }, { key: "cacheRatio", label: "Cache hits", align: "right", render: (_, r) => `${Math.round(r.cacheRatio * 100)}%` },
];

export function RuntimeActivity({ activity, className = "" }: { activity: RuntimeActivityState; className?: string }) {
  const [tab, setTab] = useState("summary");
  const libraries = useMemo(() => activity.current ? activityLibraries(activity.current) : [], [activity.current]);
  return <section aria-label="Runtime activity" className={`flex min-h-0 flex-col overflow-hidden bg-background text-foreground ${className}`}>
    <Tabs value={tab} onChange={setTab} tabs={[{ id: "libraries", label: "Libraries", count: libraries.length }, { id: "requests", label: "Requests", count: activity.current?.records.length ?? 0 }, { id: "timeline", label: "Timeline" }, { id: "summary", label: "Summary" }]} />
    {!activity.current ? <p className="p-density-3 text-sm text-muted-foreground">Waiting for runtime activity. Open a page to inspect its requests and rendering.</p> : <div role="tabpanel" aria-label={tab} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {tab === "libraries" && <DataTable data={libraries} columns={libraryColumns} virtualize getRowId={(r) => r.id} className="min-h-0 flex-1" />}
      {tab === "requests" && <Requests key={activity.current.id} load={activity.current} />}
      {tab === "timeline" && <Timeline load={activity.current} />}
      {tab === "summary" && <div className="overflow-auto p-density-3"><Summary title="Current load" summary={summarizeActivity(activity.current)} />
        {activity.current.runtime && <Properties<unknown> items={[{ key: "Import map", value: formatBytes(activity.current.runtime.importMapBytes) }, { key: "Scopes", value: activity.current.runtime.scopes }, { key: "Base set", value: activity.current.runtime.base }]} />}
        {activity.previous && <Summary title="Previous load" summary={activity.previous} />}</div>}
    </div>}
  </section>;
}

function Requests({ load }: { load: ActivityLoad }) {
  const [kind, setKind] = useState(""); const [pkg, setPackage] = useState(""); const [source, setSource] = useState("");
  const [selected, setSelected] = useState<WorkerActivity | null>(null);
  const records = useMemo(() => load.records.filter((r) => (!kind || r.kind === kind) && (!pkg || r.package?.name === pkg) && (!source || r.source === source)), [load.records, kind, pkg, source]);
  return <>
    <FilterBar filters={[
      { kind: "enum", key: "kind", label: "Kind", value: kind, options: ["", "frame", "src", "npm", "link", "static"].map((value) => ({ value, label: value || "All kinds" })), onChange: setKind },
      { kind: "enum", key: "package", label: "Package", value: pkg, options: ["", ...new Set(load.records.flatMap((r) => r.package ? [r.package.name] : []))].map((value) => ({ value, label: value || "All packages" })), onChange: setPackage },
      { kind: "enum", key: "source", label: "Source", value: source, options: ["", "cache", "network", "compiled", "generated"].map((value) => ({ value, label: value || "All sources" })), onChange: setSource },
    ]} className="shrink-0 p-density-2" />
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <DataTable data={records} columns={requestColumns} virtualize getRowId={(r) => r.id} onRowClick={setSelected} className="min-h-0 min-w-0 flex-1" />
      {selected && <aside aria-label="Request details" className="w-80 shrink-0 overflow-auto border-l border-border p-density-3"><Properties items={Object.entries(selected).map(([key, value]) => ({ key, value }))} valueClassName="break-all" /></aside>}
    </div>
  </>;
}

function Timeline({ load }: { load: ActivityLoad }) {
  const marks = load.timeline.map((mark, index) => ({ name: mark.phase, start: load.timeline[index - 1]?.atMs ?? 0, end: mark.atMs, detail: formatDuration(mark.atMs) }));
  const builds = load.tailwind.map((build) => ({ name: `Tailwind ${build.kind}${build.cacheHit ? " (cache)" : ""}`, start: build.startMs, end: build.startMs + build.durationMs, detail: `${build.candidates} candidates · ${formatBytes(build.cssBytes)} · ${formatDuration(build.durationMs)}` }));
  const end = Math.max(1, ...marks.map((mark) => mark.end), ...builds.map((build) => build.end));
  return <div className="overflow-auto p-density-3 text-sm">
    <p className="mb-density-2 text-muted-foreground">Durations from navigation start. Bars show boot phases and Tailwind work.</p>
    {[...marks, ...builds].map((mark, index) => <div key={index} className="grid grid-cols-[10rem_1fr_15rem] items-center gap-density-2 py-1">
      <span>{mark.name}</span><div className="h-3 rounded bg-muted"><div className="h-full min-w-0.5 rounded bg-primary" style={{ marginLeft: `${mark.start / end * 100}%`, width: `${Math.max(0.1, (mark.end - mark.start) / end * 100)}%` }} /></div><span className="text-right tabular-nums">{mark.detail}</span>
    </div>)}
    <p className="mt-density-3">Last edit → visible reload: {load.editToVisibleMs === undefined ? "No edit in this load" : formatDuration(load.editToVisibleMs)}</p>
  </div>;
}

function Summary({ title, summary }: { title: string; summary: ActivitySummary }) {
  return <div className="mb-density-3"><h3 className="mb-density-2 text-sm font-medium">{title}</h3><Properties<unknown> items={[
    { key: "Requests", value: summary.requests }, { key: "Transferred", value: `${formatBytes(summary.transferredBytes)}${summary.unknownTransfers ? ` + ${summary.unknownTransfers} unavailable sizes` : ""}` },
    { key: "Decoded", value: formatBytes(summary.decodedBytes) }, { key: "Output", value: formatBytes(summary.outputBytes) }, { key: "Cache hits", value: `${summary.cacheHits} / ${summary.requests}` },
    { key: "Compile", value: `${formatDuration(summary.compileMs)}${summary.unknownCompiles ? ` + ${summary.unknownCompiles} unavailable timings` : ""}` }, { key: "Time to ready", value: summary.readyMs === null ? "Pending" : formatDuration(summary.readyMs) },
    ...Object.entries(summary.versions).map(([key, value]) => ({ key, value })),
  ]} /></div>;
}
