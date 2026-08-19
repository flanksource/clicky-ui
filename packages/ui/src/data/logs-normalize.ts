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

/**
 * normalizeLogsTableRows flattens raw log input — newline-delimited text or
 * already-parsed records — into the flat row shape LogsTable renders.
 *
 * A row's `id` is its content, not its position: the digest of the record as it
 * arrived. Identity has to survive appending, because that is what infinite
 * scroll does — a caller re-normalizes a run that grew at the end, and a
 * position-derived id would hand every row already on screen a new key, so React
 * would remount them and any expansion or selection would slide onto whichever
 * line now occupies that index. Content-derived ids stay attached to the line.
 *
 * Records that produce the same digest — the same line logged twice, or the rare
 * digest collision — are separated by the count of times that digest has already
 * been seen in this run. That discriminator is positional, and so is only as
 * stable as the ordering, which is why it is spent on actual collisions rather
 * than on every row.
 */
export function normalizeLogsTableRows(logs: string | LogsTableInput[]): LogsTableRow[] {
  const entries = typeof logs === "string" ? splitLogLines(logs) : logs;
  const seenIdentities = new Map<string, number>();
  return entries.map((entry) => normalizeLogEntry(entry, seenIdentities));
}

function splitLogLines(logs: string): string[] {
  return logs.split(/\r?\n/).filter((line) => line.length > 0);
}

function normalizeLogEntry(
  entry: LogsTableInput,
  seenIdentities: Map<string, number>,
): LogsTableRow {
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
    id: rowIdentity(entry, seenIdentities),
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

// The digest, not the record itself, is the id: a log line runs to kilobytes and
// the id is carried on every row, held in selection sets and written into an
// aria-label, so keeping the whole line would cost a second copy of the log for
// nothing. Collisions are handled the same way duplicate lines are, by counting
// occurrences, so shortening identity costs correctness nothing.
function rowIdentity(entry: LogsTableInput, seenIdentities: Map<string, number>): string {
  const digest = digestString(stableString(entry));
  const seen = seenIdentities.get(digest) ?? 0;
  seenIdentities.set(digest, seen + 1);
  return seen === 0 ? digest : `${digest}#${seen}`;
}

// FNV-1a, 32-bit. Chosen for being a handful of lines with no dependency and no
// allocation per character — this runs once per log line, and a logs view opens
// on tens of thousands of them.
function digestString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
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
