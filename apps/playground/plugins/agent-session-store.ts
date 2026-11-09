import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

export const AGENT_SESSIONS_FILENAME = "agent-sessions.json";

export const AGENT_SESSION_STATES = [
  "running",
  "ended",
  "stopped",
  "failed",
] as const;
export type AgentSessionState = (typeof AGENT_SESSION_STATES)[number];

/** `shared`: one session for every page; `page`: one session per page. */
export const AGENT_SESSION_GROUPINGS = ["shared", "page"] as const;
export type AgentSessionGrouping = (typeof AGENT_SESSION_GROUPINGS)[number];

/** What a session was started with; `spec.model` also names the agent author. */
export type AgentSessionRuntime = {
  spec: Record<string, unknown> & { model: string };
  presets?: string[];
};

/**
 * A live captain session a page's threads are delivered into instead of the
 * playground's own session. `sessionId` is captain's session id; `label` is
 * what the picker showed, kept for chips once the session has ended.
 */
export type CaptainAgentTarget = {
  kind: "captain";
  sessionId: string;
  label: string;
};
export type ManagedAgentTarget = {
  kind: "managed";
  sessionId: string;
  label: string;
};
export type SessionAgentTarget = CaptainAgentTarget | ManagedAgentTarget;

/** Where a page's threads go; `playground` is the playground's own session. */
export type AgentTarget = { kind: "playground" } | SessionAgentTarget;

export type AgentSessionSettings = {
  /** Send every new top-level human comment to its agent session on creation. */
  autoRun: boolean;
  grouping: AgentSessionGrouping;
  /** Runtime every new session starts with. */
  runtime?: AgentSessionRuntime;
  /** Per-page captain targets; a page without one uses the playground session. */
  targets?: Record<string, SessionAgentTarget>;
};

/**
 * A captain chat run that "Run agent" requests are sent into. Persisted so a
 * playground restart keeps talking to the same live session.
 */
export type AgentSession = {
  purpose?: "target";
  cwd?: string;
  label?: string;
  runId: string;
  sessionId: string;
  /** The page this session serves, or `null` for the shared session. */
  page: string | null;
  runtime: AgentSessionRuntime;
  startedAt: string;
  state: AgentSessionState;
  endedAt?: string;
  /** Why the session ended abnormally; present when `state` is `failed`. */
  error?: string;
};

export type AgentSessionsFile = {
  settings: AgentSessionSettings;
  sessions: AgentSession[];
};

export const DEFAULT_AGENT_SESSION_SETTINGS: AgentSessionSettings = {
  autoRun: false,
  grouping: "shared",
};

export function agentSessionsPath(dir: string): string {
  return join(dir, AGENT_SESSIONS_FILENAME);
}

export function readAgentSessions(dir: string): AgentSessionsFile {
  const file = agentSessionsPath(dir);
  if (!existsSync(file)) {
    return { settings: { ...DEFAULT_AGENT_SESSION_SETTINGS }, sessions: [] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(
      `${file} is not valid JSON — fix or delete it (${(error as Error).message})`,
    );
  }
  return assertAgentSessionsFile(parsed, file);
}

export function writeAgentSessions(dir: string, data: AgentSessionsFile): void {
  mkdirSync(dir, { recursive: true });
  const file = agentSessionsPath(dir);
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRuntime(value: unknown): value is AgentSessionRuntime {
  return (
    isRecord(value) &&
    isRecord(value["spec"]) &&
    typeof value["spec"]["model"] === "string"
  );
}

export function isCaptainTarget(value: unknown): value is CaptainAgentTarget {
  return (
    isRecord(value) &&
    value["kind"] === "captain" &&
    typeof value["sessionId"] === "string" &&
    value["sessionId"] !== "" &&
    typeof value["label"] === "string"
  );
}

function isTargets(value: unknown): boolean {
  return (
    value === undefined ||
    (isRecord(value) && Object.values(value).every(isSessionTarget))
  );
}

export function isSessionTarget(value: unknown): value is SessionAgentTarget {
  return (
    isCaptainTarget(value) ||
    (isRecord(value) &&
      value["kind"] === "managed" &&
      typeof value["sessionId"] === "string" &&
      value["sessionId"] !== "" &&
      typeof value["label"] === "string")
  );
}

function isSession(value: unknown): value is AgentSession {
  return (
    isRecord(value) &&
    typeof value["runId"] === "string" &&
    typeof value["sessionId"] === "string" &&
    (value["purpose"] === undefined ||
      (value["purpose"] === "target" &&
        typeof value["cwd"] === "string" &&
        typeof value["label"] === "string")) &&
    (value["page"] === null || typeof value["page"] === "string") &&
    typeof value["startedAt"] === "string" &&
    isRuntime(value["runtime"]) &&
    AGENT_SESSION_STATES.includes(value["state"] as AgentSessionState)
  );
}

function assertAgentSessionsFile(
  value: unknown,
  file: string,
): AgentSessionsFile {
  const settings = isRecord(value) ? value["settings"] : undefined;
  const sessions = isRecord(value) ? value["sessions"] : undefined;
  if (
    !isRecord(settings) ||
    typeof settings["autoRun"] !== "boolean" ||
    !AGENT_SESSION_GROUPINGS.includes(
      settings["grouping"] as AgentSessionGrouping,
    ) ||
    (settings["runtime"] !== undefined && !isRuntime(settings["runtime"])) ||
    !isTargets(settings["targets"]) ||
    !Array.isArray(sessions) ||
    !sessions.every(isSession)
  ) {
    throw new Error(
      `${file} must hold {settings:{autoRun, grouping: ${AGENT_SESSION_GROUPINGS.join("|")}, runtime?, targets?:{<page>:{kind:"captain", sessionId, label}}}, sessions:[{runId, sessionId, page, runtime:{spec:{model}}, startedAt, state: ${AGENT_SESSION_STATES.join("|")}}]} — fix or delete it`,
    );
  }
  return value as AgentSessionsFile;
}
