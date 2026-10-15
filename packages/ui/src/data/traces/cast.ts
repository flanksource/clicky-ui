import type { TerminalEvent } from "./types";

type CastHeader = {
  version?: number;
  width?: number;
  height?: number;
  duration?: number;
  command?: string;
  /** Gavel's extras on top of asciinema v2; players ignore keys they do not know. */
  _gavel?: {
    exit_code?: number;
    snapshots?: [number, string][];
    final?: string;
    truncated?: boolean;
  };
};

const NO_EXIT_CODE = -1;
/** Events asciinema defines that draw nothing on the screen. */
const IGNORED_EVENT_TYPES = new Set(["i", "m"]);

function parseJson(text: string, what: string): unknown {
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new Error(`cast ${what} is not valid JSON: ${(cause as Error).message}`);
  }
}

function parseHeader(line: string): CastHeader & { width: number; height: number } {
  const header = parseJson(line, "header") as CastHeader | null;
  if (header === null || typeof header !== "object" || Array.isArray(header)) {
    throw new Error("cast header is not a JSON object");
  }
  if (header.version !== 2) throw new Error(`cast header: only asciinema version 2 is supported, got ${String(header.version)}`);
  if (typeof header.width !== "number" || typeof header.height !== "number") {
    throw new Error("cast header has no numeric width and height");
  }
  return { ...header, width: header.width, height: header.height };
}

function parseResize(data: unknown, lineNumber: number): { width: number; height: number } {
  const match = typeof data === "string" ? /^(\d+)x(\d+)$/.exec(data) : null;
  if (!match) throw new Error(`cast line ${lineNumber}: resize data must be "<width>x<height>", got ${JSON.stringify(data)}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Parses an asciinema v2 cast (a header object, then one `[seconds, type, data]`
 * array per line) into the terminal events `TerminalCastPlayer` replays. The
 * `_gavel` header extras a commons-db export carries become the `snapshot` and
 * `exit` events a live capture records.
 */
export function parseCast(text: string): TerminalEvent[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const [headerLine, ...eventLines] = lines;
  if (headerLine === undefined) throw new Error("cast text is empty");

  const header = parseHeader(headerLine);
  let size = { width: header.width, height: header.height };
  const events: TerminalEvent[] = [];
  let lastOffset = 0;

  eventLines.forEach((line, index) => {
    const lineNumber = index + 2;
    let entry: unknown;
    try {
      entry = JSON.parse(line);
    } catch (cause) {
      throw new Error(`cast line ${lineNumber} is not valid JSON: ${(cause as Error).message}`);
    }
    if (!Array.isArray(entry) || entry.length < 3 || typeof entry[0] !== "number" || typeof entry[1] !== "string") {
      throw new Error(`cast line ${lineNumber} is not a [seconds, type, data] event`);
    }
    const [offset, type, data] = entry as [number, string, unknown];
    lastOffset = Math.max(lastOffset, offset);
    if (IGNORED_EVENT_TYPES.has(type)) return;
    if (type === "o") {
      events.push({ offset, kind: "o", data: String(data), ...size });
    } else if (type === "r") {
      size = parseResize(data, lineNumber);
      events.push({ offset, kind: "r", data: "", ...size });
    } else {
      throw new Error(`cast line ${lineNumber}: unknown event type "${type}"`);
    }
  });

  const extras = header._gavel;
  if (!extras) return events;

  const duration = header.duration ?? lastOffset;
  const snapshots = extras.snapshots ?? [];
  for (const [milliseconds, screen] of snapshots) {
    events.push({ offset: milliseconds / 1000, kind: "snapshot", data: screen, ...size });
  }
  if (snapshots.length === 0 && extras.final !== undefined) {
    events.push({ offset: duration, kind: "snapshot", data: extras.final, ...size });
  }
  events.push({
    offset: duration,
    kind: "exit",
    data: "",
    ...size,
    ...(extras.exit_code !== undefined && extras.exit_code !== NO_EXIT_CODE ? { exitCode: extras.exit_code } : {}),
    ...(extras.truncated ? { truncated: true } : {}),
    ...(header.command ? { command: header.command } : {}),
  });
  return events;
}
