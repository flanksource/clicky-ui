import { Tinted } from "./SpanCategory";
import { AgentCard, LlmCard, DbCard, GroupDetail } from "./SpanCards";
import { metric } from "./metrics";
import { StatStrip } from "../../StatStrip";
import { Icon } from "../../Icon";
import { Callout } from "../../Callout";
import { Badge } from "../../Badge";
import { CodeBlock } from "../../CodeBlock";
import { Properties } from "../../Properties";
/**
 * OpenTelemetry waterfall with grouped calls and an adjacent span inspector.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  Button,
  CopyButton,
  SearchInput,
  Section,
  SplitPane,
  Switch,
} from "../../../components";
import {
  UiChevronDown,
  UiChevronRight,
  UiClock,
  UiCoins,
  UiCollapseAll,
  UiDatabase,
  UiExpandAll,
  UiRobotAi,
  UiSparkles,
  UiWarningTriangle,
} from "../../../icons";


import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  buildRows,
  category,
  duration,
  indexTrace,
  isError,
  misparented,
  niceStep,
  num,
  selfTimeMs,
  shortOperation,
  withAncestors,
  type Category,
  type Row,
  type Span,
  type TraceIndex,
  type Trace,
} from "./model";

const CATEGORY_ICON = { agent: UiRobotAi, llm: UiSparkles, db: UiDatabase, other: UiClock } as const;
const ROW_HEIGHT = 28;

const NAME_COLUMN = "minmax(15rem, 36%) minmax(0, 1fr)";


export type OtelTraceDetailProps = {
  trace: Trace;
  selectedSpanId?: string;
  onSelectSpan: (id: string) => void;
  /** Places the trace title elsewhere, e.g. an app shell's top bar; rendered inline when unset. */
  renderTitle?: (title: ReactNode) => ReactNode;
};

export function OtelTraceDetail({ trace: TRACE, selectedSpanId, onSelectSpan, renderTitle }: OtelTraceDetailProps) {
  const index = useMemo(() => indexTrace(TRACE), [TRACE]);
  const suspects = useMemo(() => misparented(index), [index]);
  const selected = selectedSpanId ?? TRACE.spans[0]?.spanId ?? "";
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const groupOf = (id: string) => buildRows(index, { collapsed: new Set(), expanded: new Set(), group: true }).find(row => row.type === "group" && row.spans.some(span => span.spanId === id))?.id;
  const [expanded, setExpanded] = useState(() => new Set([groupOf(selected)].filter(id => id !== undefined)));
  const [group, setGroup] = useState(true);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState(new Set<Category>());
  const [onlySuspects, setOnlySuspects] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && categories.size === 0 && !onlySuspects) return undefined;
    const hits = TRACE.spans.filter(span =>
      (!q || [span.operation, span.service, ...Object.values(span.attributes ?? {}).map(String)].some(text => text.toLowerCase().includes(q))) &&
      (categories.size === 0 || categories.has(category(span))) &&
      (!onlySuspects || suspects.has(span.spanId)));
    return withAncestors(index, hits.map(span => span.spanId));
  }, [index, query, categories, onlySuspects, suspects, TRACE]);

  const rows = useMemo(() => buildRows(index, { collapsed, expanded, group, ...(visible ? { visible } : {}) }), [index, collapsed, expanded, group, visible]);

  const select = (id: string) => {
    const group = groupOf(id);
    if (group) setExpanded(previous => new Set(previous).add(group));
    onSelectSpan(id);
  };
  const toggle = (set: typeof setCollapsed, id: string) => set(previous => {
    const next = new Set(previous);
    if (!next.delete(id)) next.add(id);
    return next;
  });

  const selectedSpan = index.byId.get(selected);
  const selectedGroup = rows.find((row): row is Extract<Row, { type: "group" }> => row.type === "group" && row.id === selected);

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border bg-background p-density-4">
        {renderTitle ? renderTitle(<TraceTitle trace={TRACE} compact />) : <TraceTitle trace={TRACE} />}
        <TraceStats index={index} trace={TRACE} />
        {TRACE.missingParents.length > 0 && <p role="status">Partial trace: {TRACE.missingParents.length} parent spans are missing from this source.</p>}
        {suspects.size > 0 && (
          <Callout variant="warning" title={`${suspects.size} spans run inside a nested agent but hang off its parent`}>
            <p className="text-sm">
              They start and end within <code>{shortOperation(suspects.values().next().value!.operation)}</code>, yet their parent is the root span, so the nested agent looks like it made a single LLM call. This usually means the agent's context is not propagated to its database client.{" "}
              <Button size="sm" variant="link" className="h-auto p-0" onClick={() => setOnlySuspects(on => !on)}>{onlySuspects ? "Show all spans" : "Show only these spans"}</Button>
            </p>
          </Callout>
        )}
        <Toolbar
          trace={TRACE}
          query={query}
          setQuery={setQuery}
          categories={categories}
          toggleCategory={c => setCategories(previous => {
            const next = new Set(previous);
            if (!next.delete(c)) next.add(c);
            return next;
          })}
          group={group}
          setGroup={setGroup}
          expandAll={() => {
            setCollapsed(new Set());
            setExpanded(new Set(rows.filter(row => row.type === "group").map(row => row.id)));
          }}
          collapseAll={() => {
            setExpanded(new Set());
            setCollapsed(new Set(TRACE.spans.filter(span => index.children.has(span.spanId) && !span.parentId).map(span => span.spanId)));
          }}
          shown={rows.length}
        />
        <SplitPane
          stackOnMobile
          defaultSplit={62}
          minLeft={40}
          minRight={25}
          className="rounded-lg border border-border"
          left={<Waterfall index={index} rows={rows} selected={selected} onSelect={select} suspects={suspects} onToggleSpan={id => toggle(setCollapsed, id)} onToggleGroup={id => toggle(setExpanded, id)} expanded={expanded} collapsed={collapsed} />}
          right={
            <div className="h-72 overflow-auto p-density-3 md:h-[calc(100dvh-14rem)] md:min-h-[30rem]">
              {selectedGroup ? <GroupDetail index={index} spans={selectedGroup.spans} onSelect={select} />
                : selectedSpan ? <SpanDetail index={index} span={selectedSpan} host={suspects.get(selectedSpan.spanId)} onSelect={select} />
                : <p className="text-sm text-muted-foreground">Select a span.</p>}
            </div>
          }
        />
      </section>
    </div>
  );
}

