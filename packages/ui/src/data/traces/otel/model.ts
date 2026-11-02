/**
 * Span trees, precise timing, repeated-call grouping and parenting diagnostics.
 */


export type Span = {
  spanId: string;
  parentId?: string;
  service: string;
  operation: string;
  kind?: string;
  startedAt: string;
  durationMs: number;
  status: string;
  attributes?: Record<string, unknown>;
  resource?: Record<string, unknown>;
  otlp?: Record<string, unknown>;
};
export type Trace = {
  summary: { traceId: string; service: string; operation: string; startedAt: string; durationMs: number; spanCount: number; errors: number; services: string[] };
  spans: Span[];
  missingParents: string[];
};


export type Category = "agent" | "llm" | "db" | "other";
export const CATEGORY_LABEL: Record<Category, string> = { agent: "Agent", llm: "LLM", db: "Database", other: "Other" };
/** Shared theme colors for the four span categories. */
export const CATEGORY_COLOR: Record<Category, string> = { agent: "var(--primary)", llm: "var(--fs-prereq-500)", db: "var(--fs-info)", other: "var(--muted-foreground)" };

export function category(span: Span): Category {
  const op = span.attributes?.["gen_ai.operation.name"];
  if (op === "invoke_agent") return "agent";
  if (op === "chat" || op === "text_completion" || op === "embeddings") return "llm";
  if (span.attributes?.["db.system"] !== undefined) return "db";
  return "other";
}

export const isError = (span: Span) => ["error", "2"].includes(span.status.toLowerCase());

/** `invoke_agent /abs/path/.captain/prompts/jira/x.prompt` → `invoke_agent jira/x.prompt`. */
export const shortOperation = (op: string) => op.replace(/ \/\S*\/prompts\//, " ");

/** RFC3339 with up to nanosecond fraction → epoch microseconds (Date.parse keeps only ms). */
export function micros(iso: string): number {
  const match = /^(.*?)(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(iso);
  if (!match) throw new Error(`unexpected timestamp ${iso}`);
  const seconds = Date.parse(`${match[1]}${match[3]}`);
  if (!Number.isFinite(seconds)) throw new Error(`unexpected timestamp ${iso}`);
  return seconds * 1000 + Number((match[2] ?? "").padEnd(6, "0").slice(0, 6));
}

export const duration = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : ms >= 10 ? `${ms.toFixed(0)} ms` : ms >= 1 ? `${ms.toFixed(1)} ms` : `${(ms * 1000).toFixed(0)} µs`;

export type TraceIndex = {
  byId: Map<string, Span>;
  children: Map<string, Span[]>;
  roots: Span[];
  offsetMs: (span: Span) => number;
  totalMs: number;
};

export function indexTrace(trace: Trace): TraceIndex {
  const byId = new Map(trace.spans.map(span => [span.spanId, span]));
  if (byId.size !== trace.spans.length) throw new Error("duplicate span ids");
  for (const span of trace.spans) {
    const seen = new Set<string>();
    for (let current: Span | undefined = span; current; current = current.parentId ? byId.get(current.parentId) : undefined) {
      if (seen.has(current.spanId)) throw new Error("span parent cycle");
      seen.add(current.spanId);
    }
  }
  const children = new Map<string, Span[]>();
  const roots: Span[] = [];
  for (const span of trace.spans) {
    if (span.parentId && byId.has(span.parentId)) children.set(span.parentId, [...(children.get(span.parentId) ?? []), span]);
    else roots.push(span);
  }
  const order = (a: Span, b: Span) => micros(a.startedAt) - micros(b.startedAt) || a.spanId.localeCompare(b.spanId);
  roots.sort(order);
  for (const list of children.values()) list.sort(order);
  const t0 = micros(trace.summary.startedAt);
  return { byId, children, roots, offsetMs: span => (micros(span.startedAt) - t0) / 1000, totalMs: trace.summary.durationMs };
}

export type Row =
  | { type: "span"; id: string; depth: number; span: Span; childCount: number }
  | { type: "group"; id: string; depth: number; spans: Span[] };

export const GROUP_MIN = 3;

/**
 * Depth-first rows. With `group`, every run of ≥ GROUP_MIN consecutive leaf DB
 * siblings becomes one group row; `expanded` opens a group, `collapsed` closes
 * a span. `visible`, when set, keeps only those spans (callers include ancestors).
 */
export function buildRows(index: TraceIndex, opts: { collapsed: Set<string>; expanded: Set<string>; group: boolean; visible?: Set<string> }): Row[] {
  const rows: Row[] = [];
  const walk = (siblings: Span[], depth: number) => {
    const shown = opts.visible ? siblings.filter(span => opts.visible!.has(span.spanId)) : siblings;
    let i = 0;
    while (i < shown.length) {
      let j = i;
      const groupable = (span: Span) => opts.group && category(span) === "db" && !index.children.has(span.spanId);
      while (j < shown.length && groupable(shown[j]!)) j++;
      if (j - i >= GROUP_MIN) {
        const spans = shown.slice(i, j);
        const id = `group:${spans[0]!.spanId}`;
        rows.push({ type: "group", id, depth, spans });
        if (opts.expanded.has(id)) for (const span of spans) rows.push({ type: "span", id: span.spanId, depth: depth + 1, span, childCount: 0 });
        i = j;
        continue;
      }
      const span = shown[i]!;
      const kids = index.children.get(span.spanId) ?? [];
      rows.push({ type: "span", id: span.spanId, depth, span, childCount: kids.length });
      if (!opts.collapsed.has(span.spanId)) walk(kids, depth + 1);
      i++;
    }
  };
  walk(index.roots, 0);
  return rows;
}

export function withAncestors(index: TraceIndex, ids: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const id of ids)
    for (let span = index.byId.get(id); span && !out.has(span.spanId); span = span.parentId ? index.byId.get(span.parentId) : undefined) out.add(span.spanId);
  return out;
}

/** Spans that run entirely inside a sibling agent span yet hang off the shared parent — usually lost context propagation. */
export function misparented(index: TraceIndex): Map<string, Span> {
  const out = new Map<string, Span>();
  for (const siblings of [index.roots, ...index.children.values()]) {
    const agents = siblings.filter(span => category(span) === "agent");
    for (const span of siblings) {
      const start = index.offsetMs(span);
      const host = agents.find(agent => agent !== span && start >= index.offsetMs(agent) && start + span.durationMs <= index.offsetMs(agent) + agent.durationMs);
      if (host) out.set(span.spanId, host);
    }
  }
  return out;
}

/** Wall time of `span` not covered by any direct child. */
export function selfTimeMs(index: TraceIndex, span: Span): number {
  const start = index.offsetMs(span);
  const finish = start + span.durationMs;
  const intervals = (index.children.get(span.spanId) ?? []).map(child => [Math.max(start, index.offsetMs(child)), Math.min(finish, index.offsetMs(child) + child.durationMs)] as const).filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0]);
  let covered = 0;
  let end = -Infinity;
  for (const [s, e] of intervals) {
    if (e <= end) continue;
    covered += e - Math.max(s, end);
    end = e;
  }
  return span.durationMs - covered;
}

export const num = (value: unknown) => (value === undefined ? undefined : Number(value));

export function niceStep(totalMs: number, ticks = 6): number {
  const raw = totalMs / ticks;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(m => m * pow).find(step => step >= raw)!;
}
