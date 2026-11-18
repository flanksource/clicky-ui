import type { MiddlewareApp, ErrorLogger } from "./middleware";
import { randomUUID } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { cwdInSessionScope, sessionScopeDirectory } from "./session-scope";
import { pageInSessionScope } from "../src/agent-runs/session-scope";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Plugin } from "vite";

import { buildPlaygroundInstructions } from "../src/agent-instructions-text";
import {
  DEFAULT_RUN_PROMPT,
  type CommentAgent,
  type CommentAgentSettings,
  type DeliverTarget,
  type GavelAgentSession,
  type RunOptions,
  type SettingsRef,
} from "../src/comments/gavel-delivery";
import {
  AGENT_SESSION_GROUPINGS,
  isSessionTarget,
  readAgentSessions,
  writeAgentSessions,
  type AgentSession,
  type AgentSessionGrouping,
  type AgentSessionRuntime,
  type AgentSessionSettings,
  type AgentSessionsFile,
  type AgentSessionsView,
  type PageAgentState,
  type SessionAgentTarget,
} from "./agent-session-store";
import {
  CaptainClient,
  CaptainHttpError,
  CaptainUnreachableError,
  type CaptainLiveSession,
} from "./captain-client";
import { commentsClient } from "./comments-client";
import { CommentHttpError } from "./comments-lifecycle";
import { readJsonBody, sendJson } from "./comments-server";
import { isUnresolvedStatus } from "./comments-statuses";
import { findComment, readPage, type StoredAuthor } from "./comments-store";
import { LaunchHttpError } from "./launch-client";

export const AGENT_RUNS_ROUTE = "/__playground";
export const AGENT_SESSIONS_ROUTE = "/__playground/agent-sessions";
export const AGENT_PROXY_ROUTE = "/__playground/agent-runs";

export type AgentRunsOptions = {
  /** The `.playground` directory for agent-session settings and host metadata. */
  dir: string;
  /** Captain's base URL, e.g. `http://localhost:9020`. */
  captainURL: string;
  /** Working directory the agent runs in: the repository root. */
  cwd: string;
  /** The playground skill gavel-managed sessions are primed with. */
  skillPath: string;
  /** How long to wait for captain to report the new run's session id. */
  sessionTimeoutMs?: number;
};

const AGENT_COMMENT_ROUTE = /^\/comments\/([^/]+)\/agent-run$/;
const AGENT_BATCH_ROUTE = "/comments/agent-run/batch";
const SESSION_ENTRY_ROUTE = /^\/agent-sessions\/sessions\/([^/]+)$/;
const PROXY_ROUTE = /^\/agent-runs\/(runs|sessions)\/(.+)$/;
const STOP_PATH = /^[^/]+\/stop$/;
const UPSTREAM_PREFIX = {
  runs: "/api/captain/prompt/runs/",
  sessions: "/api/captain/sessions/",
} as const;

/** Tools the unattended session may use; a profile's `permissions` spec overrides them. */
const SESSION_PERMISSIONS = `permissions:
  mode: acceptEdits
  tools:
    allow: [Read, Edit, Write, Glob, Grep, Bash]`;

/** curl that fails on an error status and reports the API's reason on stderr. */
const CALL_API = [
  "set -euo pipefail",
  'call() { local out; out=$(curl -sS --fail-with-body "$@") || { echo "$out" >&2; return 1; }; echo "$out"; }',
];

/**
 * The inline tools a session handles feedback with. Each posts to the comments
 * API as the session's agent author, so the agent never builds those calls
 * itself. Captain renders `origin` and `author` into the scripts shell-quoted;
 * a thread id or reply body only ever arrives on stdin.
 */
export const SESSION_TOOLS = {
  list_feedback: {
    description:
      "List unresolved playground feedback threads with their replies, captured element context and screenshot URLs. Pass page to read one page's threads.",
    input: { "page?": "string, page slug, e.g. team/summary" },
    readonly: true,
    exec: [
      ...CALL_API,
      "page=$(jq -r '.page // empty')",
      'call --get {{shq origin}}/__playground/comments --data-urlencode unresolved=true ${page:+--data-urlencode "page=$page"}',
    ].join("\n"),
  },
  reply_to_thread: {
    description:
      "Reply to a feedback thread as this session's agent. Say what you changed and how you verified it.",
    input: {
      id: "string, the thread root's comment id",
      body: "string, the reply in Markdown",
    },
    permission: "allow",
    exec: [
      ...CALL_API,
      "input=$(cat)",
      "id=$(jq -r '.id | @uri' <<<\"$input\")",
      'body=$(jq -c --arg name {{shq author}} \'{body: .body, author: {name: $name, kind: "agent"} }\' <<<"$input")',
      'call -X POST -H "Content-Type: application/json" --data "$body" {{shq origin}}"/__playground/comments/$id/replies"',
    ].join("\n"),
  },
  resolve_thread: {
    description:
      "Resolve a feedback thread once its change is made, verified and replied to. It then waits for a human's review.",
    input: { id: "string, the thread root's comment id" },
    permission: "allow",
    exec: [
      ...CALL_API,
      "id=$(jq -r '.id | @uri')",
      `call -X POST -H "Content-Type: application/json" --data '{}' {{shq origin}}"/__playground/comments/$id/resolve"`,
    ].join("\n"),
  },
};

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

