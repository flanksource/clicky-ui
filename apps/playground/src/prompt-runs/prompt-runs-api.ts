import type { AISpecRuntimeValue } from "@flanksource/clicky-ui/ai";

import type {
  CaptainPromptDetail,
  CaptainPromptSummary,
} from "../../plugins/captain-client";
import type { CommentElementCaptureContext } from "../../plugins/comments-model";
import type { PromptRun } from "../../plugins/prompt-runs-server";
import type { WorkspaceFile } from "../../plugins/workspace-files-server";
import { PLAYGROUND_COMMENT_AUTHOR, request } from "../comments/useComments";
import { directoryEntries, documentJson } from "../documents/api";
import type { DocumentRepository } from "../documents/types";

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
  directory?: string;
  files?: string[];
  defaultFiles?: string[];
  preparationId: string;
  prompt: CaptainPromptDetail;
  variablesSchema: Record<string, unknown>;
};

export async function fetchPrompts(page?: string): Promise<CaptainPromptSummary[]> {
  const { prompts } = await request<{ prompts: CaptainPromptSummary[] }>(
    `${PROMPTS_ROUTE}${page ? `?${new URLSearchParams({ page })}` : ""}`,
  );
  return prompts;
}

export function fetchPrompt(id: string, page?: string): Promise<PromptDetailResponse> {
  return request<PromptDetailResponse>(
    `${PROMPTS_ROUTE}/${encodeURIComponent(id)}${page ? `?${new URLSearchParams({ page })}` : ""}`,
  );
}

export async function fetchPromptRuns(): Promise<PromptRun[]> {
  const { runs } = await request<{ runs: PromptRun[] }>(PROMPT_RUNS_ROUTE);
  return runs;
}

/** The checkout's files for the file / git picker, changed files first. */
export async function fetchWorkspaceFiles(page?: string, directory?: string): Promise<WorkspaceFile[]> {
  if (page?.startsWith("document:")) {
    const target = await documentJson<{ repository: DocumentRepository; path: string }>(`/__playground/documents/target?${new URLSearchParams({ id: page })}`);
    const path = target.path.split("/").slice(0, -1).join("/") || ".";
    const children = await directoryEntries({ root: target.repository.root, path, overrides: [], includeIgnored: true });
    return children.filter((entry) => !entry.directory).map((entry) => {
      const absolute = `${target.repository.root}/${entry.path}`;
      if (directory && !absolute.startsWith(`${directory}/`)) throw new Error("Prompt file is outside its prepared directory");
      return { path: directory ? absolute.slice(directory.length + 1) : entry.name };
    });
  }
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
