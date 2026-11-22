/** A run of plain log lines, or a collapsible group of them. */
export type LogSection =
  | { kind: "text"; text: string }
  | { kind: "group"; name: string; lines: number; closed: boolean; children: LogSection[] };

type LogGroup = Extract<LogSection, { kind: "group" }>;

/** A log as its workflow commands describe it. */
export type ParsedLog = {
  sections: LogSection[];
  /** The latest `::description::`. */
  description?: string;
  /** The latest `::status::`. */
  status?: string;
  /** The latest `::progress::`. */
  progress?: { done: number; total: number };
  /** The log held a command or group marker, so it differs from its sections. */
  hasCommands: boolean;
};

type Command = { name: string; properties: Record<string, string>; message: string };

// The commands gavel reads from a fixture step (fixtures/workflow_commands.go);
// a line naming any other is ordinary output, as on GitHub.
const COMMANDS = new Set([
  "group", "endgroup", "notice", "warning", "error", "debug", "progress", "description", "status", "stop-commands",
]);
const ANNOTATIONS: Record<string, string> = { error: "Error", warning: "Warning", notice: "Notice" };
const ESCAPES: Record<string, string> = { "%25": "%", "%0D": "\r", "%0A": "\n" };
const DOWNLOADED_MARKER = /^##\[(group|endgroup)\](.*)$/;
const COUNT = /^\s*(\d+)\s*$/;

function readCommand(line: string): Command | undefined {
  const marker = DOWNLOADED_MARKER.exec(line);
  if (marker) return { name: marker[1]!, properties: {}, message: marker[2]! };
  if (!line.startsWith("::")) return undefined;
  const end = line.indexOf("::", 2);
  if (end < 0) return undefined;
  const head = line.slice(2, end);
  const space = head.indexOf(" ");
  const name = space < 0 ? head : head.slice(0, space);
  if (!COMMANDS.has(name)) return undefined;
  const properties: Record<string, string> = {};
  const list = space < 0 ? "" : head.slice(space + 1).trim();
  for (const property of list ? list.split(",") : []) {
    const [key, ...value] = property.split("=");
    if (!key?.trim() || value.length === 0) return undefined;
    properties[key.trim()] = value.join("=");
  }
  return { name, properties, message: line.slice(end + 2).replace(/%25|%0D|%0A/g, (escape) => ESCAPES[escape]!) };
}

/** `::progress::3/10` or `::progress done=3,total=10::`; undefined when it is neither. */
function readProgress({ properties, message }: Command): ParsedLog["progress"] {
  const slash = message.indexOf("/");
  const named = "done" in properties || "total" in properties;
  const done = COUNT.exec(named ? (properties.done ?? "") : message.slice(0, Math.max(slash, 0)));
  const total = COUNT.exec(named ? (properties.total ?? "") : message.slice(slash + 1));
  return done && total ? { done: Number(done[1]), total: Number(total[1]) } : undefined;
}

/**
 * Reads a log's workflow commands, as a step prints them (`::group::name`) or
 * as GitHub's downloaded logs carry group markers (`##[group]name`).
 *
 * Groups become nested sections: an `endgroup` with no open group is dropped (a
 * tail cut its start off) and a group still open at the end is returned
 * unclosed (its output is still arriving). A status is a line of the log unless
 * it repeats the one before it, annotations are lines, and the latest
 * description, status and progress are returned beside the sections. A command
 * that does not parse stays as it was printed.
 */
export function parseLogSections(logs: string): ParsedLog {
  const root: LogSection[] = [];
  const log: ParsedLog = { sections: root, hasCommands: false };
  const stack: LogGroup[] = [];
  let text: string[] = [];
  let stopToken = "";
  let lastStatus: string | undefined;

  const flush = () => {
    if (text.length > 0) (stack[stack.length - 1]?.children ?? root).push({ kind: "text", text: text.join("\n") });
    text = [];
  };
  const add = (shown: string) => {
    const lines = shown.split("\n").length;
    for (const group of stack) group.lines += lines;
    text.push(shown);
    lastStatus = undefined;
  };
  const apply = (command: Command, raw: string) => {
    const { name, message } = command;
    if (name === "group") {
      flush();
      const group: LogGroup = { kind: "group", name: message.trim(), lines: 0, closed: false, children: [] };
      (stack[stack.length - 1]?.children ?? root).push(group);
      stack.push(group);
      lastStatus = undefined;
    } else if (name === "endgroup") {
      flush();
      const group = stack.pop();
      if (group) group.closed = true;
      lastStatus = undefined;
    } else if (name === "status") {
      log.status = message;
      if (message !== lastStatus) add(message);
      lastStatus = message;
    } else if (name === "description") {
      log.description = message;
    } else if (name === "progress") {
      const progress = readProgress(command);
      if (progress) log.progress = progress;
      else add(raw);
    } else if (name === "stop-commands") {
      stopToken = message;
      if (!message) add(raw);
    } else if (name !== "debug") {
      add(`${ANNOTATIONS[name]}: ${message}`);
    }
  };

  for (const raw of logs.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (stopToken) {
      if (line === `::${stopToken}::`) stopToken = "";
      else add(raw);
      continue;
    }
    const command = readCommand(line);
    if (command) {
      log.hasCommands = true;
      apply(command, raw);
    } else {
      add(raw);
    }
  }
  flush();
  return log;
}

/** A closed group is the one row it collapses to; an open one its header and contents. */
function rowsOf(section: LogSection): number {
  if (section.kind === "text") return section.text.split("\n").length;
  return section.closed ? 1 : 1 + countLogRows(section.children);
}

export function countLogRows(sections: LogSection[]): number {
  return sections.reduce((rows, section) => rows + rowsOf(section), 0);
}

/**
 * The first (`head`) or last (`tail`) rows of a log. A closed group counts as
 * one row and is kept whole; an open group keeps its header.
 */
export function takeLogRows(sections: LogSection[], limit: number, from: "head" | "tail"): LogSection[] {
  const taken: LogSection[] = [];
  let left = limit;
  for (const section of from === "head" ? sections : [...sections].reverse()) {
    if (left <= 0) break;
    const rows = rowsOf(section);
    if (rows <= left) {
      taken.push(section);
    } else if (section.kind === "text") {
      const lines = section.text.split("\n");
      taken.push({ kind: "text", text: (from === "head" ? lines.slice(0, left) : lines.slice(-left)).join("\n") });
    } else {
      taken.push({ ...section, children: takeLogRows(section.children, left - 1, from) });
    }
    left -= rows;
  }
  return from === "head" ? taken : taken.reverse();
}
