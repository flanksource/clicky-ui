import type { IncomingMessage } from "node:http";
import { isDeepStrictEqual } from "node:util";
import type { Connect, Logger, Plugin } from "vite";

import type { CaptainPromptSummary } from "./captain-client";
import { RequestError, describeError, sendError } from "./prompt-runs-errors";
import {
  createRootComment,
  readJsonBody,
  sendJson,
  type CommentCreatedEvent,
} from "./comments-server";
import {
  assertElementContext,
  readAll,
  type StoredAuthor,
} from "./comments-store";
import { promptResultComment } from "./prompt-result";
import { LaunchClient, LaunchHttpError } from "./launch-client";
import { fixedGavel, onDemandGavel } from "./gavel-launch-server";
import {
  PromptAssociations,
  type PromptAssociation,
} from "./prompt-associations";

export const PROMPT_RUNS_ROUTE = "/__playground";

export type PromptRunsOptions = {
  /** The `.playground` data directory holding comments.json. */
  dir: string;
  /** A running launch server; unset starts `gavel launch serve` over `workspace` when first needed. */
  gavelURL?: string | undefined;
  workspace: string;
  /** Called for each result comment, e.g. the agent session's auto-run. */
  onCreated?: (event: CommentCreatedEvent) => Promise<void>;
};

export const PROMPT_RUN_STATES = [
  "running",
  "done",
  "empty",
  "failed",
] as const;

/** A projection of a durable Gavel execution associated with a review target. */
export type PromptRun = {
  runId: string;
  promptId: string;
  promptName: string;
  page: string;
  anchor: string;
  startedAt: string;
  state: (typeof PROMPT_RUN_STATES)[number];
  /** The result comment, once `state` is `done`. */
  commentId?: string;
  /** Why the run failed; present when `state` is `failed`. */
  error?: string;
};

const PROMPT_ROUTE = /^\/prompts\/([^/]+)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

type RunRequest = {
  promptId: string;
  promptVersion: string;
  preparationId: string;
  associationId: string;
  variables: Record<string, unknown>;
  presets: string[];
  /** The runtime the run uses: mode, model and optional effort and budget. */
  spec: Record<string, unknown> & { model: string };
  page: string;
  anchor: string;
  element: Record<string, unknown>;
  human: StoredAuthor;
};

function requireString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new RequestError(`"${key}" must be a non-empty string`, 400);
  }
  return value;
}

function parseRunRequest(body: Record<string, unknown>): RunRequest {
  const allowed = [
    "promptId",
    "promptVersion",
    "preparationId",
    "associationId",
    "variables",
    "presets",
    "spec",
    "page",
    "anchor",
    "element",
    "author",
  ];
  const unexpected = Object.keys(body).find((key) => !allowed.includes(key));
  if (unexpected) {
    throw new RequestError(
      `request body has unexpected field ${JSON.stringify(unexpected)}`,
      400,
    );
  }
  const { variables, presets, spec, element, author } = body;
  if (!isRecord(variables))
    throw new RequestError('"variables" must be an object', 400);
  if (
    !(
      Array.isArray(presets) &&
      presets.every((item) => typeof item === "string")
    )
  ) {
    throw new RequestError('"presets" must be an array of strings', 400);
  }
  if (
    !isRecord(spec) ||
    typeof spec["model"] !== "string" ||
    spec["model"].trim() === ""
  ) {
    throw new RequestError(
      '"spec" must be a runtime with a model, e.g. {"mode":"cli","model":"anthropic/claude-sonnet-4-6"}',
      400,
    );
  }
  if (
    !isRecord(author) ||
    typeof author["name"] !== "string" ||
    !author["name"]
  ) {
    throw new RequestError(
      '"author" is required, e.g. {"name":"You","kind":"user"}',
      400,
    );
  }
  if (author["kind"] !== "user") {
    throw new RequestError("only a human user can run a prompt", 403);
  }
  if (!isRecord(element))
    throw new RequestError('"element" context is required', 400);
  try {
    // The result comment stores this capture; reject it before captain spends a run.
    assertElementContext(element);
  } catch (error) {
    throw new RequestError(describeError(error), 400);
  }
  return {
    promptId: requireString(body, "promptId"),
    promptVersion: requireString(body, "promptVersion"),
    preparationId: requireString(body, "preparationId"),
    associationId: requireString(body, "associationId"),
    variables,
    presets: presets as string[],
    spec: { ...spec, model: spec["model"] },
    page: requireString(body, "page"),
    anchor: requireString(body, "anchor"),
    element,
    human: { name: author["name"], kind: "user" },
  };
}

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host;
  if (!host) throw new RequestError("request has no Host header", 400);
  return `http://${host}`;
}

