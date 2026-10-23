import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Connect, Logger, Plugin } from "vite";

import { buildPlaygroundInstructions } from "../src/agent-instructions-text";
import {
  commentsToMarkdown,
  type CommentMarkdownOptions,
} from "../src/comments/markdown";
import type { PlaygroundComment } from "../src/comments/useComments";
import {
  AGENT_SESSION_GROUPINGS,
  readAgentSessions,
  writeAgentSessions,
  type AgentSession,
  type AgentSessionGrouping,
  type AgentSessionRuntime,
  type AgentSessionSettings,
  type AgentSessionsFile,
} from "./agent-session-store";
import {
  CaptainClient,
  CaptainHttpError,
  CaptainUnreachableError,
} from "./captain-client";
import {
  CommentHttpError,
  acknowledgeComment,
  assignComment,
} from "./comments-lifecycle";
import {
  readJsonBody,
  sendJson,
  type CommentCreatedEvent,
} from "./comments-server";
import { isUnresolvedStatus } from "./comments-statuses";
import {
  findComment,
  patchComment,
  readPage,
  type StoredAgentRun,
  type StoredAuthor,
  type StoredComment,
} from "./comments-store";

export const AGENT_RUNS_ROUTE = "/__playground";
export const AGENT_SESSIONS_ROUTE = "/__playground/agent-sessions";
export const AGENT_PROXY_ROUTE = "/__playground/agent-runs";

export type AgentRunsOptions = {
  /** The `.playground` data directory holding comments.json and agent-sessions.json. */
  dir: string;
  /** Captain's base URL, e.g. `http://localhost:9020`. */
  captainURL: string;
  /** Working directory the agent runs in: the repository root. */
  cwd: string;
  /** The playground skill the session is primed with. */
  skillPath: string;
  /** How long to wait for captain to report the new run's session id. */
  sessionTimeoutMs?: number;
};

const AGENT_COMMENT_ROUTE = /^\/comments\/([^/]+)\/agent-run$/;
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

type RunRequest = { human: StoredAuthor; runtime?: AgentSessionRuntime };

function parseRunRequest(body: Record<string, unknown>): RunRequest {
  const unexpected = Object.keys(body).find(
    (key) => key !== "author" && key !== "runtime",
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
  const runtime = body["runtime"];
  return runtime === undefined ? { human } : { human, runtime: parseRuntime(runtime) };
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
    (key) => key !== "autoRun" && key !== "grouping" && key !== "runtime",
  );
  if (unexpected) {
    throw new RequestError(
      `settings have no field ${JSON.stringify(unexpected)}; use autoRun, grouping or runtime`,
      400,
    );
  }
  const { autoRun, grouping, runtime } = body;
  if (autoRun !== undefined && typeof autoRun !== "boolean") {
    throw new RequestError('"autoRun" must be a boolean', 400);
  }
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
    ...(autoRun === undefined ? {} : { autoRun }),
    ...(grouping === undefined ? {} : { grouping: grouping as AgentSessionGrouping }),
    ...(runtime === undefined ? {} : { runtime: parseRuntime(runtime) }),
  };
}

/** The session a page's threads go to: its own in `page` grouping, else the shared one. */
function sessionPage(settings: AgentSessionSettings, page: string): string | null {
  return settings.grouping === "page" ? page : null;
}

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host;
  if (!host) throw new RequestError("request has no Host header", 400);
  return `http://${host}`;
}

/** Identity the agent acts under: the session's model, delegated by the playground. */
function agentAuthor(model: string, sessionId?: string): StoredAuthor {
  return {
    name: model,
    kind: "agent",
    via: "playground",
    ...(sessionId ? { sessionId } : {}),
  };
}

function markdownOptions(origin: string): CommentMarkdownOptions {
  return {
    labels: {},
    pageUrl: (page) => `${origin}/?page=${encodeURIComponent(page)}`,
    pagePath: (page) => {
      if (page.startsWith("external:")) {
        throw new Error(
          `External page ${page} has no captured URL to hand to an agent`,
        );
      }
      return `apps/playground/src/pages/${page}.tsx`;
    },
    screenshotUrl: (url) => new URL(url, origin).href,
    commentActionUrls: (id) => {
      const base = `${origin}/__playground/comments/${encodeURIComponent(id)}`;
      return {
        reply: `${base}/replies`,
        acknowledge: `${base}/acknowledge`,
        resolve: `${base}/resolve`,
      };
    },
  };
}

function threadMessage(options: {
  dir: string;
  page: string;
  rootId: string;
  origin: string;
  author: StoredAuthor;
}): string {
  const thread = readPage(options.dir, options.page).filter(
    (entry) => entry.id === options.rootId || entry.parentId === options.rootId,
  ) as PlaygroundComment[];
  const identity = JSON.stringify({ name: options.author.name, kind: "agent" });
  return [
    `Handle this playground feedback thread. It is already acknowledged for you as ${identity}: do not acknowledge it again, and use exactly that author for every reply. Reply with what you changed and how you verified it, then resolve the thread.`,
    commentsToMarkdown(
      [{ page: options.page, comments: thread }],
      markdownOptions(options.origin),
    ),
  ].join("\n\n");
}