function TraceTitle({ trace: { summary }, compact }: { trace: Trace; compact?: boolean }) {
  const status = summary.errors === 0 ? <Badge tone="success" variant="soft">no errors</Badge> : <Badge tone="danger" variant="soft">{summary.errors} errors</Badge>;
  const meta = (
    <>
      <code>{summary.traceId}</code>
      <CopyButton value={summary.traceId} label="Copy trace ID" />
      <span>· {summary.services.join(", ")} · {new Date(summary.startedAt).toLocaleString()}</span>
    </>
  );
  if (compact)
    return (
      <div className="flex min-w-0 flex-1 items-center gap-density-2">
        <h1 className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight" title={summary.operation}>
          <Tinted icon={UiRobotAi} color={CATEGORY_COLOR.agent} />
          <span className="min-w-0 truncate">{shortOperation(summary.operation)}</span>
        </h1>
        {status}
        <p className="hidden min-w-0 items-center gap-2 truncate text-xs text-muted-foreground lg:flex">{meta}</p>
      </div>
    );
  return (
    <div className="min-w-0 space-y-1">
      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Tinted icon={UiRobotAi} color={CATEGORY_COLOR.agent} />
        {shortOperation(summary.operation)}
        {status}
      </h2>
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

function TraceStats({ index, trace: TRACE }: { index: TraceIndex; trace: Trace }) {
  const { summary } = TRACE;
  const by = (c: Category) => TRACE.spans.filter(span => category(span) === c);
  const llm = by("llm");
  const db = by("db");
  const sum = (spans: Span[], key: string) => { const values = spans.map(span => num(span.attributes?.[key])).filter(value => value !== undefined); return values.length ? values.reduce((total, value) => total + value, 0) : undefined; };
  const root = index.roots[0]!;
  const cost = num(root.attributes?.["captain.cost_usd"]);
  const budget = num(root.attributes?.["captain.budget.cost_usd"]);
  const tokensIn = sum(llm, "gen_ai.usage.input_tokens");
  const tokensOut = sum(llm, "gen_ai.usage.output_tokens");
  const ms = (spans: Span[]) => spans.reduce((total, span) => total + span.durationMs, 0);
  return (
      <StatStrip
        items={[
          { label: "Duration", value: duration(summary.durationMs), sub: `${summary.spanCount} spans`, icon: UiClock },
          { label: "LLM", value: duration(ms(llm)), sub: `${llm.length} calls · ${metric(tokensIn)} in / ${metric(tokensOut)} out`, icon: UiSparkles },
          { label: "Database", value: duration(ms(db)), sub: `${db.length} calls · ${new Set(db.map(span => span.attributes?.["db.sql.table"])).size} tables`, icon: UiDatabase },
          { label: "Cost", value: metric(cost, value => `$${value.toFixed(4)}`), sub: budget ? `of $${budget} budget` : "budget unavailable", icon: UiCoins },
          { label: "Root self-time", value: duration(selfTimeMs(index, root)), sub: "not covered by any child span", icon: UiRobotAi, tone: "warning" },
        ]}
      />
  );
}

function Toolbar(props: {
  trace: Trace;
  query: string; setQuery: (q: string) => void;
  categories: Set<Category>; toggleCategory: (c: Category) => void;
  group: boolean; setGroup: (on: boolean) => void;
  expandAll: () => void; collapseAll: () => void; shown: number;
}) {
  const counts = props.trace.spans.reduce((acc, span) => ({ ...acc, [category(span)]: (acc[category(span)] ?? 0) + 1 }), {} as Partial<Record<Category, number>>);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput className="w-72" placeholder="Filter by name, table or attribute" value={props.query} onChange={props.setQuery} />
      {(Object.keys(counts) as Category[]).map(c => {
        const on = props.categories.has(c);
        return (
          <Button key={c} size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => props.toggleCategory(c)}>
            <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {CATEGORY_LABEL[c]} <span className="ml-1 text-muted-foreground">{counts[c]}</span>
          </Button>
        );
      })}
      <label className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Switch checked={props.group} aria-label="Group repeated database calls" onChange={props.setGroup} />
        Group repeated DB calls
      </label>
      <div className="ml-auto flex items-center gap-1">
        <span className="mr-2 text-xs text-muted-foreground">{props.shown} rows</span>
        <Button size="sm" variant="ghost" onClick={props.expandAll}><Icon icon={UiExpandAll} className="mr-1" />Expand all</Button>
        <Button size="sm" variant="ghost" onClick={props.collapseAll}><Icon icon={UiCollapseAll} className="mr-1" />Collapse</Button>
      </div>
    </div>
  );
}

