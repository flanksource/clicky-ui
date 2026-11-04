import { isAbsolute, relative, resolve } from "node:path";
import type { LinterResult } from "../../../packages/ui/src/data/lint/types";
import type { PromptAssociation } from "./prompt-associations";
import type { DocumentRepository } from "../src/documents/types";
import { LaunchHttpError } from "./launch-client";

export type DocumentProblems = Record<
  string,
  { plain: LinterResult[]; prompt: LinterResult[] }
>;
export type DocumentLintSnapshot = {
  metadata: { executionId: string; labels?: Record<string, string> };
  status: { running: boolean; state: string };
  lint?: LinterResult[];
};

export function problemFile(
  root: string,
  file: string,
  workDir = root,
): string {
  const path = relative(
    root,
    isAbsolute(file) ? file : resolve(workDir, file),
  ).replaceAll("\\", "/");
  if (
    !path ||
    path === ".." ||
    path.startsWith("../") ||
    !/\.(md|mdx|markdown)$/i.test(path)
  )
    throw new LaunchHttpError(
      422,
      `Lint finding is outside the Markdown review: ${file}`,
    );
  return path;
}

export function documentProblems({
  repositories,
  prompts,
  plain,
}: {
  repositories: DocumentRepository[];
  prompts: PromptAssociation[];
  plain: DocumentLintSnapshot[];
}): DocumentProblems {
  const result: DocumentProblems = {};
  const seen = new Set<string>();
  for (const run of [...prompts].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  )) {
    if (run.state === "running" || !run.results) continue;
    const repo = repositories.find(
      (repo) =>
        run.page.startsWith(`folder:${repo.id}/`) ||
        run.page.startsWith(`document:${repo.id}/`),
    );
    if (!repo) continue;
    const files = run.files ?? [run.page.slice(`document:${repo.id}/`.length)];
    for (const path of files) {
      const id = `document:${repo.id}/${path}`;
      const key = `${id}\0${run.promptId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result[id] ??= { plain: [], prompt: [] };
      for (const lint of run.results) {
        const violations = (lint.violations ?? []).filter(
          (item) =>
            item.file &&
            problemFile(repo.root, item.file, lint.work_dir) === path,
        );
        if (violations.length)
          result[id].prompt.push({
            ...lint,
            work_dir: repo.root,
            violations: violations.map((item) => ({ ...item, file: path })),
          });
      }
    }
  }
  const plainSeen = new Set<string>();
  for (const run of plain) {
    const page = run.metadata.labels?.["page"];
    if (
      !page ||
      !page.startsWith("document:") ||
      run.status.running ||
      !run.lint ||
      plainSeen.has(page)
    )
      continue;
    plainSeen.add(page);
    result[page] ??= { plain: [], prompt: [] };
    result[page].plain = run.lint;
  }
  return result;
}
