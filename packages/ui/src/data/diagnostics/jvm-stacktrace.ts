export interface ParsedThreadFrame {
  functionName: string;
  displayName: string;
  file?: string;
  line?: number;
  location?: string;
  kind: "frame" | "locked" | "waiting_on" | "waiting_to_lock" | "parking";
  runtime: boolean;
  nativeMethod: boolean;
  annotationText?: string;
}

export interface ParsedThread {
  id: number;
  nid?: string;
  name: string;
  state: string;
  rawState: string;
  priority?: number;
  daemon?: boolean;
  frames: ParsedThreadFrame[];
  raw: string;
  userFrameCount: number;
  topFunction?: string;
  searchText: string;
}

const headerRe = /^"(?<name>[^"]*)"(?<rest>.*)$/;
const stateRe = /^\s*java\.lang\.Thread\.State:\s+(?<state>[A-Z_]+)(?:\s+\((?<sub>[^)]+)\))?/;
const frameRe = /^\s*at\s+(?<fn>[^\s(]+)\((?<src>[^)]+)\)\s*$/;
const srcLineRe = /^(?<file>[^:]+):(?<line>\d+)$/;
const annotationRe =
  /^\s*-\s+(?<kind>locked|waiting on|waiting to lock|parking to wait for)\b(?<rest>.*)$/;

export function parseJvmThreadDump(text: string): ParsedThread[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split on blank lines OR on a new `"..."` header that follows immediately.
  const blocks = splitIntoThreadBlocks(trimmed);
  const threads: ParsedThread[] = [];

  for (const block of blocks) {
    const parsed = parseThreadBlock(block);
    if (parsed) threads.push(parsed);
  }
  return threads;
}

function splitIntoThreadBlocks(text: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  const lines = text.split("\n");
  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (line.startsWith('"') && current.length > 0) {
      out.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) out.push(current.join("\n"));
  return out;
}

function parseThreadBlock(block: string): ParsedThread | null {
  const lines = block.split("\n");
  const header = lines[0]?.trim() ?? "";
  const headerMatch = headerRe.exec(header);
  if (!headerMatch?.groups) return null;

  const name = headerMatch.groups.name;
  const rest = headerMatch.groups.rest ?? "";
  const idMatch = /#(\d+)\b/.exec(rest);
  const prioMatch = /\bprio=(\d+)/.exec(rest);
  const nidMatch = /\bnid=(0x[0-9a-f]+)/i.exec(rest);
  const daemon = /\bdaemon\b/.test(rest);
  const headerStateTrail = extractHeaderStateTrail(rest);

  let rawState = headerStateTrail ?? "";
  let state = normalizeJvmState(rawState);
  const frames: ParsedThreadFrame[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const stateMatch = stateRe.exec(line);
    if (stateMatch?.groups) {
      const primary = stateMatch.groups.state;
      const sub = stateMatch.groups.sub;
      rawState = sub ? `${primary} (${sub})` : primary;
      state = normalizeJvmState(primary);
      continue;
    }

    const frameMatch = frameRe.exec(line);
    if (frameMatch?.groups) {
      const functionName = frameMatch.groups.fn;
      const src = frameMatch.groups.src;
      const frame: ParsedThreadFrame = {
        functionName,
        displayName: sanitizeJvmFunctionName(functionName),
        kind: "frame",
        runtime: isJvmRuntimeFrame(functionName),
        nativeMethod: src === "Native Method",
      };
      const srcMatch = srcLineRe.exec(src);
      if (srcMatch?.groups) {
        frame.file = srcMatch.groups.file;
        frame.line = Number(srcMatch.groups.line);
        frame.location = `${frame.file}:${frame.line}`;
      } else if (src === "Native Method") {
        frame.location = "Native Method";
      } else {
        frame.location = src;
      }
      frames.push(frame);
      continue;
    }

    const annoMatch = annotationRe.exec(line);
    if (annoMatch?.groups) {
      const kind = mapAnnotationKind(annoMatch.groups.kind);
      frames.push({
        functionName: annoMatch.groups.kind,
        displayName: annoMatch.groups.kind,
        kind,
        runtime: false,
        nativeMethod: false,
        annotationText: (annoMatch.groups.rest ?? "").trim(),
      });
      continue;
    }
  }

  const userFrameCount = frames.filter((f) => f.kind === "frame" && !f.runtime).length;
  const topFunction = frames.find((f) => f.kind === "frame")?.functionName;
  const searchText = [
    header,
    ...frames.map((f) => `${f.functionName} ${f.location ?? ""} ${f.annotationText ?? ""}`),
  ]
    .join("\n")
    .toLowerCase();

  return {
    id: idMatch ? Number(idMatch[1]) : deriveSyntheticId(name, rest),
    nid: nidMatch ? nidMatch[1] : undefined,
    name,
    state: state || "unknown",
    rawState: rawState || "",
    priority: prioMatch ? Number(prioMatch[1]) : undefined,
    daemon,
    frames,
    raw: block,
    userFrameCount,
    topFunction,
    searchText,
  };
}

