/** Captain cannot be reached at all: nothing answered at `baseURL`. */
export class CaptainUnreachableError extends Error {
  constructor(
    readonly baseURL: string,
    cause: unknown,
  ) {
    super(
      `Captain is unreachable at ${baseURL}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
}

/** What Captain said when it refused a request: the request, plus its exit code and command when it ran one. */
export type CaptainErrorDetail = { request: string; exitCode?: number; command?: string };

/** Captain answered with a non-2xx status; `message` is Captain's own error text when its body carries one. */
export class CaptainHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: CaptainErrorDetail,
  ) {
    super(message);
  }
}

/** Captain's error body (`{success, exit_code, error, cli}`), or nothing when the body is not that JSON. */
function captainErrorBody(raw: string): { error?: string; exitCode?: number; command?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // A non-JSON body (a proxy page, plain text) is reported verbatim by the caller.
    return {};
  }
  if (parsed === null || typeof parsed !== "object") return {};
  const { error, exit_code: exitCode, cli } = parsed as Record<string, unknown>;
  return {
    ...(typeof error === "string" && error.trim() ? { error: error.trim() } : {}),
    ...(typeof exitCode === "number" ? { exitCode } : {}),
    ...(typeof cli === "string" && cli ? { command: cli } : {}),
  };
}

export type CaptainRunSnapshot = {
  run: { runId: string; sessionId?: string; status?: string };
  state?: { sessionId?: string };
  done: boolean;
  error?: string;
};

/** A run's terminal summary; `structuredOutput` holds a schema-validated result. */
export type CaptainRunSummary = {
  success: boolean;
  error?: string;
  text?: string;
  structuredOutput?: unknown;
  sessionId?: string;
};

export type CaptainPromptVariable = {
  name: string;
  type?: string;
  description?: string;
  required?: boolean;
};

/** One saved prompt, as `GET /api/v1/prompt` lists it. */
export type CaptainPromptSummary = {
  id: string;
  version?: string;
  name: string;
  description?: string;
  source?: string;
  presets?: string[] | null;
  variables?: CaptainPromptVariable[] | null;
};

/** One saved prompt with its template and declared input schema. */
export type CaptainPromptDetail = CaptainPromptSummary & {
  content?: string;
  inputSchema?: Record<string, unknown> | null;
  /** The run the frontmatter configures: its presets, and a spec carrying the inline runtime fields (mode, model, effort, budget). */
  run?: { presets?: string[] | null; spec?: Record<string, unknown> | null };
};

export type CaptainMessageResult = {
  status: "queued" | "started" | "steered" | string;
};

type PromptRunResult = {
  runId?: string;
  runs?: Array<{ runId?: string }>;
};

const PROMPT_RUN_PATH = "/api/v1/prompt/run";
const RUNS_PATH = "/api/captain/prompt/runs";

/** The slice of captain's HTTP API the playground's shared agent session uses. */
export class CaptainClient {
  constructor(readonly baseURL: string) {}

  async fetch(path: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(`${this.baseURL}${path}`, init);
    } catch (cause) {
      throw new CaptainUnreachableError(this.baseURL, cause);
    }
  }

  private async json<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetch(path, init);
    const raw = await response.text();
    if (!response.ok) {
      const request = `${init.method ?? "GET"} ${path.split("?")[0]}`;
      const { error, exitCode, command } = captainErrorBody(raw);
      throw new CaptainHttpError(
        response.status,
        error ?? `Captain ${request} failed with ${response.status}: ${raw.trim() || response.statusText}`,
        { request, ...(exitCode !== undefined ? { exitCode } : {}), ...(command ? { command } : {}) },
      );
    }
    try {
      return JSON.parse(raw) as T;
    } catch (cause) {
      throw new Error(
        `Captain ${path} returned invalid JSON: ${(cause as Error).message}`,
      );
    }
  }

  /**
   * Starts a chat run from a self-contained draft prompt: with no saved prompt
   * named, captain renders `content`, frontmatter included, on its own.
   */
  async startChatRun(options: {
    content: string;
    variables: Record<string, string>;
    spec: Record<string, unknown>;
    presets?: string[] | undefined;
  }): Promise<string> {
    const result = await this.json<PromptRunResult>(
      PROMPT_RUN_PATH,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: options.content,
          variables: options.variables,
          spec: options.spec,
          ...(options.presets ? { presets: options.presets } : {}),
          chat: true,
        }),
      },
    );
    const runId = result.runId ?? result.runs?.[0]?.runId;
    if (!runId || (result.runs?.length ?? 0) > 1) {
      throw new Error(
        `Captain did not start exactly one run: ${JSON.stringify(result)}`,
      );
    }
    return runId;
  }

  /** `null` when captain no longer knows the run (it restarted, or pruned it). */
  async readRun(runId: string): Promise<CaptainRunSnapshot | null> {
    try {
      return await this.json<CaptainRunSnapshot>(
        `${RUNS_PATH}/${encodeURIComponent(runId)}`,
        { method: "GET" },
      );
    } catch (error) {
      if (error instanceof CaptainHttpError && error.status === 404) return null;
      throw error;
    }
  }

  sendMessage(runId: string, text: string): Promise<CaptainMessageResult> {
    return this.json<CaptainMessageResult>(
      `${RUNS_PATH}/${encodeURIComponent(runId)}/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      },
    );
  }

  /**
   * Follows a run's SSE stream until a frame names its session. Rejects when the
   * run ends first or `timeoutMs` passes, so a run that never starts a session
   * fails loudly.
   */
  async awaitSessionId(runId: string, timeoutMs: number): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetch(
        `${RUNS_PATH}/${encodeURIComponent(runId)}/stream`,
        { headers: { Accept: "text/event-stream" }, signal: controller.signal },
      );
      if (!response.ok || !response.body) {
        throw new CaptainHttpError(
          response.status,
          `Captain stream for run ${runId} failed with ${response.status}`,
        );
      }
      for await (const frame of readSseFrames(response.body)) {
        const data = frame.data as {
          sessionId?: string;
          error?: string;
        } | null;
        if (frame.event === "run" || frame.event === "state") {
          if (data?.sessionId) return data.sessionId;
        }
        if (frame.event === "done" || frame.event === "error") {
          if (data?.sessionId) return data.sessionId;
          throw new Error(
            `Captain run ${runId} ended before it started a session${data?.error ? `: ${data.error}` : ""}`,
          );
        }
      }
      throw new Error(
        `Captain closed the stream for run ${runId} before it started a session`,
      );
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(
          `Captain run ${runId} did not start a session within ${timeoutMs}ms`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  }
}

export type SseFrame = { event: string; data: unknown };

/** Parses `event:` / `data:` frames from an SSE body; comments are skipped. */
export async function* readSseFrames(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseFrame> {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    for (;;) {
      const end = buffer.indexOf("\n\n");
      if (end < 0) break;
      const raw = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      let event = "message";
      const data: string[] = [];
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
      }
      if (data.length > 0) yield { event, data: JSON.parse(data.join("\n")) };
    }
  }
}
