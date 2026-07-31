export interface ServerTimingMetric {
  name: string;
  duration: number;
  description?: string;
  counters: Record<string, number>;
}

const METRIC_LABELS: Record<string, string> = {
  total: "Total",
  command: "Command",
  format: "Format response",
  sql: "SQL",
  redis: "Redis",
};

const COUNTER_LABELS: Record<string, readonly [singular: string, plural: string]> = {
  queries: ["query", "queries"],
  rows_returned: ["row returned", "rows returned"],
  rows_scanned: ["row scanned", "rows scanned"],
  ops: ["operation", "operations"],
  hits: ["hit", "hits"],
  misses: ["miss", "misses"],
  errors: ["error", "errors"],
};

function splitOutsideQuotes(value: string, delimiter: "," | ";"): string[] {
  const parts: string[] = [];
  let start = 0;
  let quoted = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quoted && character === "\\") {
      escaped = true;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && character === delimiter) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function decodeParameterValue(value: string): string {
  if (!value.startsWith('"') || !value.endsWith('"')) return value;
  return value.slice(1, -1).replace(/\\(["\\])/g, "$1");
}

function parseCounters(description: string | undefined): Record<string, number> {
  if (!description) return {};
  const counters: Record<string, number> = {};
  const pattern = /(?:^|\s)([A-Za-z][A-Za-z0-9_.-]*)=(-?\d+(?:\.\d+)?)(?=\s|$)/g;
  for (const match of description.matchAll(pattern)) {
    const name = match[1];
    const rawValue = match[2];
    if (!name || !rawValue) continue;
    const value = Number(rawValue);
    if (Number.isFinite(value)) counters[name] = value;
  }
  return counters;
}

function humanize(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : value;
}

export function parseServerTiming(
  header: string | null | undefined,
): ServerTimingMetric[] {
  if (!header?.trim()) return [];
  return splitOutsideQuotes(header, ",").flatMap((entry) => {
    const tokens = splitOutsideQuotes(entry, ";");
    const name = tokens[0];
    if (!name) return [];
    let duration = 0;
    let description: string | undefined;
    let durationSeen = false;
    for (const token of tokens.slice(1)) {
      const separator = token.indexOf("=");
      if (separator < 0) continue;
      const key = token.slice(0, separator).trim().toLowerCase();
      const value = decodeParameterValue(token.slice(separator + 1).trim());
      // Server-Timing keeps the first instance of a duplicated parameter name
      // within one metric and ignores the rest.
      if (key === "desc" && description === undefined) description = value;
      if (key === "dur" && !durationSeen) {
        durationSeen = true;
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed >= 0) duration = parsed;
      }
    }
    return [{
      name,
      duration,
      counters: parseCounters(description),
      ...(description !== undefined ? { description } : {}),
    }];
  });
}

export function formatServerTimingDuration(milliseconds: number): string {
  if (milliseconds >= 1000) return `${(milliseconds / 1000).toFixed(1)} s`;
  if (milliseconds < 10) return `${milliseconds.toFixed(1)} ms`;
  return `${Math.round(milliseconds)} ms`;
}

export function serverTimingMetricLabel(metric: ServerTimingMetric): string {
  if (metric.description && Object.keys(metric.counters).length === 0) {
    return metric.description;
  }
  return METRIC_LABELS[metric.name] ?? humanize(metric.name);
}

export function serverTimingCounterSummary(metric: ServerTimingMetric): string | undefined {
  const counters = Object.entries(metric.counters);
  if (counters.length === 0) return undefined;
  return counters
    .map(([name, value]) => {
      const labels = COUNTER_LABELS[name];
      const label = labels?.[Math.abs(value) === 1 ? 0 : 1] ?? humanize(name).toLowerCase();
      return `${value.toLocaleString("en-US")} ${label}`;
    })
    .join(" · ");
}