function extractHeaderStateTrail(rest: string): string | undefined {
  // Example header tails: "... nid=0x1903 waiting on condition [0x...]"
  // Capture the descriptor between nid=... and the trailing [address].
  const tail = rest.match(/nid=0x[0-9a-f]+\s+(?<desc>[^[]+?)(?:\s+\[0x[0-9a-f]+\])?\s*$/i);
  return tail?.groups?.desc?.trim();
}

function deriveSyntheticId(name: string, rest: string): number {
  const tid = /\btid=(0x[0-9a-f]+)/i.exec(rest);
  if (tid) {
    // stable non-negative int derived from tid hex suffix
    const hex = tid[1].slice(2);
    const n = Number.parseInt(hex.slice(-8), 16);
    if (Number.isFinite(n)) return n;
  }
  // Fallback: hash of name
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mapAnnotationKind(kind: string): ParsedThreadFrame["kind"] {
  switch (kind) {
    case "locked":
      return "locked";
    case "waiting on":
      return "waiting_on";
    case "waiting to lock":
      return "waiting_to_lock";
    case "parking to wait for":
      return "parking";
    default:
      return "frame";
  }
}

export function countThreadsByState(threads: ParsedThread[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of threads) counts.set(t.state, (counts.get(t.state) ?? 0) + 1);
  return counts;
}

function normalizeJvmState(value: string): string {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  if (upper.startsWith("RUNNABLE")) return "runnable";
  if (upper.startsWith("TIMED_WAITING")) return "timed_waiting";
  if (upper.startsWith("WAITING")) return "waiting";
  if (upper.startsWith("BLOCKED")) return "blocked";
  if (upper.startsWith("NEW")) return "new";
  if (upper.startsWith("TERMINATED")) return "terminated";
  // Header fragments like "waiting on condition", "runnable", "sleeping"
  const lower = value.trim().toLowerCase();
  if (lower.includes("runnable")) return "runnable";
  if (lower.includes("waiting on condition") || lower.includes("sleeping")) return "timed_waiting";
  if (lower.includes("waiting")) return "waiting";
  if (lower.includes("blocked")) return "blocked";
  return lower.split(/\s+/)[0];
}

const runtimePrefixes = ["java.", "javax.", "sun.", "jdk.", "com.sun.", "oracle.jrockit."];
function isJvmRuntimeFrame(functionName: string): boolean {
  return runtimePrefixes.some((p) => functionName.startsWith(p));
}

function sanitizeJvmFunctionName(functionName: string): string {
  // e.g. "com.example.App$Inner.method" → "App$Inner.method"
  const parts = functionName.split(".");
  if (parts.length < 2) return functionName;
  const method = parts[parts.length - 1];
  const cls = parts[parts.length - 2];
  return `${cls}.${method}`;
}