function sessionInstructions(options: {
  skill: string;
  origin: string;
  author: StoredAuthor;
  page: string | null;
}): string {
  const identity = JSON.stringify({ name: options.author.name, kind: "agent" });
  const scope =
    options.page === null
      ? "You are the playground's one shared agent session. Feedback threads from every page arrive"
      : `You are the agent session for playground page ${JSON.stringify(options.page)}. Feedback threads on that page arrive`;
  return [
    buildPlaygroundInstructions({
      url: `${options.origin}/`,
      install: false,
      skill: options.skill,
    }),
    "## This session",
    `${scope} as separate messages over time; work through them in order, one thread at a time. The playground acknowledges each thread for you before sending it, as ${identity}. That overrides the acknowledge step and the author name in the workflow above: never acknowledge, and use ${identity} as the author of every reply. Everything else in the workflow still applies: implement the scoped change, verify it, reply, then resolve the thread.`,
  ].join("\n\n");
}

function draftPrompt(cwd: string): string {
  return [
    "---",
    "setup:",
    `  cwd: ${JSON.stringify(cwd)}`,
    SESSION_PERMISSIONS,
    "---",
    '{{role "system"}}',
    "{{{instructions}}}",
    '{{role "user"}}',
    "{{{message}}}",
    "",
  ].join("\n");
}

function sameAgent(left: StoredAuthor | undefined, right: StoredAuthor): boolean {
  return left?.name === right.name && (left.kind ?? "user") === right.kind;
}

/** Hands a root to the agent: human assignment if needed, then the agent's acknowledgement. */
function claimForAgent(options: {
  dir: string;
  comment: StoredComment;
  human: StoredAuthor;
  agent: StoredAuthor;
}): void {
  const { dir, comment, human, agent } = options;
  if (!sameAgent(comment.assignee, agent)) {
    assignComment(dir, comment.id, human, agent);
  }
  acknowledgeComment(dir, comment.id, agent);
  // Acknowledgement is idempotent for the holder, so a repeat run (or an agent
  // that acknowledged first) leaves the previous session id on record.
  patchComment(dir, comment.id, { assignee: agent, acknowledgedBy: agent });
}

