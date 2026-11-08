import type { MiddlewareApp, ErrorLogger } from "./middleware";
import { execFile } from "node:child_process";
import { relative } from "node:path";
import { promisify } from "node:util";
import type { LinterResult } from "@flanksource/clicky-ui";
import type { Plugin } from "vite";

import { readJsonBody, sendJson } from "./comments-server";
import { PageStoreError, assertSlug, pageExtension, pagePath, sourceExists } from "./pages-store";

export const LINT_ROUTE = "/__playground/lint";

/** `lint` runs the prose linters; `prompt` runs an LLM review through Captain. */
export type LintMode = "lint" | "prompt";

export const LINT_LINTERS = "vale,markdownlint";
export const GAVEL_INSTALL_HINT = "go install github.com/flanksource/gavel/cmd/gavel@latest";

/** The subset of `execFile`'s promisified form the middleware uses; injected in tests. */
export type ExecFile = (
  file: string,
  args: readonly string[],
  options: { cwd: string; maxBuffer: number },
) => Promise<{ stdout: string; stderr: string }>;

type ExecFailure = Error & { code?: number | string; stdout?: string; stderr?: string };

const MAX_BUFFER = 64 * 1024 * 1024;

export class LintRunError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export function gavelLintArgs(options: { mode: LintMode; file: string; promptFile: string }): string[] {
  return options.mode === "lint"
    ? ["lint", "--format", "json", "--linters", LINT_LINTERS, options.file]
    : ["lint", "prompt", "--format", "json", options.promptFile, options.file];
}

/** A gavel JSON snapshot's `lint` array; anything else is gavel misbehaving. */
export function parseLintSnapshot(stdout: string): LinterResult[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new LintRunError(
      `gavel printed output that is not JSON (${(error as Error).message}): ${stdout.slice(0, 500)}`,
      500,
    );
  }
  const lint = (parsed as { lint?: unknown } | null)?.lint;
  if (!Array.isArray(lint)) {
    throw new LintRunError(`gavel's JSON snapshot has no "lint" array: ${stdout.slice(0, 500)}`, 500);
  }
  return lint as LinterResult[];
}

/**
 * Runs gavel against one file. Gavel exits 1 when it finds violations, so exit
 * 1 with a JSON snapshot on stdout is a result; every other failure is loud.
 */
export async function runGavelLint(options: {
  exec: ExecFile;
  cwd: string;
  file: string;
  mode: LintMode;
  promptFile: string;
}): Promise<LinterResult[]> {
  const args = gavelLintArgs(options);
  let stdout: string;
  try {
    ({ stdout } = await options.exec("gavel", args, { cwd: options.cwd, maxBuffer: MAX_BUFFER }));
  } catch (error) {
    const failure = error as ExecFailure;
    if (failure.code === "ENOENT") {
      throw new LintRunError(`gavel is not on PATH; install it with \`${GAVEL_INSTALL_HINT}\``, 503);
    }
    if (failure.code !== 1 || !failure.stdout) {
      throw new LintRunError(
        `gavel ${args.join(" ")} failed (exit ${String(failure.code)}): ${failure.stderr || failure.message}`,
        500,
      );
    }
    stdout = failure.stdout;
  }
  return parseLintSnapshot(stdout);
}

function assertLintMode(mode: unknown): LintMode {
  if (mode !== "lint" && mode !== "prompt") {
    throw new LintRunError(`"mode" must be "lint" or "prompt", got ${JSON.stringify(mode)}`, 400);
  }
  return mode;
}

/**
 * Lints a markdown page with gavel. Dev-server only: it runs a local CLI. The
 * file comes from the page slug, never from a client-supplied path, and gavel
 * reads it from disk, so unsaved edits are not linted.
 */
export function registerGavelLintMiddleware(options: {
  middlewares: MiddlewareApp;
  logger: ErrorLogger;
  pagesDir: string;
  workspaceRoot: string;
  promptFile: string;
  exec?: ExecFile;
}): void {
  const exec = options.exec ?? (promisify(execFile) as ExecFile);
  options.middlewares.use(LINT_ROUTE, (req, res) => {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: `${req.method} is not allowed; POST {slug, mode} lints a page` });
      return;
    }
    void (async () => {
      try {
        const body = await readJsonBody(req);
        const slug = assertSlug(body["slug"]);
        const mode = assertLintMode(body["mode"]);
        if (!sourceExists(options.pagesDir, slug)) {
          throw new PageStoreError(`page "${slug}" does not exist`, 404);
        }
        const absolute = pagePath(options.pagesDir, slug);
        if (pageExtension(absolute) === ".tsx") {
          throw new LintRunError(`page "${slug}" is not a markdown page`, 400);
        }
        const results = await runGavelLint({
          exec,
          cwd: options.workspaceRoot,
          file: relative(options.workspaceRoot, absolute),
          mode,
          promptFile: options.promptFile,
        });
        sendJson(res, 200, { results });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        options.logger.error(`[playground-gavel-lint] ${message}`);
        const status =
          error instanceof LintRunError || error instanceof PageStoreError ? error.statusCode : 400;
        sendJson(res, status, { error: message });
      }
    })();
  });
}

export function playgroundGavelLint(options: {
  pagesDir: string;
  workspaceRoot: string;
  promptFile: string;
  exec?: ExecFile;
}): Plugin {
  return {
    name: "playground-gavel-lint",
    apply: "serve",
    configureServer(server) {
      registerGavelLintMiddleware({ ...options, middlewares: server.middlewares, logger: server.config.logger });
    },
  };
}
