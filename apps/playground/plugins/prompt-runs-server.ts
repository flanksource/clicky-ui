import type { MiddlewareApp, ErrorLogger } from "./middleware";
import type { IncomingMessage } from "node:http";
import { isDeepStrictEqual } from "node:util";
import { join, relative } from "node:path";
import type { Plugin } from "vite";

import type { CaptainPromptSummary } from "./captain-client";
import { RequestError, describeError, sendError } from "./prompt-runs-errors";
import {
  readJsonBody,
  sendJson,
  type CommentCreatedEvent,
} from "./comments-server";
import {
  assertElementContext,
  type StoredAuthor,
} from "./comments-store";
import { persistPromptResult } from "./prompt-run-results";
import { prepareRepositoryFolder } from "./repository-folder";
import { documentProblems, type DocumentLintSnapshot } from "./document-problems";
import { LaunchClient, LaunchHttpError } from "./launch-client";
import { fixedGavel, onDemandGavel, type GavelEndpoint } from "./gavel-launch-server";
import { RepositoryDocuments } from "./repository-documents";
import { repositoryPromptDirectory } from "./repository-prompt-directory";
import {
  PromptAssociations,
  type PromptAssociation,
} from "./prompt-associations";

export const PROMPT_RUNS_ROUTE = "/__playground";