type RunRequest = {
  human: StoredAuthor;
  runtime?: AgentSessionRuntime;
  fresh: boolean;
  /** The live session the browser chose for the comment's page; absent when the thread goes to the playground's own agent. */
  target?: SessionAgentTarget;
};

function parseSessionTarget(target: unknown): SessionAgentTarget {
  if (!isSessionTarget(target) || Object.keys(target).length !== 3) {
    throw new RequestError(
      '"target" must be {kind:"captain"|"managed", sessionId, label}',
      400,
    );
  }
  return target;
}

function parseRunRequest(body: Record<string, unknown>): RunRequest {
  const unexpected = Object.keys(body).find(
    (key) => !["author", "runtime", "fresh", "target"].includes(key),
  );
  if (unexpected) {
    throw new RequestError(
      `request body has unexpected field ${JSON.stringify(unexpected)}`,
      400,
    );
  }
  const author = body["author"];
  if (!isRecord(author) || typeof author["name"] !== "string" || !author["name"]) {
    throw new RequestError(
      '"author" is required, e.g. {"name":"You","kind":"user"}',
      400,
    );
  }
  if (author["kind"] !== "user") {
    throw new RequestError("only a human user can run an agent on a comment", 403);
  }
  const human: StoredAuthor = { name: author["name"], kind: "user" };
  const fresh = body["fresh"] ?? false;
  if (typeof fresh !== "boolean") throw new RequestError('"fresh" must be a boolean', 400);
  const { runtime, target } = body;
  return {
    human,
    fresh,
    ...(runtime === undefined ? {} : { runtime: parseRuntime(runtime) }),
    ...(target === undefined ? {} : { target: parseSessionTarget(target) }),
  };
}

/** A run request for every open thread of `page`; its other fields are a single thread's. */
function parseBatchRequest(body: Record<string, unknown>): RunRequest & { page: string } {
  const { page, ...rest } = body;
  if (typeof page !== "string" || page === "") {
    throw new RequestError('"page" is required: a page slug or external:<uuid> key', 400);
  }
  return { page, ...parseRunRequest(rest) };
}

function parseRuntime(runtime: unknown): AgentSessionRuntime {
  if (!isRecord(runtime) || !isRecord(runtime["spec"])) {
    throw new RequestError('"runtime" must be {spec: {model, ...}, presets?}', 400);
  }
  const spec = runtime["spec"];
  if (typeof spec["model"] !== "string" || spec["model"].trim() === "") {
    throw new RequestError('"runtime.spec.model" is required', 400);
  }
  const presets = runtime["presets"];
  if (
    presets !== undefined &&
    !(Array.isArray(presets) && presets.every((item) => typeof item === "string"))
  ) {
    throw new RequestError('"runtime.presets" must be an array of strings', 400);
  }
  return {
    spec: spec as AgentSessionRuntime["spec"],
    ...(presets ? { presets: presets as string[] } : {}),
  };
}

type SettingsPatch = Partial<AgentSessionSettings>;

function parseSettingsPatch(body: Record<string, unknown>): SettingsPatch {
  const unexpected = Object.keys(body).find(
    (key) => key !== "grouping" && key !== "runtime",
  );
  if (unexpected === "autoRun") {
    throw new RequestError(
      "auto-run is a per-page comment agent in gavel's settings; PUT /agent-sessions/auto-run {page, autoRun} sets it",
      400,
    );
  }
  if (unexpected) {
    throw new RequestError(
      `settings have no field ${JSON.stringify(unexpected)}; use grouping or runtime`,
      400,
    );
  }
  const { grouping, runtime } = body;
  if (
    grouping !== undefined &&
    !AGENT_SESSION_GROUPINGS.includes(grouping as AgentSessionGrouping)
  ) {
    throw new RequestError(
      `"grouping" must be one of ${AGENT_SESSION_GROUPINGS.join(", ")}`,
      400,
    );
  }
  return {
    ...(grouping === undefined ? {} : { grouping: grouping as AgentSessionGrouping }),
    ...(runtime === undefined ? {} : { runtime: parseRuntime(runtime) }),
  };
}

/**
 * A live captain session as the target picker shows it. Only these fields
 * leave the server: captain's `live.environment` carries the agent's
 * messaging credentials and is never forwarded.
 */
export type CaptainSessionOption = {
  id: string;
  captainId?: string;
  status?: string;
  detailAvailable?: boolean;
  source: string;
  title: string;
  cwd?: string;
  model?: string;
  /** The agent runs in a cmux pane, so delivery can fall back to typing into it. */
  inCmux: boolean;
  /** Gavel launched this session for a thread in the playground's scope. */
  managed?: boolean;
  /** The session has ended and delivering to it resumes it. */
  resumable?: boolean;
};

