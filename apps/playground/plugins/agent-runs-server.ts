import type { MiddlewareApp, ErrorLogger } from "./middleware";
import { readFileSync, statSync } from "node:fs";
import { RepositoryDocuments } from "./repository-documents";
import { instructions, vocabularyPageFile } from "./vocabulary-registry";
import { cwdInSessionScope, sessionScopeDirectory } from "./session-scope";
import { pageInSessionScope } from "../src/agent-runs/session-scope";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Plugin } from "vite";

import { buildPlaygroundInstructions } from "../src/agent-instructions-text";
import {
  commentsToMarkdown,
  type CommentMarkdownOptions,
} from "../src/comments/markdown";
import type { PlaygroundComment } from "../src/comments/useComments";
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
  type AgentTarget,
  type CaptainAgentTarget,
} from "./agent-session-store";
import {
  CaptainClient,
  CaptainHttpError,
  CaptainUnreachableError,
  type CaptainDeliverResult,
  type CaptainLiveSession,
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
  /** The `.playground` directory for agent-session settings and host metadata. */
  dir: string;
  /** Captain's base URL, e.g. `http://localhost:9020`. */
  captainURL: string;
  /** Working directory the agent runs in: the repository root. */
  cwd: string;
  /** The playground skill the session is primed with. */
  skillPath: string;
  /** How long to wait for captain to report the new run's session id. */
  sessionTimeoutMs?: number;
  /** Re-check automatic document sessions against the filesystem server's current roots. */
  resolveDocumentDirectory?: (page: string) => Promise<string>;
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
};

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

function parseTargetRequest(body: Record<string, unknown>): {
  page: string;
  target: AgentTarget;
} {
  const unexpected = Object.keys(body).find(
    (key) => key !== "page" && key !== "target",
  );
  if (unexpected) {
    throw new RequestError(
      `target request has no field ${JSON.stringify(unexpected)}; use page and target`,
      400,
    );
  }
  const { page, target } = body;
  if (typeof page !== "string" || page === "") {
    throw new RequestError(
      '"page" is required: a page slug or external:<uuid> key',
      400,
    );
  }
  if (
    isRecord(target) &&
    target["kind"] === "playground" &&
    Object.keys(target).length === 1
  ) {
    return { page, target: { kind: "playground" } };
  }
  if (!isSessionTarget(target) || Object.keys(target).length !== 3) {
    throw new RequestError(
      '"target" must be {kind:"playground"} or {kind:"captain", sessionId, label}',
      400,
    );
  }
  return { page, target };
}

