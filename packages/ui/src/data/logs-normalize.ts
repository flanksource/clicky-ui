import { asRecord } from "./log-utils";

export type LogsTableInput = string | Record<string, unknown>;

export type LogsTableRow = {
  id: string;
  timestamp: string;
  level: string;
  pod: string;
  logger: string;
  thread: string;
  message: string;
  tags: string[];
  line: string;
  parsedLine?: unknown;
  raw: unknown;
};

const JSON_PARSE_FAILED = Symbol("json-parse-failed");

export function normalizeLogsTableRows(logs: string | LogsTableInput[]): LogsTableRow[] {
  const entries = typeof logs === "string" ? splitLogLines(logs) : logs;
  return entries.map((entry, index) => normalizeLogEntry(entry, index));
}

function splitLogLines(logs: string): string[] {
  return logs.split(/\r?\n/).filter((line) => line.length > 0);
}

function normalizeLogEntry(entry: LogsTableInput, index: number): LogsTableRow {
  const parsedOuterValue = typeof entry === "string" ? tryParseJson(entry) : entry;
  const parsedOuter = parsedOuterValue === JSON_PARSE_FAILED ? entry : parsedOuterValue;
  const outer = asRecord(parsedOuter);
  const outerLine = stringValue(outer?.line);
  const parsedLineValue = outerLine ? tryParseJson(outerLine) : JSON_PARSE_FAILED;
  const parsedLine = parsedLineValue === JSON_PARSE_FAILED ? undefined : parsedLineValue;
  const inner = asRecord(parsedLine) ?? (outerLine ? undefined : outer);
  const labels = asRecord(outer?.labels);

  const timestamp = firstString(
    pick(outer, "timestamp"),
    pick(inner, "@timestamp"),
    pick(outer, "ts"),
    pick(inner, "timestamp"),
    pick(outer, "time"),
    pick(inner, "time"),
  );
  const level = firstString(
    pick(inner, "log.level"),
    pick(inner, "level"),
    pick(outer, "level"),
    pick(outer, "severity"),
    pick(inner, "severity"),
  );
  const pod = firstString(
    pick(outer, "pod"),
    pick(labels, "pod"),
    pick(inner, "kubernetes.pod.name"),
  );
  const namespace = firstString(
    pick(outer, "namespace"),
    pick(labels, "namespace"),
    pick(inner, "kubernetes.namespace"),
  );
  const container = firstString(
    pick(outer, "container"),
    pick(labels, "container"),
    pick(inner, "container.name"),
  );
  const service = firstString(
    pick(inner, "service.name"),
    pick(inner, "service"),
    pick(outer, "service"),
    pick(labels, "service"),
  );
  const dataset = firstString(pick(inner, "event.dataset"), pick(inner, "dataset"));
  const logger = firstString(
    pick(inner, "log.logger"),
    pick(inner, "logger"),
    pick(outer, "logger"),
  );
  const thread = firstString(
    pick(inner, "process.thread.name"),
    pick(inner, "thread"),
    pick(outer, "thread"),
  );
  const message = firstString(
    pick(inner, "message"),
    pick(inner, "msg"),
    pick(outer, "message"),
    outerLine,
    typeof entry === "string" ? entry : undefined,
  );

  const tags = buildTags({
    namespace,
    container,
    service,
    dataset,
    ecsVersion: firstString(pick(inner, "ecs.version")),
    labels,
  });

  return {
    id: `${index}:${timestamp || pod || message || stableString(entry)}`,
    timestamp,
    level,
    pod,
    logger,
    thread,
    message,
    tags,
    line: outerLine ?? (typeof entry === "string" ? entry : stableString(entry)),
    raw: parsedOuter,
    ...(parsedLine !== undefined ? { parsedLine } : {}),
  };
}

function buildTags({
  namespace,
  container,
  service,
  dataset,
  ecsVersion,
  labels,
}: {
  namespace: string;
  container: string;
  service: string;
  dataset: string;
  ecsVersion: string;
  labels: Record<string, unknown> | undefined;
}) {
  const tags: string[] = [];
  const seen = new Set<string>();
  const addTag = (key: string, value: unknown) => {
    const valueString = stringValue(value);
    if (!valueString) return;
    const tag = `${key}=${valueString}`;
    if (seen.has(tag)) return;
    seen.add(tag);
    tags.push(tag);
  };

  addTag("namespace", namespace);
  addTag("container", container);
  addTag("service", service);
  addTag("dataset", dataset);
  addTag("ecs.version", ecsVersion);

  if (labels) {
    for (const [key, value] of Object.entries(labels)) {
      addTag(key, value);
    }
  }

  return tags;
}

function tryParseJson(value: string): unknown | typeof JSON_PARSE_FAILED {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return JSON_PARSE_FAILED;
  }
}

function pick(record: Record<string, unknown> | undefined, path: string): unknown {
  if (!record) return undefined;
  if (Object.prototype.hasOwnProperty.call(record, path)) return record[path];
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, record);
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const string = stringValue(value);
    if (string) return string;
  }
  return "";
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function stableString(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
