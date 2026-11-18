import type { ServerResponse } from "node:http";
import type { ErrorLogger } from "./middleware";
import { CaptainHttpError, CaptainUnreachableError } from "./captain-client";
import { LaunchHttpError } from "./launch-client";
import { sendJson } from "./comments-server";

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

type ErrorEnvelope = {
  error: string;
  hint?: string;
  context?: Record<string, string | number>;
  details?: { label: string; value: string }[];
  stacktrace?: string;
};

export function errorEnvelope(error: unknown): {
  status: number;
  body: ErrorEnvelope;
} {
  const message = describeError(error);
  if (error instanceof RequestError)
    return {
      status: error.status,
      body: {
        error: message,
        ...(error.status === 400
          ? {
              hint: "The run request was rejected before reaching Captain; fix the field named above.",
            }
          : {}),
      },
    };
  if (error instanceof LaunchHttpError)
    return { status: error.status, body: { error: message, ...(error.diagnostics ? { context: Object.fromEntries(error.diagnostics.context), details: error.diagnostics.details, stacktrace: error.diagnostics.stacktrace } : {}) } };
  if (error instanceof CaptainUnreachableError)
    return {
      status: 502,
      body: {
        error: message,
        hint: `Start Captain at ${error.baseURL}, then try again.`,
      },
    };
  if (error instanceof CaptainHttpError) {
    const detail = error.detail;
    const hint =
      error.status === 404
        ? "Captain no longer has this prompt; reload the prompt list."
        : detail?.request === "POST /api/v1/prompt/run"
          ? "Captain refused the run. Check the prompt's arguments and runtime, then try again."
          : undefined;
    return {
      status: error.status === 404 ? 404 : 502,
      body: {
        error: message,
        ...(hint ? { hint } : {}),
        ...(detail
          ? {
              context: {
                Captain: detail.request,
                Status: error.status,
                ...(detail.exitCode !== undefined
                  ? { "Exit code": detail.exitCode }
                  : {}),
              },
            }
          : {}),
        ...(detail?.command
          ? { details: [{ label: "Captain command", value: detail.command }] }
          : {}),
      },
    };
  }
  return { status: 500, body: { error: message } };
}

export function sendError(
  logger: ErrorLogger,
  res: ServerResponse,
  error: unknown,
): void {
  const { status, body } = errorEnvelope(error);
  const where =
    error instanceof CaptainHttpError && error.detail
      ? ` (${error.detail.request})`
      : "";
  logger.error(`[prompt-runs] ${status} ${body.error}${where}`);
  if (res.headersSent) {
    res.end();
    return;
  }
  sendJson(res, status, body);
}