export type PromptRunsOptions = {
  /** The `.playground` directory for prompt associations and host metadata. */
  dir: string;
  /** A running launch server; unset starts `gavel launch serve` over `workspace` when first needed. */
  gavelURL?: string | undefined;
  endpoint?: GavelEndpoint;
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

export function createPromptRuns(options: PromptRunsOptions) {
  const { dir, onCreated } = options;
  const endpoint = options.endpoint ?? (options.gavelURL
    ? fixedGavel(options.gavelURL)
    : onDemandGavel({ workspace: options.workspace }));
  const gavel = new LaunchClient(endpoint, options.workspace);
  const associations = new PromptAssociations(dir);
  const processing = new Set<string>();
  const preparationPages = new Map<string, { page: string; revision: string; directory: string; files?: string[] }>();
  const directoryFor = async (page?: string) => {
    if (!page?.startsWith("document:") && !page?.startsWith("folder:")) return options.workspace;
    return repositoryPromptDirectory({ dir, endpoint, page });
  };
  const scopedFiles = ({ page, files, directory }: { page: string; files: string[]; directory: string }) => {
    const target = new RepositoryDocuments(dir).document(page);
    return files.map((file) => relative(directory, join(target.repository.root, file)));
  };
  const documentRevision = async (page: string) => {
    const target = new RepositoryDocuments(dir).document(page);
    const response = await fetch(new URL(`/api/workspace/file?${new URLSearchParams({ root: target.repository.root, path: target.path })}`, await endpoint.url()));
    const file = await response.json() as { revision: string; error?: string };
    if (!response.ok) throw new RequestError(file.error ?? "Cannot read document revision", response.status);
    return file.revision;
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
    const notifications = await persistPromptResult({ dir, entry, snapshot, request });
    associations.save(entry);
    for (const event of notifications) await onCreated?.(event);
    return entry;
  }

  async function follow(
    entry: PromptAssociation,
    logger: ErrorLogger,
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
    logger: ErrorLogger,
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
    const preparedDocument = preparationPages.get(request.preparationId);
    if (request.page.startsWith("document:") && (preparedDocument?.page !== request.page || preparedDocument.revision !== await documentRevision(request.page))) throw new RequestError("Document changed; reload the prompt form before running", 409);
    if (request.page.startsWith("folder:")) {
      const current = await prepareRepositoryFolder({ dir, endpoint, page: request.page });
      if (preparedDocument?.page !== request.page || preparedDocument.revision !== current.revision)
        throw new RequestError("Folder contents changed; reload the prompt form before running", 409);
    }
    if (preparedDocument?.files && Object.hasOwn(request.variables, "files"))
      throw new RequestError("Review files are owned by the prepared review scope", 400);
    const { prompt: detail } = await gavel.prompt(
      request.preparationId,
      request.promptId,
    );
    if (detail.version !== request.promptVersion)
      throw new RequestError("Prompt changed; reload it before running", 409);
    const directory = preparedDocument?.directory ?? await directoryFor(request.page);
    const launch = {
      preparationId: request.preparationId,
      config: {
        lint: {
          ...(preparedDocument?.files ? { files: scopedFiles({ page: request.page, files: preparedDocument.files, directory }) } : {}),
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
        ...(preparedDocument ? { sourceRevision: preparedDocument.revision } : {}),
      },
    };
    entry = {
      associationId: request.associationId,
      workspace: directory,
      origin,
      requestedBy: request.human,
      runId: `pending:${request.associationId}`,
      promptId: detail.id,
      promptName: detail.name,
      page: request.page,
      anchor: request.anchor,
      startedAt: new Date().toISOString(),
      state: "running",
      ...(preparedDocument?.files ? { files: preparedDocument.files } : {}),
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
    resume: (logger: ErrorLogger) => {
      for (const entry of associations.all())
        if (entry.state === "running") void follow(entry, logger);
    },
    prompts: async (page?: string): Promise<CaptainPromptSummary[]> =>
      (await gavel.prompts((await gavel.prepare(await directoryFor(page))).preparationId)).prompts,
    prompt: async (id: string, page?: string) => {
      const directory = await directoryFor(page);
      const prepared = await gavel.prepare(directory);
      if (page?.startsWith("document:")) preparationPages.set(prepared.preparationId, { page, directory, revision: await documentRevision(page) });
      const folder = page?.startsWith("folder:") ? await prepareRepositoryFolder({ dir, endpoint, page }) : undefined;
      if (folder && page) preparationPages.set(prepared.preparationId, { page, directory, revision: folder.revision, files: folder.files });
      const files = preparationPages.get(prepared.preparationId)?.files;
      return {
        ...(await gavel.prompt(prepared.preparationId, id)),
        preparationId: prepared.preparationId,
        ...(page?.startsWith("document:") || page?.startsWith("folder:") ? { directory } : {}),
        ...(page && files ? { files: scopedFiles({ page, files, directory }) } : {}),
        ...(page?.startsWith("document:") ? { defaultFiles: scopedFiles({ page, files: [new RepositoryDocuments(dir).document(page).path], directory }) } : {}),
      };
    },
    problems: async () => {
      const repositories = new RepositoryDocuments(dir).all();
      if (!repositories.length) return {};
      const plain: DocumentLintSnapshot[] = [];
      let before = "";
      while (true) {
        const value = await gavel.listRuns({ labels: { documentLint: "plain" }, limit: 200, before });
        plain.push(...value.runs);
        if (value.runs.length < 200) break;
        const next = value.runs.at(-1)!.metadata.executionId;
        if (next === before) throw new Error("Document lint pagination did not advance");
        before = next;
      }
      const problems = documentProblems({ repositories, prompts: associations.all(), plain });
      for (const repo of repositories) {
        const entries = Object.entries(problems).filter(([id]) => id.startsWith(`document:${repo.id}/`));
        const results = entries.flatMap(([, entry]) => [...entry.plain, ...entry.prompt]);
        if (!results.length) continue;
        const { preparationId } = await gavel.prepare(repo.root);
        const filtered = await gavel.filterLint(preparationId, results);
        let offset = 0;
        for (const [, entry] of entries) {
          const plainEnd = offset + entry.plain.length;
          const promptEnd = plainEnd + entry.prompt.length;
          entry.plain = filtered.slice(offset, plainEnd);
          entry.prompt = filtered.slice(plainEnd, promptEnd);
          offset = promptEnd;
        }
      }
      return problems;
    },
    start,
    runs: async (logger: ErrorLogger): Promise<PromptRun[]> => {
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
export function registerPromptRunsMiddleware({ middlewares, logger, runs }: { middlewares: MiddlewareApp; logger: ErrorLogger; runs: PromptRuns }): void {
  runs.resume(logger);
  middlewares.use(PROMPT_RUNS_ROUTE, (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://playground.local");
    const method = req.method ?? "";
    const single = PROMPT_ROUTE.exec(url.pathname);
    const isList = url.pathname === "/prompts";
    const isRuns = url.pathname === "/prompt-runs";
    const isProblems = url.pathname === "/document-problems";
    if (!(single || isList || isRuns || isProblems)) {
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
        } else if (isProblems) {
          sendJson(res, 200, { results: await runs.problems() });
        } else if (isRuns) {
          sendJson(res, 200, { runs: await runs.runs(logger) });
        } else if (isList) {
          sendJson(res, 200, { prompts: await runs.prompts(url.searchParams.get("page") ?? undefined) });
        } else if (single) {
          sendJson(
            res,
            200,
            await runs.prompt(decodeURIComponent(single[1] ?? ""), url.searchParams.get("page") ?? undefined),
          );
        }
      } catch (error) {
        sendError(logger, res, error);
      }
    })();
  });
}

export function playgroundPromptRuns(runs: PromptRuns): Plugin {
  return {
    name: "playground-prompt-runs",
    configureServer(server) {
      registerPromptRunsMiddleware({ middlewares: server.middlewares, logger: server.config.logger, runs });
      server.httpServer?.once("close", () => void runs.close());
    },
    configurePreviewServer(server) {
      registerPromptRunsMiddleware({ middlewares: server.middlewares, logger: server.config.logger, runs });
      server.httpServer?.once("close", () => void runs.close());
    },
  };
}