/** Captain authors the result; `via` names the prompt it came from. */
function captainAuthor(promptName: string): StoredAuthor {
  return { name: "captain", kind: "agent", via: `prompt:${promptName}` };
}

export function createPromptRuns(options: PromptRunsOptions) {
  const { dir, onCreated } = options;
  const endpoint = options.gavelURL
    ? fixedGavel(options.gavelURL)
    : onDemandGavel({ workspace: options.workspace });
  const gavel = new LaunchClient(endpoint, options.workspace);
  const associations = new PromptAssociations(dir);
  const processing = new Set<string>();
  type Preparation = {
    preparationId: string;
    directory: string;
    generation: number;
  };
  let preparation: Promise<Preparation> | undefined;
  // A preparation lives in the server that made it; after the endpoint starts
  // a new server, prepare again.
  const workspace = async (): Promise<Preparation> => {
    preparation ??= gavel
      .prepare()
      .then((prepared) => ({ ...prepared, generation: gavel.generation }))
      .catch((cause: unknown) => {
        preparation = undefined;
        throw cause;
      });
    const prepared = await preparation;
    if (prepared.generation === gavel.generation) return prepared;
    preparation = undefined;
    return workspace();
  };
  const publicRun = (entry: PromptAssociation): PromptRun => ({
    runId: entry.runId,
    promptId: entry.promptId,
    promptName: entry.promptName,
    page: entry.page,
    anchor: entry.anchor,
    startedAt: entry.startedAt,
    state: entry.state,
    ...(entry.commentId ? { commentId: entry.commentId } : {}),
    ...(entry.error ? { error: entry.error } : {}),
  });

  async function reconcile(
    entry: PromptAssociation,
  ): Promise<PromptAssociation> {
    let snapshot = entry.runId.startsWith("pending:")
      ? await gavel.find(entry.associationId)
      : await gavel.run(entry.runId);
    if (!snapshot) {
      const { launch } = associations.input<{ launch: unknown }>(
        entry.associationId,
      );
      const accepted = await gavel.start(entry.associationId, launch);
      snapshot = await gavel.run(accepted.executionId);
    }
    entry.runId = snapshot.metadata.executionId;
    associations.save(entry);
    if (snapshot.status.running) return entry;
    const request = associations.input<{ request: RunRequest }>(
      entry.associationId,
    ).request;
    const results = snapshot.lint ?? [];
    const failure =
      snapshot.error ?? results.find((result) => !result.success)?.error;
    const violations = results.flatMap((result) => result.violations ?? []);
    const result = promptResultComment(entry.promptName, {
      success: !failure || violations.length > 0,
      structuredOutput: { violations },
      ...(failure ? { error: failure } : {}),
    });
    if (result.kind !== "comment") {
      entry.state = failure ? "failed" : result.kind;
      if (failure) entry.error = failure;
      associations.save(entry);
      return entry;
    }
    const existing = (readAll(dir)[entry.page] ?? []).find(
      (comment) =>
        comment.promptRun?.runId === entry.runId &&
        comment.anchor === entry.anchor,
    );
    const { kind: _kind, ...fields } = result;
    const comment =
      existing ??
      createRootComment(dir, {
        ...fields,
        page: entry.page,
        author: captainAuthor(entry.promptName),
        anchor: entry.anchor,
        element: request.element,
        promptRun: {
          promptId: entry.promptId,
          promptName: entry.promptName,
          runId: entry.runId,
        },
      }).comment;
    entry.state = failure ? "failed" : "done";
    entry.commentId = comment.id;
    if (failure) entry.error = failure;
    const notify = !entry.callbackSent;
    entry.callbackSent = true;
    associations.save(entry);
    if (notify)
      await onCreated?.({
        page: entry.page,
        comment,
        origin: entry.origin,
        requestedBy: entry.requestedBy,
      });
    return entry;
  }

  async function follow(
    entry: PromptAssociation,
    logger: Logger,
  ): Promise<void> {
    if (processing.has(entry.associationId)) return;
    processing.add(entry.associationId);
    try {
      while (entry.state === "running") {
        entry = await reconcile(entry);
        if (entry.state === "running")
          await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (cause) {
      entry.error = describeError(cause);
      if (cause instanceof LaunchHttpError && cause.status < 500)
        entry.state = "failed";
      associations.save(entry);
      logger.error(
        `[prompt-runs] reconcile ${entry.associationId}: ${entry.error}`,
      );
    } finally {
      processing.delete(entry.associationId);
    }
  }

  async function start(
    body: Record<string, unknown>,
    origin: string,
    logger: Logger,
  ): Promise<PromptRun> {
    const request = parseRunRequest(body);
    if (!/^[a-f0-9-]{36}$/.test(request.associationId))
      throw new RequestError("invalid association identity", 422);
    let entry = associations
      .all()
      .find((candidate) => candidate.associationId === request.associationId);
    if (entry) {
      const previous = associations.input<{ request: RunRequest }>(
        entry.associationId,
      ).request;
      if (!isDeepStrictEqual(previous, request))
        throw new RequestError(
          "association already belongs to another request",
          409,
        );
      void follow(entry, logger);
      return publicRun(await reconcile(entry));
    }
    const { prompt: detail } = await gavel.prompt(
      request.preparationId,
      request.promptId,
    );
    if (detail.version !== request.promptVersion)
      throw new RequestError("Prompt changed; reload it before running", 409);
    const launch = {
      preparationId: request.preparationId,
      config: {
        lint: {
          linters: [
            {
              id: "review",
              linter: "prompt",
              options: {
                prompt: detail.id,
                promptVersion: request.promptVersion,
                variables: request.variables,
                presets: request.presets,
                spec: request.spec,
              },
            },
          ],
        },
      },
      labels: {
        playgroundAssociation: request.associationId,
        page: request.page,
        anchor: request.anchor,
      },
    };
    entry = {
      associationId: request.associationId,
      workspace: options.workspace,
      origin,
      requestedBy: request.human,
      runId: `pending:${request.associationId}`,
      promptId: detail.id,
      promptName: detail.name,
      page: request.page,
      anchor: request.anchor,
      startedAt: new Date().toISOString(),
      state: "running",
    };
    associations.protect(entry.associationId, { request, launch });
    associations.save(entry);
    try {
      const accepted = await gavel.start(entry.associationId, launch);
      entry.runId = accepted.executionId;
      associations.save(entry);
    } catch (cause) {
      if (cause instanceof LaunchHttpError && cause.status < 500) {
        entry.state = "failed";
        entry.error = cause.message;
        associations.save(entry);
      }
      throw cause;
    } finally {
      if (entry.state === "running") void follow(entry, logger);
    }
    return publicRun(entry);
  }

  return {
    /** Stops the launch server the playground started, if any. */
    close: () => endpoint.close(),
    resume: (logger: Logger) => {
      for (const entry of associations.all())
        if (entry.state === "running") void follow(entry, logger);
    },
    prompts: async (): Promise<CaptainPromptSummary[]> =>
      (await gavel.prompts((await workspace()).preparationId)).prompts,
    prompt: async (id: string) => {
      const prepared = await gavel.prepare();
      return {
        ...(await gavel.prompt(prepared.preparationId, id)),
        preparationId: prepared.preparationId,
      };
    },
    start,
    runs: async (logger: Logger): Promise<PromptRun[]> => {
      const entries = associations.all();
      for (const entry of entries)
        if (entry.state === "running") void follow(entry, logger);
      return entries.map(publicRun);
    },
  };
}

export type PromptRuns = ReturnType<typeof createPromptRuns>;

/**
 * Runs saved captain prompts against a playground element and records each
 * result as a captain-authored root comment on it: lint violations become its
 * checklist and file refs, other output its body.
 */
export function playgroundPromptRuns(runs: PromptRuns): Plugin {
  const register = (middlewares: Connect.Server, logger: Logger) => {
    runs.resume(logger);
    middlewares.use(PROMPT_RUNS_ROUTE, (req, res, next) => {
      const url = new URL(req.url ?? "/", "http://playground.local");
      const method = req.method ?? "";
      const single = PROMPT_ROUTE.exec(url.pathname);
      const isList = url.pathname === "/prompts";
      const isRuns = url.pathname === "/prompt-runs";
      if (!(single || isList || isRuns)) {
        next();
        return;
      }
      void (async () => {
        try {
          if (isRuns && method === "POST") {
            sendJson(res, 202, {
              run: await runs.start(
                await readJsonBody(req),
                requestOrigin(req),
                logger,
              ),
            });
          } else if (method !== "GET") {
            throw new RequestError(
              `${method} is not allowed; GET reads prompts and runs, POST /prompt-runs starts one`,
              405,
            );
          } else if (isRuns) {
            sendJson(res, 200, { runs: await runs.runs(logger) });
          } else if (isList) {
            sendJson(res, 200, { prompts: await runs.prompts() });
          } else if (single) {
            sendJson(
              res,
              200,
              await runs.prompt(decodeURIComponent(single[1] ?? "")),
            );
          }
        } catch (error) {
          sendError(logger, res, error);
        }
      })();
    });
  };
  return {
    name: "playground-prompt-runs",
    configureServer(server) {
      register(server.middlewares, server.config.logger);
      server.httpServer?.once("close", () => void runs.close());
    },
    configurePreviewServer(server) {
      register(server.middlewares, server.config.logger);
      server.httpServer?.once("close", () => void runs.close());
    },
  };
}
