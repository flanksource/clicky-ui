import { useEffect, useState } from "react";
import { Button } from "../../../components";
import { CodeBlock } from "../../CodeBlock";
import { Properties } from "../../Properties";
import { StatStrip } from "../../StatStrip";
import { Icon } from "../../Icon";
import { UiDatabase, UiSqlQuery } from "../../../icons";
import { Tinted } from "./SpanCategory";
import { CATEGORY_COLOR, category, duration, num, selfTimeMs, type Span, type TraceIndex } from "./model";
import { metric } from "./metrics";
const attr = (span: Span, key: string) => span.attributes?.[key];

export function AgentCard({ index, span }: { index: TraceIndex; span: Span }) {
  const cost = num(attr(span, "captain.cost_usd"));
  const budget = num(attr(span, "captain.budget.cost_usd"));
  const kids = index.children.get(span.spanId) ?? [];
  return (
    <div className="space-y-3">
      <StatStrip
        columns={3}
        items={[
          { label: "Iterations", value: `${attr(span, "captain.iterations") ?? "—"} / ${attr(span, "captain.max_iterations") ?? "—"}` },
          { label: "Stopped", value: String(attr(span, "captain.stop_reason") ?? "—"), tone: attr(span, "captain.verified") === true ? "success" : "warning", sub: attr(span, "captain.verified") === true ? "verified" : "not verified" },
          { label: "Cost", value: metric(cost, value => `$${value.toFixed(5)}`), sub: budget && cost !== undefined ? `${((cost / budget) * 100).toFixed(3)}% of $${budget}` : "budget unavailable" },
        ]}
      />
      <Properties items={[
        { key: "Prompt", value: String(attr(span, "gen_ai.agent.name") ?? "—") },
        { key: "Scope", value: String(attr(span, "captain.scope") ?? "—") },
        { key: "Children", value: `${kids.length} spans · ${kids.filter(k => category(k) === "llm").length} LLM · ${kids.filter(k => category(k) === "db").length} DB` },
        { key: "Self-time", value: `${duration(selfTimeMs(index, span))} not covered by a child span` },
      ]} />
    </div>
  );
}

export function LlmCard({ span }: { span: Span }) {
  const n = (key: string) => num(attr(span, key));
  const requested = attr(span, "gen_ai.request.model");
  const served = attr(span, "gen_ai.response.model");
  const output = n("gen_ai.usage.output_tokens");
  const outRate = output !== undefined && span.durationMs > 0 ? output / (span.durationMs / 1000) : undefined;
  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="text-muted-foreground">{String(attr(span, "gen_ai.provider.name") ?? "—")} · </span>
        <code>{String(requested ?? "—")}</code>
        {served !== undefined && served !== requested && <> → <code>{String(served ?? "—")}</code></>}
        <span className="text-muted-foreground"> · {String(attr(span, "captain.mode") ?? "—")} · {String(attr(span, "captain.prompt.source") ?? "—")}</span>
      </p>
      <StatStrip
        columns={4}
        items={[
          { label: "Input", value: metric(n("gen_ai.usage.input_tokens")), sub: `${metric(n("gen_ai.usage.cache_read.input_tokens"))} cached` },
          { label: "Output", value: metric(n("gen_ai.usage.output_tokens")), sub: `${metric(n("gen_ai.usage.reasoning_tokens"))} reasoning` },
          { label: "Throughput", value: metric(outRate, value => value.toFixed(0)), sub: "output tok/s" },
          { label: "Cost", value: metric(n("captain.cost_usd"), value => `$${value.toFixed(5)}`) },
        ]}
      />
    </div>
  );
}

const PREVIEW_CHARS = 1200;

export function DbCard({ span }: { span: Span }) {
  const statement = String(attr(span, "db.statement") ?? "");
  const [full, setFull] = useState(false);
  useEffect(() => setFull(false), [span.spanId]);
  const clipped = statement.length > PREVIEW_CHARS && !full;
  return (
    <div className="space-y-3">
      <p className="text-sm"><span className="text-muted-foreground">{String(attr(span, "db.system"))} · </span><code>{String(attr(span, "db.sql.table") ?? "no table")}</code></p>
      <StatStrip
        columns={2}
        items={[
          { label: "Rows affected", value: String(attr(span, "db.rows_affected") ?? "—") },
          { label: "Statement", value: `${(statement.length / 1024).toFixed(statement.length > 10240 ? 0 : 1)} KB`, sub: span.operation.replace("gorm.", ""), tone: statement.length > 10240 ? "warning" : "neutral" },
        ]}
      />
      <div className="space-y-1">
        <CodeBlock language="sql" source={clipped ? `${statement.slice(0, PREVIEW_CHARS)} …` : statement} copyable />
        {statement.length > PREVIEW_CHARS && (
          <Button size="sm" variant="ghost" onClick={() => setFull(on => !on)}>
            <Icon icon={UiSqlQuery} className="mr-1" />
            {full ? "Clip statement" : `Show all ${statement.length.toLocaleString()} characters`}
          </Button>
        )}
      </div>
    </div>
  );
}

export function GroupDetail({ index, spans, onSelect }: { index: TraceIndex; spans: Span[]; onSelect: (id: string) => void }) {
  const busy = spans.reduce((total, span) => total + span.durationMs, 0);
  const tables = new Map<string, { calls: number; ms: number }>();
  for (const span of spans) {
    const key = String(attr(span, "db.sql.table") ?? "—");
    const entry = tables.get(key) ?? { calls: 0, ms: 0 };
    tables.set(key, { calls: entry.calls + 1, ms: entry.ms + span.durationMs });
  }
  const slowest = [...spans].sort((a, b) => b.durationMs - a.durationMs)[0]!;
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-base font-semibold"><Tinted icon={UiDatabase} color={CATEGORY_COLOR.db} />{spans.length} consecutive database calls</h3>
      <StatStrip
        columns={3}
        items={[
          { label: "Busy", value: duration(busy), sub: `over ${duration(index.offsetMs(spans.at(-1)!) + spans.at(-1)!.durationMs - index.offsetMs(spans[0]!))} wall` },
          { label: "Tables", value: String(tables.size) },
          { label: "Slowest", value: duration(slowest.durationMs), sub: `${slowest.operation.replace("gorm.", "")} ${String(attr(slowest, "db.sql.table"))}` },
        ]}
      />
      <table className="w-full text-xs">
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr><th className="py-1 font-medium">Call</th><th className="py-1 font-medium">Table</th><th className="py-1 text-right font-medium">Rows</th><th className="py-1 text-right font-medium">Duration</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {spans.map(span => (
            <tr key={span.spanId} className="cursor-pointer hover:bg-muted" onClick={() => onSelect(span.spanId)}>
              <td className="py-1">{span.operation.replace("gorm.", "")}</td>
              <td className="py-1 text-muted-foreground">{String(attr(span, "db.sql.table") ?? "—")}</td>
              <td className="py-1 text-right tabular-nums">{String(attr(span, "db.rows_affected") ?? "")}</td>
              <td className="py-1 text-right tabular-nums">{duration(span.durationMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