/** The session a page's threads go to: its own in `page` grouping, else the shared one. */
function sessionPage(settings: AgentSessionSettings, page: string): string | null {
  if (page.startsWith("document:")) return page.split("/")[0]!;
  return settings.grouping === "page" ? page : null;
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

function markdownOptions({ origin, dir, vocabularyInstructions }: { origin: string; dir: string; vocabularyInstructions: Record<string, string> }): CommentMarkdownOptions {
  return {
    labels: {},
    vocabularyInstructions,
    pageUrl: (page) => `${origin}/?page=${encodeURIComponent(page)}`,
    pagePath: (page) => {
      if (page.startsWith("document:")) return new RepositoryDocuments(dir).document(page).absolutePath;
      if (page.startsWith("external:")) {
        throw new Error(
          `External page ${page} has no captured URL to hand to an agent`,
        );
      }
      if (page.startsWith("vocabularies/")) return vocabularyPageFile(page);
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

type ThreadMessageOptions = {
  dir: string;
  page: string;
  rootId: string;
  origin: string;
  author: StoredAuthor;
};

async function threadMarkdown(options: ThreadMessageOptions): Promise<string> {
  const thread = (await readPage(options.dir, options.page)).filter(
    (entry) => entry.id === options.rootId || entry.parentId === options.rootId,
  ) as PlaygroundComment[];
  return commentsToMarkdown(
    [{ page: options.page, comments: thread }],
    markdownOptions({ origin: options.origin, dir: options.dir, vocabularyInstructions: Object.fromEntries([...new Set(thread.flatMap(comment => (comment.vocabularyRefs ?? []).map(item => item.catalog)))].map(alias => [alias, instructions(alias)])) }),
  );
}

async function threadMessage(options: ThreadMessageOptions): Promise<string> {
  const identity = JSON.stringify({ name: options.author.name, kind: "agent" });
  return [
    `Handle this playground feedback thread. It is already acknowledged for you as ${identity}: do not acknowledge it again. Reply with what you changed and how you verified it using reply_to_thread, then resolve the thread with resolve_thread.`,
    await threadMarkdown(options),
  ].join("\n\n");
}

/**
 * The thread for a live session the playground did not start: it has no
 * session tools, so it calls the thread's reply and resolve URLs itself, as
 * the author it was acknowledged as.
 */
async function captainThreadMessage(options: ThreadMessageOptions): Promise<string> {
  const author = JSON.stringify({ name: options.author.name, kind: "agent" });
  const base = `${options.origin}/__playground/comments/${encodeURIComponent(options.rootId)}`;
  return [
    `Playground feedback thread ${options.rootId}, sent to this session from the playground at ${options.origin}. It is already acknowledged for you as ${author}: do not acknowledge it again. Implement the scoped change it asks for and verify it, then reply with what you changed and how you verified it, and resolve the thread:`,
    [
      "```sh",
      `curl -sS --fail-with-body -X POST -H 'Content-Type: application/json' --data "$(jq -n --arg body '<your reply in Markdown>' '{body: $body, author: ${author}}')" '${base}/replies'`,
      `curl -sS --fail-with-body -X POST -H 'Content-Type: application/json' --data '{}' '${base}/resolve'`,
      "```",
    ].join("\n"),
    await threadMarkdown(options),
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
    `${scope} as separate messages over time; work through them in order, one thread at a time. The playground acknowledges each thread for you before sending it, as ${identity}. That overrides the acknowledge step and the author name in the workflow above: never acknowledge. Everything else in the workflow still applies: implement the scoped change, verify it, reply, then resolve the thread.`,
    "Use this session's tools for the feedback API instead of HTTP calls: list_feedback reads unresolved threads, reply_to_thread replies and resolve_thread resolves, both as your author.",
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

function sameAgent(left: StoredAuthor | undefined, right: StoredAuthor): boolean {
  return left?.name === right.name && (left.kind ?? "user") === right.kind;
}

/** Hands a root to the agent: human assignment if needed, then the agent's acknowledgement. */
async function claimForAgent(options: {
  dir: string;
  comment: StoredComment;
  human: StoredAuthor;
  agent: StoredAuthor;
}): Promise<void> {
  const { dir, comment, human, agent } = options;
  if (!sameAgent(comment.assignee, agent)) {
    await assignComment(dir, comment.id, human, agent);
  }
  await acknowledgeComment(dir, comment.id, agent);
  // Acknowledgement is idempotent for the holder, so a repeat run (or an agent
  // that acknowledged first) leaves the previous session id on record.
  await patchComment(dir, comment.id, { assignee: agent, acknowledgedBy: agent });
}

/** A root handed to the playground's own session, or delivered into a live captain one. */
type ThreadHandoff =
  | { comment: StoredComment; session: AgentSession }
  | { comment: StoredComment; delivery: CaptainDeliverResult };

async function setAgentRun(dir: string, id: string, run: StoredAgentRun): Promise<void> {
  await patchComment(dir, id, { agentRun: run });
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
    project?: string;
    directory?: string;
    page: string | null;
    runtime: AgentSessionRuntime;
    instructions: string;
    message: string;
    origin: string;
    author: StoredAuthor;
  }): Promise<AgentSession> {
    const runId = await captain.startChatRun({
      content: draftPrompt(startOptions.project ?? startOptions.directory ?? cwd),
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
    const session: AgentSession = {
      runId,
      sessionId,
      page: startOptions.page,
      runtime: startOptions.runtime,
      startedAt: new Date().toISOString(),
      state: "running",
    };
    if (startOptions.project) return session;
    update((data) => ({
      ...data,
      sessions: [
        ...data.sessions.filter(
          (entry) =>
            entry.purpose === "target" ||
            entry.page !== startOptions.page,
        ),
        session,
      ],
    }));
    return session;
  }

  /** Every live captain session, projected for the target picker. */
  async function captainSessions(page?: string): Promise<CaptainSessionOption[]> {
    const directory = page ? sessionScopeDirectory({ page, dir, cwd }) : undefined;
    const stored = readAgentSessions(dir);
    const linked = new Set(page ? [
      ...Object.entries(stored.settings.targets ?? {}).filter(([key]) => pageInSessionScope(key, page)).map(([, target]) => target.sessionId),
      ...stored.sessions.filter(session => session.page && pageInSessionScope(session.page, page)).map(session => session.sessionId),
    ] : []);
    return (await captain.listLiveSessions())
      .filter(session => !directory || linked.has(session.id) || (session.key && linked.has(session.key)) || (session.cwd && cwdInSessionScope(session.cwd, directory)))
      .map(captainSessionOption);
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
          author,
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
      const target = {
        kind: "managed" as const,
        sessionId: session.sessionId,
        label: managed.label!,
      };
      try {
        update((data) => ({
          ...data,
          sessions: [...data.sessions, managed],
          settings: {
            ...data.settings,
            targets: { ...data.settings.targets, [page]: target },
          },
        }));
      } catch (error) {
        const stopped = await captain.fetch(`${UPSTREAM_PREFIX.runs}${encodeURIComponent(session.runId)}/stop`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        if (!stopped.ok && stopped.status !== 404 && stopped.status !== 409) throw new Error(`${describeError(error)}; cleanup of run ${session.runId} failed: ${stopped.status}`);
        throw error;
      }
      return { session: managed, settings: readAgentSessions(dir).settings };
    });
  }

  /**
   * Hands a root to the page's live captain session. Liveness is checked before
   * the thread is claimed, so a target that has gone leaves the comment as it was.
   */
  async function deliverToCaptain(options: {
    comment: StoredComment;
    page: string;
    request: RunRequest;
    origin: string;
    target: CaptainAgentTarget;
  }): Promise<ThreadHandoff> {
    const { comment, page, request, origin, target } = options;
    const live = (await captain.listLiveSessions()).find(
      (entry) => entry.id === target.sessionId,
    );
    if (!live) {
      throw new RequestError(
        `captain session ${JSON.stringify(target.label)} (${target.sessionId}) is no longer live; choose another target for page ${page}`,
        409,
      );
    }
    const author = agentAuthor({
      model: live.model || live.source,
      sessionId: target.sessionId,
      via: "captain",
    });
    const requestedAt = new Date().toISOString();
    await claimForAgent({ dir, comment, human: request.human, agent: author });
    await setAgentRun(dir, comment.id, {
      sessionId: target.sessionId,
      requestedAt,
      state: "queued",
      target: { label: target.label },
    });
    let delivery: CaptainDeliverResult;
    try {
      delivery = await captain.deliver(
        target.sessionId,
        await captainThreadMessage({ dir, page, rootId: comment.id, origin, author }),
      );
    } catch (error) {
      await setAgentRun(dir, comment.id, {
        sessionId: target.sessionId,
        requestedAt,
        state: "error",
        error: describeError(error),
        target: { label: target.label },
      });
      throw error;
    }
    await setAgentRun(dir, comment.id, {
      sessionId: target.sessionId,
      requestedAt,
      state: delivery.status === "queued" ? "queued" : "sent",
      target: { label: target.label, channel: delivery.channel },
    });
    return { comment: (await findComment(dir, comment.id))!.comment, delivery };
  }

  /** Points a page's threads at a live captain session, or back at the playground's. */
  function setTarget(
    body: Record<string, unknown>,
  ): Promise<AgentSessionSettings> {
    const { page, target } = parseTargetRequest(body);
    return serialized(async () => {
      const data = readAgentSessions(dir);
      const targets = { ...data.settings.targets };
      if (target.kind === "managed") {
        const session = data.sessions.find(
          (entry) =>
            entry.sessionId === target.sessionId && entry.purpose === "target",
        );
        if (!session || (await verify(session)).state !== "running")
          throw new RequestError("Managed session is no longer available", 409);
      }
      if (target.kind !== "playground") targets[page] = target;
      else delete targets[page];
      const settings = { ...data.settings, targets };
      writeAgentSessions(dir, { ...data, settings });
      return settings;
    });
  }

  /** Hands one thread root to its session, starting that session when none is live. */
  async function sendThread(
    id: string,
    request: RunRequest,
    origin: string,
  ): Promise<ThreadHandoff> {
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

    const target = readAgentSessions(dir).settings.targets?.[found.page];
    if (target?.kind === "managed" && request.runtime) throw new RequestError("Managed targets do not accept runtime overrides", 409);
    if (target?.kind === "captain") {
      if (request.runtime) {
        throw new RequestError(
          `page ${found.page} sends its threads to captain session ${JSON.stringify(target.label)}, which needs no runtime`,
          409,
        );
      }
      return deliverToCaptain({
        comment: found.comment,
        page: found.page,
        request,
        origin,
        target,
      });
    }

    // A named runtime becomes the one every new or replacement session starts with.
    if (request.runtime) {
      const runtime = request.runtime;
      update((data) => ({ ...data, settings: { ...data.settings, runtime } }));
    }
    const { settings, sessions } = readAgentSessions(dir);
    const page = sessionPage(settings, found.page);
    let documentDirectory: string | undefined;
    if (found.page.startsWith("document:") && target?.kind !== "managed") {
      if (!options.resolveDocumentDirectory) throw new Error("Repository document authorization is not configured");
      documentDirectory = await options.resolveDocumentDirectory(found.page);
    }
    const stored =
      target?.kind === "managed"
        ? sessions.find(
            (entry) =>
              entry.sessionId === target.sessionId &&
              entry.purpose === "target",
          )
        : sessions.find((entry) => !entry.purpose && entry.page === page);
    const known = stored ? await verify(stored) : null;
    const session = known?.state === "running" ? known : null;
    if (target?.kind === "managed" && (!session || request.runtime))
      throw new RequestError(
        "Managed target is unavailable or a runtime override was supplied; choose another target",
        409,
      );
    const runtime = session?.runtime ?? settings.runtime;
    if (!runtime) {
      throw new RequestError(
        "no live agent session; supply a runtime ({spec:{model}}) to start one",
        409,
      );
    }
    const requestedAt = new Date().toISOString();
    const author = agentAuthor({
      model: runtime.spec.model,
      sessionId: session?.sessionId,
      via: "playground",
    });
    const message = (agent: StoredAuthor) =>
      threadMessage({ dir, page: found.page, rootId: id, origin, author: agent });

    if (!session) {
      const started = await startSession({
        page,
        ...(documentDirectory ? { directory: documentDirectory } : {}),
        runtime,
        instructions: sessionInstructions({
          skill: readFileSync(skillPath, "utf8"),
          origin,
          author,
          page,
        }),
        message: await message(author),
        origin,
        author,
      });
      await claimForAgent({
        dir,
        comment: found.comment,
        human: request.human,
        agent: agentAuthor({
          model: runtime.spec.model,
          sessionId: started.sessionId,
          via: "playground",
        }),
      });
      await setAgentRun(dir, id, {
        sessionId: started.sessionId,
        requestedAt,
        state: "sent",
      });
      return { comment: (await findComment(dir, id))!.comment, session: started };
    }

    await claimForAgent({ dir, comment: found.comment, human: request.human, agent: author });
    await setAgentRun(dir, id, {
      sessionId: session.sessionId,
      requestedAt,
      state: "queued",
    });
    try {
      const sent = await captain.sendMessage(session.runId, await message(author));
      await setAgentRun(dir, id, {
        sessionId: session.sessionId,
        requestedAt,
        state: sent.status === "queued" ? "queued" : "sent",
      });
    } catch (error) {
      await setAgentRun(dir, id, {
        sessionId: session.sessionId,
        requestedAt,
        state: "error",
        error: describeError(error),
      });
      throw error;
    }
    return { comment: (await findComment(dir, id))!.comment, session };
  }

  function runOnComment(
    id: string,
    body: Record<string, unknown>,
    origin: string,
  ): Promise<ThreadHandoff> {
    const request = parseRunRequest(body);
    return serialized(() => sendThread(id, request, origin));
  }

  /**
   * Sends a freshly created human root to its session when auto-run is on.
   * A failure is recorded on the comment (its chip shows it) and rethrown.
   */
  async function autoRunComment(event: CommentCreatedEvent): Promise<void> {
    const { comment, origin } = event;
    // A root authored by something else (a prompt run) is handed off on behalf
    // of the human who requested it.
    const requester =
      event.requestedBy ??
      (comment.author && (comment.author.kind ?? "user") === "user"
        ? comment.author
        : undefined);
    if (
      comment.parentId ||
      comment.reviewDecision ||
      !requester ||
      !readAgentSessions(dir).settings.autoRun
    ) {
      return;
    }
    const human: StoredAuthor = { name: requester.name, kind: "user" };
    try {
      await serialized(() => sendThread(comment.id, { human }, origin));
    } catch (error) {
      const run = (await findComment(dir, comment.id))?.comment.agentRun;
      if (run?.state !== "error") {
        await setAgentRun(dir, comment.id, {
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
    projects,
    createSession,
    runOnComment,
    autoRunComment,
    updateSettings,
    setTarget,
    captainSessions,
    proxy,
    forgetSession,
    sessions: () => serialized(verifiedSessions),
  };
}

export type AgentRuns = ReturnType<typeof createAgentRuns>;

function sendError(logger: ErrorLogger, res: ServerResponse, error: unknown): void {
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
export function registerAgentRunsMiddleware({ middlewares, logger, runs }: { middlewares: MiddlewareApp; logger: ErrorLogger; runs: AgentRuns }): void {
  middlewares.use(AGENT_RUNS_ROUTE, (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://playground.local");
    const method = req.method ?? "";
    const comment = AGENT_COMMENT_ROUTE.exec(url.pathname);
    const proxied = PROXY_ROUTE.exec(url.pathname);
    const entry = SESSION_ENTRY_ROUTE.exec(url.pathname);
    const isSessions = url.pathname === "/agent-sessions";
    const isSettings = url.pathname === "/agent-sessions/settings";
    const isTargets = url.pathname === "/agent-sessions/targets";
    const isCaptain = url.pathname === "/agent-sessions/captain";
    const isProjects = url.pathname === "/agent-sessions/projects";
    const isCreate = url.pathname === "/agent-sessions/sessions";
    if (
      !(
        comment ||
        proxied ||
        entry ||
        isSessions ||
        isSettings ||
        isTargets ||
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
          sendJson(res, 200, await runs.sessions());
        } else if (isSettings) {
          if (method !== "PUT") {
            throw new RequestError("PUT updates the agent session settings", 405);
          }
          sendJson(res, 200, {
            settings: await runs.updateSettings(await readJsonBody(req)),
          });
        } else if (isTargets) {
          if (method !== "PUT") {
            throw new RequestError("PUT sets a page's agent target", 405);
          }
          sendJson(res, 200, {
            settings: await runs.setTarget(await readJsonBody(req)),
          });
        } else if (isCaptain) {
          if (method !== "GET") {
            throw new RequestError("GET lists the live captain sessions", 405);
          }
          sendJson(res, 200, { sessions: await runs.captainSessions(url.searchParams.get("page") ?? undefined) });
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
