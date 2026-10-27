import type {
  CaptainPromptDetail,
  CaptainPromptSummary,
} from "./captain-client";
import type { Violation } from "../../../packages/ui/src/data/lint/types";

export type LaunchSnapshot = {
  metadata: {
    executionId: string;
    revision: number;
    ended?: string;
    labels?: Record<string, string>;
  };
  status: { state: string; running: boolean };
  lint?: Array<{
    success: boolean;
    error?: string;
    session_id?: string;
    violations: Violation[];
  }>;
  error?: string;
};

export class LaunchHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export class LaunchClient {
  constructor(
    readonly baseURL: string,
    readonly workspace: string,
  ) {}
  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(new URL(path, this.baseURL), init);
    } catch (cause) {
      throw new LaunchHttpError(
        502,
        `Cannot reach Gavel at ${this.baseURL}: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    }
    const value = (await response.json()) as { error?: string };
    if (!response.ok)
      throw new LaunchHttpError(
        response.status,
        value.error ?? `Gavel returned ${response.status}`,
      );
    return value as T;
  }
  prepare(): Promise<{ preparationId: string; directory: string }> {
    return this.json("/api/launch/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: { cwd: this.workspace } }),
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
