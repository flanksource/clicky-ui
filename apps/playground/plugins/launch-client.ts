import type {
  CaptainPromptDetail,
  CaptainPromptSummary,
} from "./captain-client";
import type { LinterResult } from "../../../packages/ui/src/data/lint/types";
import type { GavelEndpoint } from "./gavel-launch-server";
import { normalizeErrorDiagnostics, type ErrorDiagnostics } from "../../../packages/ui/src/data/diagnostics/error-diagnostics";

const describe = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause);

export type LaunchSnapshot = {
  metadata: {
    executionId: string;
    revision: number;
    ended?: string;
    labels?: Record<string, string>;
  };
  status: { state: string; running: boolean };
  lint?: LinterResult[];
  error?: string;
};

export class LaunchHttpError extends Error {
  diagnostics?: ErrorDiagnostics;
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export class LaunchClient {
  constructor(
    readonly endpoint: GavelEndpoint,
    readonly workspace: string,
  ) {}
  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    let baseURL: string;
    try {
      baseURL = await this.endpoint.url();
    } catch (cause) {
      throw new LaunchHttpError(502, describe(cause));
    }
    let response: Response;
    try {
      response = await fetch(new URL(path, baseURL), init);
    } catch (cause) {
      throw new LaunchHttpError(
        502,
        `Cannot reach Gavel at ${baseURL}: ${describe(cause)}`,
      );
    }
    const context: Array<[string, string]> = [["Endpoint", new URL(path, baseURL).href], ["Method", init?.method ?? "GET"], ["Status", String(response.status)], ["Content type", response.headers.get("content-type") ?? "Missing"]];
    const fail = (body: string, message: string, status: number, diagnostics?: ErrorDiagnostics): never => {
      const error = new LaunchHttpError(status, message);
      error.diagnostics = { ...diagnostics, message, context: [...(diagnostics?.context ?? []), ...context], details: [...(diagnostics?.details ?? []), { label: "Response", value: body }], stacktrace: diagnostics?.stacktrace ?? error.stack ?? message };
      throw error;
    };
    const parse = (body: string): unknown => {
      if (!response.headers.get("content-type")?.includes("application/json"))
        fail(body, `Gavel returned a non-JSON response (HTTP ${response.status}) from ${path}`, 502);
      try { return JSON.parse(body); }
      catch { return fail(body, `Gavel returned invalid JSON (HTTP ${response.status}) from ${path}`, 502); }
    };
    if (!response.ok) {
      const body = await response.text();
      const diagnostics = normalizeErrorDiagnostics(parse(body), `Gavel returned ${response.status}`);
      fail(body, diagnostics?.message ?? `Gavel returned ${response.status}`, response.status, diagnostics ?? undefined);
    }
    return parse(await response.text()) as T;
  }
  prepare(workspace = this.workspace): Promise<{ preparationId: string; directory: string }> {
    return this.json("/api/launch/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: { cwd: workspace } }),
    });
  }
  prompts(preparationId: string): Promise<{ prompts: CaptainPromptSummary[] }> {
    return this.json(
      `/api/launch/prompts?preparationId=${encodeURIComponent(preparationId)}`,
    );
  }
  prompt(
    preparationId: string,
    id: string,
  ): Promise<{
    prompt: CaptainPromptDetail;
    variablesSchema: Record<string, unknown>;
  }> {
    return this.json(
      `/api/launch/prompts?preparationId=${encodeURIComponent(preparationId)}&prompt=${encodeURIComponent(id)}`,
    );
  }
  start(key: string, body: unknown): Promise<{ executionId: string }> {
    return this.json("/api/launch/lint", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(body),
    });
  }
  run(id: string): Promise<LaunchSnapshot> {
    return this.json(`/api/runs/${encodeURIComponent(id)}`);
  }
  async find(association: string): Promise<LaunchSnapshot | undefined> {
    const result = await this.json<{ runs: LaunchSnapshot[] }>(
      `/api/runs?label.playgroundAssociation=${encodeURIComponent(association)}`,
    );
    if (result.runs.length > 1)
      throw new Error(
        "multiple executions belong to one playground association",
      );
    return result.runs[0];
  }
}