/** A session gavel manages, as the picker lists it; captain knows nothing of it once it has ended. */
function gavelManagedOption(session: GavelAgentSession): CaptainSessionOption {
  return {
    id: session.id,
    ...(session.status ? { status: session.status } : {}),
    source: session.source,
    title: session.title,
    ...(session.cwd ? { cwd: session.cwd } : {}),
    ...(session.model ? { model: session.model } : {}),
    inCmux: session.inCmux,
    managed: true,
    ...(session.resumable ? { resumable: true } : {}),
  };
}

/** Whether delivering to a gavel-managed session works: it is still running, or gavel can resume it. */
const deliverableManaged = (session: GavelAgentSession): boolean => session.managed === true && (session.resumable === true || session.status !== "ended");

export function captainSessionOption(record: CaptainLiveSession): CaptainSessionOption {
  const prompt = record.initialPrompt?.trim().split("\n")[0];
  return {
    id: record.id,
    ...(record.key ? { captainId: record.key } : {}),
    ...(record.live?.status ? { status: record.live.status } : {}),
    ...(record.detailAvailable !== undefined ? { detailAvailable: record.detailAvailable } : {}),
    source: record.source,
    title: record.title || record.slug || prompt || record.id,
    ...(record.cwd ? { cwd: record.cwd } : {}),
    ...(record.model ? { model: record.model } : {}),
    inCmux: Boolean(record.live?.surface?.surfaceId),
  };
}

type AutoRunRequest = { page: string; autoRun: boolean };

function parseAutoRunRequest(body: Record<string, unknown>): AutoRunRequest {
  const unexpected = Object.keys(body).find((key) => key !== "page" && key !== "autoRun");
  if (unexpected) {
    throw new RequestError(
      `auto-run request has no field ${JSON.stringify(unexpected)}; use page and autoRun`,
      400,
    );
  }
  const { page, autoRun } = body;
  if (typeof page !== "string" || page === "") {
    throw new RequestError(
      '"page" is required: a page slug or external:<uuid> key',
      400,
    );
  }
  if (typeof autoRun !== "boolean") throw new RequestError('"autoRun" must be a boolean', 400);
  return { page, autoRun };
}

/** Where a page's auto-run lives in gavel's settings: its entry in the project layer's `comments.agents.pages`. */
const PROJECT_LAYER: SettingsRef = { kind: "project" };

/**
 * Gavel resolves every layer for any page of the scope, so reading the layers
 * without a particular page asks about this one.
 */
const SETTINGS_PROBE_PAGE = "playground-settings";

const PAGE_ENTRY_PREFIX = "pages/";

const autoRunOf = (settings: CommentAgentSettings): PageAgentState => ({ autoRun: settings.agent.agent.enabled === true });

/**
 * The pages whose comment-agent entry in a project layer is enabled. An entry's
 * key is its target URI below the scope (`pages/<encoded page>`); any other key
 * is not a playground page, so it is left alone.
 */
function enabledProjectPages(settings: CommentAgentSettings): string[] {
  return settings.settings.layers
    .filter((layer) => layer.kind === "project")
    .flatMap((layer) => Object.entries(layer.config.comments?.agents?.pages ?? {}))
    .filter(([key, agent]) => key.startsWith(PAGE_ENTRY_PREFIX) && agent.enabled === true)
    .map(([key]) => decodeURIComponent(key.slice(PAGE_ENTRY_PREFIX.length)));
}

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host;
  if (!host) throw new RequestError("request has no Host header", 400);
  return `http://${host}`;
}

/**
 * Identity the agent acts under: its model, and whoever handed it the thread —
 * the playground for its own session, captain for a live session it delivered to.
 */
function agentAuthor(options: {
  model: string;
  sessionId?: string | undefined;
  via: "playground" | "captain";
}): StoredAuthor {
  return {
    name: options.model,
    kind: "agent",
    via: options.via,
    ...(options.sessionId ? { sessionId: options.sessionId } : {}),
  };
}

/** `page` is the one page the session serves, or null for every page. */
function sessionInstructions(options: {
  skill: string;
  origin: string;
  page: string | null;
}): string {
  const scope =
    options.page === null
      ? "You are the playground's one shared agent session. Feedback threads from every page arrive"
      : options.page.startsWith("document:") && !options.page.includes("/")
        ? `You are the agent session for repository ${JSON.stringify(options.page)}. Feedback threads for Markdown paths in this repository arrive`
        : `You are the agent session for playground page ${JSON.stringify(options.page)}. Feedback threads on that page arrive`;
  return [
    buildPlaygroundInstructions({
      url: `${options.origin}/`,
      install: false,
      skill: options.skill,
    }),
    "## This session",
    `${scope} as separate messages over time; work through them in order, one thread at a time. Gavel acknowledges each thread for you before delivering it, under your own identity. That overrides the acknowledge step and the author name in the workflow above: never acknowledge. Each thread is delivered with the tools or commands to reply to and resolve it; use those instead of the HTTP calls above. Everything else in the workflow still applies: implement the scoped change, verify it, reply, then resolve the thread.`,
  ].join("\n\n");
}