function setAgentRun(dir: string, id: string, run: StoredAgentRun): void {
  patchComment(dir, id, { agentRun: run });
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

  /** Starts the session for `page` (null: shared), replacing that page's previous one. */
  async function startSession(startOptions: {
    page: string | null;
    runtime: AgentSessionRuntime;
    instructions: string;
    message: string;
  }): Promise<AgentSession> {
    const runId = await captain.startChatRun({
      content: draftPrompt(cwd),
      variables: {
        instructions: startOptions.instructions,
        message: startOptions.message,
      },
      spec: startOptions.runtime.spec,
      presets: startOptions.runtime.presets,
    });
    const session: AgentSession = {
      runId,
      sessionId: await captain.awaitSessionId(runId, sessionTimeoutMs),
      page: startOptions.page,
      runtime: startOptions.runtime,
      startedAt: new Date().toISOString(),
      state: "running",
    };
    update((data) => ({
      ...data,
      sessions: [
        ...data.sessions.filter((entry) => entry.page !== startOptions.page),
        session,
      ],
    }));
    return session;
  }

  /** Hands one thread root to its session, starting that session when none is live. */
  async function sendThread(
    id: string,
    request: RunRequest,
    origin: string,
  ): Promise<{ comment: StoredComment; session: AgentSession }> {
    const found = findComment(dir, id);
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

    // A named runtime becomes the one every new or replacement session starts with.
    if (request.runtime) {
      const runtime = request.runtime;
      update((data) => ({ ...data, settings: { ...data.settings, runtime } }));
    }
    const { settings, sessions } = readAgentSessions(dir);
    const page = sessionPage(settings, found.page);
    const stored = sessions.find((entry) => entry.page === page);
    const known = stored ? await verify(stored) : null;
    const session = known?.state === "running" ? known : null;
    const runtime = session?.runtime ?? settings.runtime;
    if (!runtime) {
      throw new RequestError(
        "no live agent session; supply a runtime ({spec:{model}}) to start one",
        409,
      );
    }
    const requestedAt = new Date().toISOString();
    const author = agentAuthor(runtime.spec.model, session?.sessionId);
    const message = (agent: StoredAuthor) =>
      threadMessage({ dir, page: found.page, rootId: id, origin, author: agent });

    if (!session) {
      const started = await startSession({
        page,
        runtime,
        instructions: sessionInstructions({
          skill: readFileSync(skillPath, "utf8"),
          origin,
          author,
          page,
        }),
        message: message(author),
      });
      claimForAgent({
        dir,
        comment: found.comment,
        human: request.human,
        agent: agentAuthor(runtime.spec.model, started.sessionId),
      });
      setAgentRun(dir, id, {
        sessionId: started.sessionId,
        requestedAt,
        state: "sent",
      });
      return { comment: findComment(dir, id)!.comment, session: started };
    }

    claimForAgent({ dir, comment: found.comment, human: request.human, agent: author });
    setAgentRun(dir, id, {
      sessionId: session.sessionId,
      requestedAt,
      state: "queued",
    });
    try {
      const sent = await captain.sendMessage(session.runId, message(author));
      setAgentRun(dir, id, {
        sessionId: session.sessionId,
        requestedAt,
        state: sent.status === "queued" ? "queued" : "sent",
      });
    } catch (error) {
      setAgentRun(dir, id, {
        sessionId: session.sessionId,
        requestedAt,
        state: "error",
        error: describeError(error),
      });
      throw error;
    }
    return { comment: findComment(dir, id)!.comment, session };
  }

  function runOnComment(
    id: string,
    body: Record<string, unknown>,
    origin: string,
  ): Promise<{ comment: StoredComment; session: AgentSession }> {
    const request = parseRunRequest(body);
    return serialized(() => sendThread(id, request, origin));
  }

  /**
   * Sends a freshly created human root to its session when auto-run is on.
   * A failure is recorded on the comment (its chip shows it) and rethrown.
   */
  async function autoRunComment(event: CommentCreatedEvent): Promise<void> {
    const { comment, origin } = event;
    if (
      comment.parentId ||
      comment.reviewDecision ||
      !comment.author ||
      (comment.author.kind ?? "user") !== "user" ||
      !readAgentSessions(dir).settings.autoRun
    ) {
      return;
    }
    const human: StoredAuthor = { name: comment.author.name, kind: "user" };
    try {
      await serialized(() => sendThread(comment.id, { human }, origin));
    } catch (error) {
      const run = findComment(dir, comment.id)?.comment.agentRun;
      if (run?.state !== "error") {
        setAgentRun(dir, comment.id, {
          ...(run?.sessionId ? { sessionId: run.sessionId } : {}),
          requestedAt: new Date().toISOString(),
          state: "error",
          error: describeError(error),
        });
      }
      throw error;
    }
  }

  function updateSettings(body: Record<string, unknown>): Promise<AgentSessionSettings> {
    const patch = parseSettingsPatch(body);
    return serialized(async () => {
      const data = readAgentSessions(dir);
      const settings = { ...data.settings, ...patch };
      if (settings.autoRun && !settings.runtime) {
        throw new RequestError(
          "auto-run needs a runtime; send runtime ({spec:{model}}) with autoRun",
          409,
        );
      }
      writeAgentSessions(dir, { ...data, settings });
      return settings;
    });
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
    runOnComment,
    autoRunComment,
    updateSettings,
    proxy,
    forgetSession,
    sessions: () => serialized(verifiedSessions),
  };
}

export type AgentRuns = ReturnType<typeof createAgentRuns>;

function sendError(logger: Logger, res: ServerResponse, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const status =
    error instanceof CommentHttpError
      ? error.statusCode
      : error instanceof RequestError
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
 * Hands playground comments to captain chat sessions: one shared session, or
 * one per page (`settings.grouping`). A page's first request starts its
 * session; later ones are sent into it as messages, and the agent replies and
 * resolves each thread through the comments API. Pass the same `runs` to
 * `playgroundComments({onCreated: runs.autoRunComment})` for auto-run.
 * Register this plugin before `playgroundComments`: that middleware answers
 * every other `/__playground/comments/*` path with a 405.
 */
export function playgroundAgentRuns(runs: AgentRuns): Plugin {
  const register = (middlewares: Connect.Server, logger: Logger) => {
    middlewares.use(AGENT_RUNS_ROUTE, (req, res, next) => {
      const url = new URL(req.url ?? "/", "http://playground.local");
      const method = req.method ?? "";
      const comment = AGENT_COMMENT_ROUTE.exec(url.pathname);
      const proxied = PROXY_ROUTE.exec(url.pathname);
      const entry = SESSION_ENTRY_ROUTE.exec(url.pathname);
      const isSessions = url.pathname === "/agent-sessions";
      const isSettings = url.pathname === "/agent-sessions/settings";
      if (!(comment || proxied || entry || isSessions || isSettings)) {
        next();
        return;
      }
      void (async () => {
        try {
          if (comment) {
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
            sendJson(res, 200, await runs.sessions());
          } else if (isSettings) {
            if (method !== "PUT") {
              throw new RequestError("PUT updates the agent session settings", 405);
            }
            sendJson(res, 200, {
              settings: await runs.updateSettings(await readJsonBody(req)),
            });
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
  };
  return {
    name: "playground-agent-runs",
    configureServer(server) {
      register(server.middlewares, server.config.logger);
    },
    configurePreviewServer(server) {
      register(server.middlewares, server.config.logger);
    },
  };
}