function Waterfall(props: {
  index: TraceIndex; rows: Row[]; selected: string; onSelect: (id: string) => void; suspects: Map<string, Span>;
  onToggleSpan: (id: string) => void; onToggleGroup: (id: string) => void; expanded: Set<string>; collapsed: Set<string>;
}) {
  const { index, rows, selected, onSelect } = props;
  const total = Math.max(index.totalMs, 0.001);
  const step = niceStep(total);
  const ticks = Array.from({ length: Math.floor(total / step) + 1 }, (_, i) => i * step);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(selected)}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  const onKey = (event: KeyboardEvent) => {
    const at = rows.findIndex(row => row.id === selected);
    const next = event.key === "ArrowDown" ? rows[at + 1] : event.key === "ArrowUp" ? rows[at - 1] : undefined;
    const row = rows[at];
    if (next) onSelect(next.id);
    else if (row && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      const open = row.type === "group" ? props.expanded.has(row.id) : !props.collapsed.has(row.id);
      const want = event.key === "ArrowRight";
      if (open !== want && (row.type === "group" || row.childCount > 0)) (row.type === "group" ? props.onToggleGroup : props.onToggleSpan)(row.id);
    } else return;
    event.preventDefault();
  };

  const pct = (ms: number) => `${(ms / total) * 100}%`;
  return (
    <div ref={scroller} tabIndex={0} onKeyDown={onKey} aria-label="Span waterfall" className="h-72 overflow-auto text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[calc(100dvh-14rem)] md:min-h-[30rem]">
      <div className="min-w-[40rem]">
      <div className="sticky top-0 z-10 grid border-b border-border bg-muted text-muted-foreground" style={{ gridTemplateColumns: NAME_COLUMN, height: ROW_HEIGHT }}>
        <div className="flex items-center px-density-2 font-medium">Span</div>
        <div className="relative mr-12">
          {ticks.map(t => <span key={t} className="absolute top-1.5 -translate-x-1/2 tabular-nums" style={{ left: pct(t) }}>{t === 0 ? "0" : duration(t)}</span>)}
        </div>
      </div>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 grid" style={{ gridTemplateColumns: NAME_COLUMN, left: 0, right: 0 }}>
          <div />
          <div className="relative mr-12">{ticks.map(t => <span key={t} className="absolute inset-y-0 border-l border-border" style={{ left: pct(t), opacity: 0.6 }} />)}</div>
        </div>
        {rows.map(row => <WaterfallRow key={row.id} {...props} row={row} pct={pct} active={row.id === selected} />)}
        {rows.length === 0 && <p className="p-density-4 text-sm text-muted-foreground">No spans match these filters.</p>}
      </div>
      </div>
    </div>
  );
}