function draftPrompt(cwd: string): string {
  return [
    "---",
    "setup:",
    `  cwd: ${JSON.stringify(cwd)}`,
    SESSION_PERMISSIONS,
    // JSON is YAML, and keeps the scripts' quoting intact.
    `tools: ${JSON.stringify(SESSION_TOOLS)}`,
    "---",
    '{{role "system"}}',
    "{{{instructions}}}",
    '{{role "user"}}',
    "{{{message}}}",
    "",
  ].join("\n");
}

export function createAgentRuns(options: AgentRunsOptions) {
  const { dir, cwd, skillPath } = options;
  const captain = new CaptainClient(options.captainURL);
  const sessionTimeoutMs = options.sessionTimeoutMs ?? 120_000;
  // Starting a session and queueing a message must not interleave, or two
  // requests could each start a session.
  let queue: Promise<unknown> = Promise.resolve();
  const serialized = <T>(work: () => Promise<T>): Promise<T> => {
    const next = queue.then(work, work);
    queue = next.catch(() => undefined);
    return next;
  };

  const update = (change: (data: AgentSessionsFile) => AgentSessionsFile) =>
    writeAgentSessions(dir, change(readAgentSessions(dir)));
  const replaceSession = (session: AgentSession) =>
    update((data) => ({
      ...data,
      sessions: data.sessions.map((entry) =>
        entry.runId === session.runId ? session : entry,
      ),
    }));

  /** A stored session, re-checked against captain while it claims to run. */
  async function verify(stored: AgentSession): Promise<AgentSession> {
    if (stored.state !== "running") return stored;
    const snapshot = await captain.readRun(stored.runId);
    if (snapshot && !snapshot.done) return stored;
    const ended: AgentSession = {
      ...stored,
      state: snapshot?.error ? "failed" : "ended",
      endedAt: new Date().toISOString(),
      ...(snapshot === null
        ? { error: `Captain no longer knows run ${stored.runId} (restarted?)` }
        : snapshot.error
          ? { error: snapshot.error }
          : {}),
    };
    replaceSession(ended);
    return ended;
  }

  async function verifiedSessions(): Promise<AgentSessionsFile> {
    const { settings, sessions } = readAgentSessions(dir);
    const verified: AgentSession[] = [];
    for (const session of sessions) verified.push(await verify(session));
    return { settings, sessions: verified };
  }

  /** Starts a captain chat session in `project` for `page`; the caller records it. */
  async function startSession(startOptions: {
    project: string;
    page: string;
    runtime: AgentSessionRuntime;
    instructions: string;
    message: string;
    origin: string;
    author: StoredAuthor;
  }): Promise<AgentSession> {
    const runId = await captain.startChatRun({
      content: draftPrompt(startOptions.project),
      variables: {
        instructions: startOptions.instructions,
        message: startOptions.message,
        // The session tools post to this playground, as this author.
        origin: startOptions.origin,
        author: startOptions.author.name,
      },
      spec: startOptions.runtime.spec,
      presets: startOptions.runtime.presets,
    });
    let sessionId: string;
    try {
      sessionId = await captain.awaitSessionId(runId, sessionTimeoutMs);
    } catch (error) {
      const stopped = await captain.fetch(
        `${UPSTREAM_PREFIX.runs}${encodeURIComponent(runId)}/stop`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      if (!stopped.ok && stopped.status !== 404 && stopped.status !== 409)
        throw new Error(
          `${describeError(error)}; cleanup of run ${runId} failed: ${stopped.status}`,
        );
      throw error;
    }
    return {
      runId,
      sessionId,
      page: startOptions.page,
      runtime: startOptions.runtime,
      startedAt: new Date().toISOString(),
      state: "running",
    };
  }

  /**
   * Every session a thread can be delivered into, projected for the target
   * picker: the live captain sessions, and the scope's gavel-managed ones (ended
   * ones marked resumable), each once. With a `page`, only the captain sessions
   * working in its directory, plus the `linked` ones the browser chose for it
   * (which may work elsewhere). Managed sessions run in gavel's workspace, so no
   * page directory filters them.
   */
  async function captainSessions(page?: string, chosen: string[] = []): Promise<CaptainSessionOption[]> {
    const directory = page ? sessionScopeDirectory({ page, dir, cwd }) : undefined;
    const stored = readAgentSessions(dir);
    const linked = new Set(page ? [
      ...chosen,
      ...stored.sessions.filter(session => session.page && pageInSessionScope(session.page, page)).map(session => session.sessionId),
    ] : []);
    const live = (await captain.listLiveSessions())
      .filter(session => !directory || linked.has(session.id) || (session.key && linked.has(session.key)) || (session.cwd && cwdInSessionScope(session.cwd, directory)))
      .map(captainSessionOption);
    const managed = (await (await commentsClient(dir)).agentSessions()).filter(session => session.managed);
    const gavelOf = (option: CaptainSessionOption) => managed.find(session => session.id === option.id || session.id === option.captainId);
    return [
      ...live.map(option => {
        const session = gavelOf(option);
        return session ? { ...option, managed: true, ...(session.resumable ? { resumable: true } : {}) } : option;
      }),
      ...managed.filter(session => !live.some(option => gavelOf(option) === session)).map(gavelManagedOption),
    ];
  }

  async function projects() {
    const result = await captain.listProjects();
    if (!result.projects.some((project) => project.path === cwd))
      result.projects.unshift({
        value: cwd,
        label: cwd.split("/").at(-1)!,
        path: cwd,
      });
    return { projects: result.projects, defaultProject: cwd };
  }

  function createSession(body: Record<string, unknown>, origin: string) {
    return serialized(async () => {
      if (
        Object.keys(body).some(
          (key) => !["page", "project", "runtime"].includes(key),
        )
      )
        throw new RequestError(
          "Use page, project and runtime to create a session",
          400,
        );
      const { page, project } = body;
      if (typeof page !== "string" || !page || typeof project !== "string")
        throw new RequestError("page and project are required", 400);
      if (!(await projects()).projects.some((entry) => entry.path === project))
        throw new RequestError("Choose a project from Captain's catalog", 400);
      if (!statSync(project).isDirectory())
        throw new RequestError("Project must be a directory", 400);
      const runtime = parseRuntime(body["runtime"]);
      const author = agentAuthor({
        model: runtime.spec.model,
        via: "playground",
      });
      const session = await startSession({
        page,
        project,
        runtime,
        origin,
        author,
        instructions: sessionInstructions({
          skill: readFileSync(skillPath, "utf8"),
          origin,
          page,
        }),
        message:
          "Wait for explicitly delivered feedback. Do not list, claim, or work on existing comments. Reply briefly that you are ready.",
      });
      const managed: AgentSession = {
        ...session,
        purpose: "target",
        cwd: project,
        label: `${page} · ${runtime.spec.model}`,
      };
      update((data) => ({ ...data, sessions: [...data.sessions, managed] }));
      return { session: managed };
    });
  }

  /**
   * What gavel runs for a page's threads: a managed session from the
   * playground's runtime, shared per `group` (one for every page, or one per page).
   */
  function runSetup(options: { page: string; origin: string; noRuntime: string }): { group: string; runOptions: RunOptions } {
    const { settings } = readAgentSessions(dir);
    const { runtime } = settings;
    if (!runtime) throw new RequestError(options.noRuntime, 409);
    if (options.page.startsWith("document:")) {
      throw new RequestError(
        `repository document ${options.page} cannot start a gavel-managed session: gavel runs sessions in its workspace root, not the document's repository; send its threads to a live session instead`,
        409,
      );
    }
    const shared = settings.grouping === "page" ? options.page : null;
    return {
      group: shared === null ? "playground:shared" : `playground:page:${shared}`,
      runOptions: {
        spec: runtime.spec,
        ...(runtime.presets ? { presets: runtime.presets } : {}),
        instructions: sessionInstructions({ skill: readFileSync(skillPath, "utf8"), origin: options.origin, page: shared }),
      },
    };
  }

  function runTarget(options: { page: string; origin: string; noRuntime: string; fresh?: boolean }): DeliverTarget {
    const { group, runOptions } = runSetup(options);
    return { kind: "run", prompt: DEFAULT_RUN_PROMPT, groupKey: group, ...(options.fresh ? { fresh: true } : {}), runOptions };
  }

  /** The comment agent a page's auto-run saves: the same run as `runTarget`, enabled. */
  function pageAgent(options: { page: string; origin: string; noRuntime: string }): CommentAgent {
    const { group, runOptions } = runSetup(options);
    return { enabled: true, prompt: DEFAULT_RUN_PROMPT, group, ...runOptions };
  }

  /**
   * Switches a page's auto-run: on saves the page's comment-agent entry in the
   * project layer; off removes it, and when an inherited default still enables
   * the agent, saves `{enabled: false}` there instead.
   */
  async function setAutoRun(request: AutoRunRequest, origin: string): Promise<PageAgentState> {
    const { page, autoRun } = request;
    const gavel = await commentsClient(dir);
    const save = (agent: CommentAgent | null) => gavel.saveAgent({ page, layer: PROJECT_LAYER, entry: true, agent });
    if (autoRun) {
      return autoRunOf(await save(pageAgent({ page, origin, noRuntime: "auto-run needs a runtime; send runtime ({spec:{model}}) with the settings first" })));
    }
    let saved = await save(null);
    if (saved.agent.agent.enabled) saved = await save({ enabled: false });
    if (saved.agent.agent.enabled) {
      throw new Error(`auto-run of page ${page} is still enabled by layer ${saved.agent.provenance["enabled"]?.layer ?? "unknown"}`);
    }
    return autoRunOf(saved);
  }

  /** Rewrites every enabled page entry of the project layer, after the runtime or grouping it embeds changed. */
  async function refreshPageAgents(origin: string): Promise<void> {
    const gavel = await commentsClient(dir);
    for (const page of enabledProjectPages(await gavel.agent(SETTINGS_PROBE_PAGE))) {
      await gavel.saveAgent({
        page,
        layer: PROJECT_LAYER,
        entry: true,
        agent: pageAgent({ page, origin, noRuntime: "the playground has no runtime to refresh its auto-run agents with" }),
      });
    }
  }

  /** Sets whether gavel delivers new human comments on a page to the playground's agent automatically. */
  function setPageAutoRun(body: Record<string, unknown>, origin: string): Promise<PageAgentState> {
    const request = parseAutoRunRequest(body);
    return serialized(() => setAutoRun(request, origin));
  }

  /**
   * A chosen target is delivered into only while its session is still there: a
   * stored playground session that runs, a live captain session, or a session
   * gavel manages that runs or can resume.
   */
  async function assertTargetAvailable(target: SessionAgentTarget): Promise<void> {
    if (target.kind === "managed") {
      const session = readAgentSessions(dir).sessions.find(
        (entry) => entry.sessionId === target.sessionId && entry.purpose === "target",
      );
      if (session && (await verify(session)).state === "running") return;
    } else {
      const live = await captain.listLiveSessions();
      if (live.some((entry) => entry.id === target.sessionId || entry.key === target.sessionId)) return;
    }
    const known = await (await commentsClient(dir)).agentSessions();
    if (known.some((entry) => entry.id === target.sessionId && deliverableManaged(entry))) return;
    throw new RequestError(
      target.kind === "managed" ? "Managed session is no longer available" : `Captain session ${target.label} is no longer live; choose another target`,
      409,
    );
  }

  /**
   * What gavel delivers a page's threads to: the live or resumable session the
   * browser chose, or, when it chose none, a managed run from the playground's runtime.
   */
  async function resolveDeliverTarget(request: RunRequest, options: { page: string; origin: string }): Promise<DeliverTarget> {
    const { page, origin } = options;
    if (request.target) {
      if (request.fresh) {
        throw new RequestError(
          `page ${page} sends its threads to session ${request.target.sessionId}; "fresh" only applies to playground-managed runs`,
          400,
        );
      }
      if (request.runtime) {
        throw new RequestError(
          `page ${page} sends its threads to session ${request.target.sessionId}, which needs no runtime`,
          409,
        );
      }
      await assertTargetAvailable(request.target);
      return { kind: "session", sessionId: request.target.sessionId };
    }
    // A named runtime becomes the one every new gavel-managed session starts with.
    if (request.runtime) {
      const runtime = request.runtime;
      update((data) => ({ ...data, settings: { ...data.settings, runtime } }));
      await refreshPageAgents(origin);
    }
    return runTarget({ page, origin, fresh: request.fresh, noRuntime: "no live agent session; supply a runtime ({spec:{model}}) to start one" });
  }

  /** Hands one thread root to gavel for delivery: into the live session the browser chose for its page, or a managed run when it chose none. */
  function runOnComment(id: string, body: Record<string, unknown>, origin: string) {
    const request = parseRunRequest(body);
    return serialized(async () => {
      const found = await findComment(dir, id);
      if (!found) throw new CommentHttpError(`comment "${id}" not found`, 404);
      if (found.comment.parentId) {
        throw new CommentHttpError("only a thread root can be sent to an agent", 409);
      }
      if (!isUnresolvedStatus(found.comment.status)) {
        throw new CommentHttpError(
          `comment status "${found.comment.status}" cannot be sent to an agent`,
          409,
        );
      }
      if (!found.comment.version) throw new Error(`comment ${id} has no gavel version`);
      const target = await resolveDeliverTarget(request, { page: found.page, origin });
      const comment = await (await commentsClient(dir)).deliver(
        { id, version: found.comment.version, requestId: `playground:${randomUUID()}`, target },
        request.human,
      );
      return { comment };
    });
  }

  /**
   * Hands every open thread root of a page to one target in a single gavel
   * delivery. A thread already delivered to the chosen session is left out
   * unless that delivery failed. Gavel fails the whole batch when any thread
   * went stale, so nothing is partially delivered.
   */
  function runOnPage(body: Record<string, unknown>, origin: string) {
    const { page, ...request } = parseBatchRequest(body);
    return serialized(async () => {
      const noOpenThread = new CommentHttpError(`page ${page} has no open thread to send to an agent`, 409);
      const roots = (await readPage(dir, page)).filter((comment) => !comment.parentId && isUnresolvedStatus(comment.status));
      if (roots.length === 0) throw noOpenThread;
      const target = await resolveDeliverTarget(request, { page, origin });
      const open = roots.filter(
        (comment) => !(target.kind === "session" && comment.agentRun?.sessionId === target.sessionId && comment.agentRun.state !== "error"),
      );
      if (open.length === 0) throw noOpenThread;
      const threads = open.map((comment) => {
        if (!comment.version) throw new Error(`comment ${comment.id} has no gavel version`);
        return { id: comment.id, expectedVersion: comment.version };
      });
      const comments = await (await commentsClient(dir)).deliverBatch({ requestId: `playground:${randomUUID()}`, target, threads }, request.human);
      return { comments };
    });
  }

  function updateSettings(body: Record<string, unknown>, origin: string): Promise<AgentSessionSettings> {
    const patch = parseSettingsPatch(body);
    return serialized(async () => {
      const data = readAgentSessions(dir);
      const settings = { ...data.settings, ...patch };
      writeAgentSessions(dir, { ...data, settings });
      await refreshPageAgents(origin);
      return settings;
    });
  }

  /** The stored file, and the auto-run state of `page` when one is asked about. */
  async function sessionsView(page?: string): Promise<AgentSessionsView> {
    const { settings, sessions } = await verifiedSessions();
    return { settings, sessions, pages: page ? { [page]: autoRunOf(await (await commentsClient(dir)).agent(page)) } : {} };
  }

  async function proxy(
    req: IncomingMessage,
    res: ServerResponse,
    kind: "runs" | "sessions",
    rest: string,
    search: string,
  ): Promise<void> {
    const method = req.method ?? "";
    const path = decodeURIComponent(rest);
    if (path.split("/").some((part) => part === ".." || part === "." || part === "")) {
      throw new RequestError(`invalid agent run path ${JSON.stringify(path)}`, 400);
    }
    const stop = kind === "runs" && method === "POST" && STOP_PATH.test(path);
    if (method !== "GET" && !stop) {
      throw new RequestError(
        `${method} ${kind}/${path} is not proxied; only GET and POST runs/{id}/stop are`,
        405,
      );
    }
    const controller = new AbortController();
    res.on("close", () => controller.abort());
    const upstream = await captain.fetch(
      `${UPSTREAM_PREFIX[kind]}${path.split("/").map(encodeURIComponent).join("/")}${search}`,
      {
        method,
        signal: controller.signal,
        headers: {
          Accept: req.headers.accept ?? "*/*",
          ...(stop ? { "Content-Type": "application/json" } : {}),
        },
        ...(stop ? { body: "{}" } : {}),
      },
    );
    if (stop && upstream.ok) markStopped(path.split("/")[0] ?? "");
    res.statusCode = upstream.status;
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    if (upstream.body) {
      try {
        for await (const chunk of Readable.fromWeb(
          upstream.body as Parameters<typeof Readable.fromWeb>[0],
        )) {
          res.write(chunk);
        }
      } catch (error) {
        // The browser closing an SSE stream aborts the upstream read.
        if (!controller.signal.aborted) throw error;
      }
    }
    res.end();
  }

  /**
   * Forgets one stored session, stopping it first when it is still running, so
   * the next thread for its page starts a fresh one.
   */
  function forgetSession(runId: string): Promise<void> {
    return serialized(async () => {
      const stored = readAgentSessions(dir).sessions.find(
        (entry) => entry.runId === runId,
      );
      if (!stored) {
        throw new RequestError(`no stored agent session has run ${runId}`, 404);
      }
      if (stored.state === "running") {
        const stop = await captain.fetch(
          `${UPSTREAM_PREFIX.runs}${encodeURIComponent(stored.runId)}/stop`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          },
        );
        // 404/409: captain forgot the run or it already ended, which is the goal.
        if (!stop.ok && stop.status !== 404 && stop.status !== 409) {
          throw new CaptainHttpError(
            stop.status,
            `Captain POST ${options.captainURL}${UPSTREAM_PREFIX.runs}${stored.runId}/stop failed with ${stop.status}`,
          );
        }
      }
      update((data) => ({
        ...data,
        sessions: data.sessions.filter((entry) => entry.runId !== runId),
      }));
    });
  }

  function markStopped(runId: string): void {
    const session = readAgentSessions(dir).sessions.find(
      (entry) => entry.runId === runId,
    );
    if (session?.state !== "running") return;
    replaceSession({
      ...session,
      state: "stopped",
      endedAt: new Date().toISOString(),
    });
  }

  return {
    projects,
    createSession,
    runOnComment,
    runOnPage,
    updateSettings,
    setPageAutoRun,
    captainSessions,
    proxy,
    forgetSession,
    sessions: (page?: string) => serialized(() => sessionsView(page)),
  };
}

