import type { AISpecRuntimeValue } from "@flanksource/clicky-ui/ai";

import type {
  CaptainPromptDetail,
  CaptainPromptSummary,
} from "../../plugins/captain-client";
import type { CommentElementCaptureContext } from "../../plugins/comments-model";
import type { PromptRun } from "../../plugins/prompt-runs-server";
import type { WorkspaceFile } from "../../plugins/workspace-files-server";
import { PLAYGROUND_COMMENT_AUTHOR, request } from "../comments/useComments";

export type {
  CaptainPromptDetail,
  CaptainPromptSummary,
  PromptRun,
  WorkspaceFile,
};

export const WORKSPACE_FILES_ROUTE = "/__playground/workspace-files";

const PROMPTS_ROUTE = "/__playground/prompts";
const PROMPT_RUNS_ROUTE = "/__playground/prompt-runs";

export type PromptDetailResponse = {
  preparationId: string;
  prompt: CaptainPromptDetail;
  variablesSchema: Record<string, unknown>;
};

export async function fetchPrompts(): Promise<CaptainPromptSummary[]> {
  const { prompts } = await request<{ prompts: CaptainPromptSummary[] }>(
    PROMPTS_ROUTE,
  );
  return prompts;
}

export function fetchPrompt(id: string): Promise<PromptDetailResponse> {
  return request<PromptDetailResponse>(
    `${PROMPTS_ROUTE}/${encodeURIComponent(id)}`,
  );
}

export async function fetchPromptRuns(): Promise<PromptRun[]> {
  const { runs } = await request<{ runs: PromptRun[] }>(PROMPT_RUNS_ROUTE);
  return runs;
}

/** The checkout's files for the file / git picker, changed files first. */
export async function fetchWorkspaceFiles(): Promise<WorkspaceFile[]> {
  const { files } = await request<{ files: WorkspaceFile[] }>(
    WORKSPACE_FILES_ROUTE,
  );
  return files;
}

export async function startPromptRun(input: {
  promptId: string;
  promptVersion: string;
  preparationId: string;
  associationId: string;
  variables: Record<string, unknown>;
  presets: string[];
  spec: AISpecRuntimeValue & { model: string };
  page: string;
  anchor: string;
  element: CommentElementCaptureContext;
}): Promise<PromptRun> {
  const { run } = await request<{ run: PromptRun }>(PROMPT_RUNS_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, author: PLAYGROUND_COMMENT_AUTHOR }),
  });
  return run;
}