function WaterfallRow({ index, row, active, pct, onSelect, suspects, onToggleSpan, onToggleGroup, expanded, collapsed }: Parameters<typeof Waterfall>[0] & { row: Row; active: boolean; pct: (ms: number) => string }) {
  const indent = { paddingLeft: `${row.depth * 14 + 4}px` };
  const toggleButton = (open: boolean, onClick: () => void, label: string) => (
    <button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${label}`} className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted" onClick={event => { event.stopPropagation(); onClick(); }}>
      <Icon icon={open ? UiChevronDown : UiChevronRight} />
    </button>
  );
  const rowClass = `relative grid w-full cursor-pointer items-center text-left ${active ? "bg-accent" : "hover:bg-muted"}`;

  if (row.type === "group") {
    const open = expanded.has(row.id);
    const ops = Object.entries(row.spans.reduce<Record<string, number>>((acc, span) => ({ ...acc, [span.operation.replace("gorm.", "")]: (acc[span.operation.replace("gorm.", "")] ?? 0) + 1 }), {}));
    const first = index.offsetMs(row.spans[0]!);
    const last = row.spans.at(-1)!;
    const end = index.offsetMs(last) + last.durationMs;
    const busy = row.spans.reduce((total, span) => total + span.durationMs, 0);
    const suspectCount = row.spans.filter(span => suspects.has(span.spanId)).length;
    return (
      <div role="button" tabIndex={-1} data-row-id={row.id} aria-selected={active} className={rowClass} style={{ gridTemplateColumns: NAME_COLUMN, height: ROW_HEIGHT }} onClick={() => onSelect(row.id)}>
        <div className="flex min-w-0 items-center gap-1 pr-2" style={indent}>
          {toggleButton(open, () => onToggleGroup(row.id), "database group")}
          <Tinted icon={UiDatabase} color={CATEGORY_COLOR.db} />
          <span className="truncate"><span className="font-medium">{row.spans.length} DB calls</span> <span className="text-muted-foreground">{ops.map(([op, n]) => `${op} ×${n}`).join(", ")}</span></span>
          {suspectCount > 0 && <><Tinted icon={UiWarningTriangle} color="var(--fs-warning)" label={`${suspectCount} calls run inside a nested agent but are parented elsewhere`} /><span className="text-muted-foreground">{suspectCount}</span></>}
        </div>
        <div className="relative mr-12 h-full">
          <span className="absolute rounded-sm" style={{ left: pct(first), width: pct(end - first), top: 11, height: 6, background: CATEGORY_COLOR.db, opacity: 0.18 }} />
          {row.spans.map(span => <span key={span.spanId} className="absolute rounded-sm" style={{ left: pct(index.offsetMs(span)), width: pct(span.durationMs), minWidth: 2, top: 8, height: 12, background: CATEGORY_COLOR.db }} />)}
          <BarLabel start={(first / Math.max(index.totalMs, 0.001)) * 100} end={(end / Math.max(index.totalMs, 0.001)) * 100} text={`${duration(busy)} busy`} />
        </div>
      </div>
    );
  }

  const { span } = row;
  const c = category(span);
  const parent = span.parentId ? index.byId.get(span.parentId) : undefined;
  const left = (index.offsetMs(span) / Math.max(index.totalMs, 0.001)) * 100;
  const width = (span.durationMs / Math.max(index.totalMs, 0.001)) * 100;
  const error = isError(span);
  const label = shortOperation(span.operation);
  const table = span.attributes?.["db.sql.table"];
  return (
    <div role="button" tabIndex={-1} data-row-id={row.id} aria-selected={active} className={rowClass} style={{ gridTemplateColumns: NAME_COLUMN, height: ROW_HEIGHT }} onClick={() => onSelect(row.id)} title={span.operation}>
      <div className="flex min-w-0 items-center gap-1 pr-2" style={indent}>
        {row.childCount > 0 ? toggleButton(!collapsed.has(span.spanId), () => onToggleSpan(span.spanId), label) : <span className="size-5 shrink-0" />}
        <Tinted icon={CATEGORY_ICON[c]} color={CATEGORY_COLOR[c]} />
        {parent && parent.service !== span.service && <Badge size="sm" variant="outline">{span.service}</Badge>}
        <span className={`truncate ${c === "db" ? "" : "font-medium"}`}>{label}</span>
        {typeof table === "string" && <span className="truncate text-muted-foreground">{table}</span>}
        {row.childCount > 0 && collapsed.has(span.spanId) && <span className="text-muted-foreground">+{row.childCount}</span>}
        {suspects.has(span.spanId) && <Tinted icon={UiWarningTriangle} color="var(--fs-warning)" label="Runs inside a nested agent but is parented elsewhere" />}
        {error && <Badge size="sm" tone="danger" variant="soft">error</Badge>}
      </div>
      <div className="relative mr-12 h-full">
        <span className="absolute rounded-sm" style={{ left: `${left}%`, width: `${width}%`, minWidth: 2, top: 7, height: 14, background: error ? "var(--destructive)" : CATEGORY_COLOR[c], opacity: c === "agent" ? 0.85 : 1 }} />
        <BarLabel start={left} end={left + width} inside={width > 14} text={duration(span.durationMs)} />
      </div>
    </div>
  );
}

/** Duration next to the bar's end — or inside a wide bar — and flipped left of the start near the right edge. */
function BarLabel({ start, end, inside, text }: { start: number; end: number; inside?: boolean; text: string }) {
  if (inside) return <span className="absolute top-1.5 px-1.5 font-medium text-white tabular-nums" style={{ left: `${start}%` }}>{text}</span>;
  const position = end > 90 ? { right: `${100 - start}%`, paddingRight: 4 } : { left: `${end}%`, paddingLeft: 4 };
  return <span className="absolute top-1.5 whitespace-nowrap tabular-nums text-muted-foreground" style={position}>{text}</span>;
}

function SpanDetail({ index, span, host, onSelect }: { index: TraceIndex; span: Span; host: Span | undefined; onSelect: (id: string) => void }) {
  const c = category(span);
  const ancestors: Span[] = [];
  for (let p = span.parentId ? index.byId.get(span.parentId) : undefined; p; p = p.parentId ? index.byId.get(p.parentId) : undefined) ancestors.unshift(p);
  const attributes = Object.entries(span.attributes ?? {});
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {ancestors.length > 0 && (
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {ancestors.map(a => (
              <span key={a.spanId} className="inline-flex items-center gap-1">
                <button type="button" className="hover:underline" onClick={() => onSelect(a.spanId)}>{shortOperation(a.operation)}</button>
                <Icon icon={UiChevronRight} />
              </span>
            ))}
          </p>
        )}
        <h3 className="flex items-center gap-2 text-base font-semibold" title={span.operation}>
          <Tinted icon={CATEGORY_ICON[c]} color={CATEGORY_COLOR[c]} />
          <span className="truncate">{shortOperation(span.operation)}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge variant="soft" size="sm">{CATEGORY_LABEL[c]}</Badge>
          {span.kind && <Badge variant="outline" size="sm">{span.kind}</Badge>}
          {isError(span) && <Badge tone="danger" variant="soft" size="sm">error</Badge>}
          <span className="tabular-nums text-muted-foreground">{duration(span.durationMs)} · starts at +{duration(index.offsetMs(span))}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground"><code>{span.spanId}</code><CopyButton value={span.spanId} label="Copy span ID" /></span>
        </div>
      </div>
      {host && (
        <Callout variant="warning" title="Likely mis-parented">
          <p className="text-sm">Runs entirely inside <button type="button" className="underline" onClick={() => onSelect(host.spanId)}>{shortOperation(host.operation)}</button> but its parent is {span.parentId ? shortOperation(index.byId.get(span.parentId)?.operation ?? span.parentId) : "missing"}.</p>
        </Callout>
      )}
      {c === "agent" && <AgentCard index={index} span={span} />}
      {c === "llm" && <LlmCard span={span} />}
      {c === "db" && <DbCard span={span} />}
      <Section title={`All attributes (${attributes.length})`} defaultOpen={c === "other"}>
        <Properties renderLabel={key => <code className="text-xs">{key}</code>} items={attributes.map(([key, value]) => ({ key, value }))} />
      </Section>
      {span.otlp && <Section title="OpenTelemetry metadata" defaultOpen={false}><CodeBlock language="json" source={JSON.stringify(span.otlp, null, 2)} jsonDefaultOpenDepth={4} copyable /></Section>}
      <Section title={`Resource (${Object.keys(span.resource ?? {}).length})`} defaultOpen={false}>
        <Properties renderLabel={key => <code className="text-xs">{key}</code>} items={Object.entries(span.resource ?? {}).map(([key, value]) => ({ key, value }))} />
      </Section>
    </div>
  );
}

