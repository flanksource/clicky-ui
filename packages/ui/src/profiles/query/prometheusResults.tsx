import { TimeseriesPanel } from "../../data/TimeseriesPanel";
import type { TimeseriesPoint, TimeseriesSeries } from "../../data/TimeseriesPanel.model";
import type { QueryBrowserResult } from "../../data/query-browser/QueryBrowser.types";
import { useMemo, type ReactNode } from "react";

// Each result's series load from its own rows, so the loader cache key
// (`["timeseries", "load", id, range]`) must not repeat across results.
let resultSeq = 0;

export function PrometheusResults({
  result,
  fallback,
}: {
  result: QueryBrowserResult;
  fallback: ReactNode;
}) {
  const series = useMemo(
    () => prometheusSeries(result.rows ?? [], `prometheus-${++resultSeq}`),
    [result.rows],
  );
  if (!series) return fallback;
  return (
    <div className="space-y-3">
      <TimeseriesPanel title="Prometheus query" series={series} refreshMs={0} height={240} />
      {fallback}
    </div>
  );
}

// Prometheus range rows carry `timestamp`; commons-db metric SQL rows carry
// `time`. A row with both is read by `time`.
const TIME_COLUMNS = ["time", "timestamp"] as const;

function rowTime(row: Record<string, unknown>): unknown {
  return row.time ?? row.timestamp;
}

function prometheusSeries(rows: Record<string, unknown>[], prefix: string): TimeseriesSeries[] | null {
  const withTime = rows.filter((row) => rowTime(row) != null && typeof row.value === "number");
  if (withTime.length < 2) return null;
  const groups = new Map<string, TimeseriesPoint[]>();
  for (const row of withTime) {
    const labels = Object.entries(row)
      .filter(([key]) => key !== "value" && !(TIME_COLUMNS as readonly string[]).includes(key))
      .sort(([a], [b]) => a.localeCompare(b));
    const label = labels.map(([key, value]) => `${key}=${String(value)}`).join(", ") || "value";
    const points = groups.get(label) ?? [];
    points.push({ at: new Date(String(rowTime(row))).toISOString(), value: Number(row.value) });
    groups.set(label, points);
  }
  return [...groups].map(([label, points], index) => {
    const id = `${prefix}-${index}`;
    return { id, label, load: async () => ({ id, points }) };
  });
}