export type AgentRuns = ReturnType<typeof createAgentRuns>;

function sendError(logger: ErrorLogger, res: ServerResponse, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const status =
    error instanceof CommentHttpError
      ? error.statusCode
      : error instanceof RequestError || error instanceof LaunchHttpError
        ? error.status
        : error instanceof CaptainUnreachableError ||
            error instanceof CaptainHttpError
          ? 502
          : 500;
  logger.error(`[agent-runs] ${status} ${message}`);
  if (res.headersSent) {
    res.end();
    return;
  }
  sendJson(res, status, { error: message });
}

/**
 * Hands playground comments to agents through gavel's shared delivery: into a
 * live session the browser chose for the page and sends with the request, or a
 * gavel-managed session started from the playground's runtime, one shared or
 * one per page (`settings.grouping`). A page's auto-run is its comment-agent
 * entry in gavel's settings (`comments.agents.pages` of the project layer), so
 * gavel delivers new human comments itself; nothing here watches for them. Which
 * live session a page's threads go to is never stored here.
 * Captain's own session listing, stop and follow endpoints are proxied as is.
 * Register this plugin before `playgroundComments`: that middleware answers
 * every other `/__playground/comments/*` path with a 405.
 */
export function registerAgentRunsMiddleware({ middlewares, logger, runs }: { middlewares: MiddlewareApp; logger: ErrorLogger; runs: AgentRuns }): void {
  middlewares.use(AGENT_RUNS_ROUTE, (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://playground.local");
    const method = req.method ?? "";
    const comment = AGENT_COMMENT_ROUTE.exec(url.pathname);
    const isBatch = url.pathname === AGENT_BATCH_ROUTE;
    const proxied = PROXY_ROUTE.exec(url.pathname);
    const entry = SESSION_ENTRY_ROUTE.exec(url.pathname);
    const isSessions = url.pathname === "/agent-sessions";
    const isSettings = url.pathname === "/agent-sessions/settings";
    const isAutoRun = url.pathname === "/agent-sessions/auto-run";
    const isCaptain = url.pathname === "/agent-sessions/captain";
    const isProjects = url.pathname === "/agent-sessions/projects";
    const isCreate = url.pathname === "/agent-sessions/sessions";
    if (
      !(
        comment ||
        isBatch ||
        proxied ||
        entry ||
        isSessions ||
        isSettings ||
        isAutoRun ||
        isCaptain ||
        isProjects ||
        isCreate
      )
    ) {
      next();
      return;
    }
    void (async () => {
      try {
        if (isProjects) {
          if (method !== "GET")
            throw new RequestError("GET lists projects", 405);
          sendJson(res, 200, await runs.projects());
        } else if (isCreate) {
          if (method !== "POST")
            throw new RequestError("POST creates a managed session", 405);
          sendJson(
            res,
            201,
            await runs.createSession(
              await readJsonBody(req),
              requestOrigin(req),
            ),
          );
        } else if (isBatch) {
          if (method !== "POST") {
            throw new RequestError("POST is required to run an agent on a page's open threads", 405);
          }
          sendJson(res, 202, await runs.runOnPage(await readJsonBody(req), requestOrigin(req)));
        } else if (comment) {
          if (method !== "POST") {
            throw new RequestError("POST is required to run an agent", 405);
          }
          const id = decodeURIComponent(comment[1] ?? "");
          sendJson(
            res,
            202,
            await runs.runOnComment(id, await readJsonBody(req), requestOrigin(req)),
          );
        } else if (isSessions) {
          if (method !== "GET") {
            throw new RequestError("GET reads the agent sessions and settings", 405);
          }
          sendJson(res, 200, await runs.sessions(url.searchParams.get("page") ?? undefined));
        } else if (isSettings) {
          if (method !== "PUT") {
            throw new RequestError("PUT updates the agent session settings", 405);
          }
          sendJson(res, 200, {
            settings: await runs.updateSettings(await readJsonBody(req), requestOrigin(req)),
          });
        } else if (isAutoRun) {
          if (method !== "PUT") {
            throw new RequestError("PUT sets whether a page's new comments are delivered automatically", 405);
          }
          sendJson(res, 200, await runs.setPageAutoRun(await readJsonBody(req), requestOrigin(req)));
        } else if (isCaptain) {
          if (method !== "GET") {
            throw new RequestError("GET lists the live captain sessions", 405);
          }
          sendJson(res, 200, { sessions: await runs.captainSessions(url.searchParams.get("page") ?? undefined, url.searchParams.getAll("linked")) });
        } else if (entry) {
          if (method !== "DELETE") {
            throw new RequestError("DELETE ends and forgets an agent session", 405);
          }
          await runs.forgetSession(decodeURIComponent(entry[1] ?? ""));
          sendJson(res, 200, { removed: true });
        } else if (proxied) {
          await runs.proxy(
            req,
            res,
            proxied[1] as "runs" | "sessions",
            proxied[2] ?? "",
            url.search,
          );
        }
      } catch (error) {
        sendError(logger, res, error);
      }
    })();
  });
}

export function playgroundAgentRuns(runs: AgentRuns): Plugin {
  return {
    name: "playground-agent-runs",
    configureServer(server) {
      registerAgentRunsMiddleware({ middlewares: server.middlewares, logger: server.config.logger, runs });
    },
    configurePreviewServer(server) {
      registerAgentRunsMiddleware({ middlewares: server.middlewares, logger: server.config.logger, runs });
    },
  };
}
