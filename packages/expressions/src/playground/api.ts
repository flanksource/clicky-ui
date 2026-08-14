import type { GomplateSpec } from "../lang/index.ts";
import type { EvalLanguage } from "./languages.ts";

export interface EvalRequest {
  language: EvalLanguage;
  source: string;
  input?: string;
  leftDelim?: string;
  rightDelim?: string;
}

export interface EvalError {
  message: string;
  line?: number;
  column?: number;
}

export interface EvalResponse {
  result: string;
  value?: unknown;
  type?: string;
  error?: EvalError;
  durationMs: number;
}

/** One sample an author can load, as `GET /api/examples` returns it. */
export interface Example {
  name: string;
  language: EvalLanguage;
  source: string;
  input: string;
}

/**
 * Where the host mounted the playground API.
 *
 * A host serves it under its own prefix -- mission-control behind an
 * authenticated route group -- so nothing here may assume `/api`.
 */
export const DEFAULT_API_BASE = "/api";

/**
 * Evaluates against the host's Go server.
 *
 * A transport failure is surfaced as an error result rather than thrown: the
 * usual cause is the server not running yet, and the playground should say so
 * rather than blank out.
 */
export async function evaluate(
  apiBase: string,
  request: EvalRequest,
  signal?: AbortSignal,
): Promise<EvalResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}/eval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      ...(signal ? { signal } : {}),
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    return {
      result: "",
      durationMs: 0,
      error: { message: `could not reach the evaluation server: ${String(cause)}` },
    };
  }

  if (!response.ok && response.status !== 400) {
    return {
      result: "",
      durationMs: 0,
      error: { message: `evaluation server returned ${response.status} ${response.statusText}` },
    };
  }
  return (await response.json()) as EvalResponse;
}

/**
 * The catalogue the running server can actually evaluate.
 *
 * Wider than the one this package ships whenever the host registers functions
 * of its own. Undefined on any failure, which leaves the packaged catalogue in
 * place -- right when the server is simply not up yet.
 */
export async function fetchSpec(
  apiBase: string,
  signal?: AbortSignal,
): Promise<GomplateSpec | undefined> {
  return fetchJSON<GomplateSpec>(`${apiBase}/spec`, signal);
}

export async function fetchExamples(
  apiBase: string,
  signal?: AbortSignal,
): Promise<Example[] | undefined> {
  return fetchJSON<Example[]>(`${apiBase}/examples`, signal);
}

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T | undefined> {
  try {
    const response = await fetch(url, signal ? { signal } : {});
    if (!response.ok) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}
