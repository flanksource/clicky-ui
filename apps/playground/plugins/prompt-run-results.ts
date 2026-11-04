import type { LinterResult } from "../../../packages/ui/src/data/lint/types";
import { createRootComment, type CommentCreatedEvent } from "./comments-server";
import { readAll } from "./comments-store";
import type { PromptAssociation } from "./prompt-associations";
import { promptResultComment } from "./prompt-result";
import { problemFile } from "./document-problems";
import { RepositoryDocuments } from "./repository-documents";
import { LaunchHttpError, type LaunchSnapshot } from "./launch-client";

export function persistPromptResult({
  dir,
  entry,
  snapshot,
  request,
}: {
  dir: string;
  entry: PromptAssociation;
  snapshot: LaunchSnapshot;
  request: {
    element: Record<string, unknown>;
    spec: { model: string; effort?: unknown };
  };
}) {
  const notifications: CommentCreatedEvent[] = [];
  const results: LinterResult[] = (snapshot.lint ?? []).map((lint) => ({
    ...lint,
    linter: lint.linter ?? entry.promptName,
  }));
  const failure =
    snapshot.error ?? results.find((result) => !result.success)?.error;
  const violations = results.flatMap((result) => result.violations ?? []);
  const sessionId = results.find((result) => result.session_id)?.session_id;
  const folder = entry.page.startsWith("folder:")
    ? new RepositoryDocuments(dir).document(entry.page)
    : undefined;
  const groups = new Map<string, typeof violations>();
  for (const lint of results) {
    for (const item of lint.violations ?? []) {
      if (folder && !item.file)
        throw new LaunchHttpError(422, "Folder lint finding requires a file");
      const file =
        folder && item.file
          ? problemFile(folder.repository.root, item.file, lint.work_dir)
          : undefined;
      if (file && !entry.files?.includes(file))
        throw new LaunchHttpError(
          422,
          `Lint finding names a file outside this folder run: ${file}`,
        );
      const page = file
        ? `document:${folder!.repository.id}/${file}`
        : entry.page;
      groups.set(page, [...(groups.get(page) ?? []), item]);
    }
  }
  for (const [page, findings] of groups) {
    const result = promptResultComment(entry.promptName, {
      success: true,
      structuredOutput: { violations: findings },
    });
    if (result.kind !== "comment") continue;
    const existing = (readAll(dir)[page] ?? []).find(
      (comment) =>
        comment.promptRun?.runId === entry.runId &&
        comment.anchor === entry.anchor,
    );
    const { kind: _kind, ...fields } = result;
    const comment =
      existing ??
      createRootComment(dir, {
        ...fields,
        page,
        anchor: entry.anchor,
        author: {
          name: entry.promptName,
          kind: "agent",
          model: request.spec.model,
          ...(typeof request.spec.effort === "string" ? { effort: request.spec.effort } : {}),
          ...(sessionId ? { sessionId } : {}),
          via: `prompt:${entry.promptName}`,
        },
        element: folder
          ? {
              ...request.element,
              source: `${folder.repository.root}/${page.slice(`document:${folder.repository.id}/`.length)}`,
            }
          : request.element,
        promptRun: {
          promptId: entry.promptId,
          promptName: entry.promptName,
          runId: entry.runId,
          ...(sessionId ? { sessionId } : {}),
        },
      }).comment;
    entry.commentId ??= comment.id;
    if (!entry.callbackSent)
      notifications.push({
        page,
        comment,
        origin: entry.origin,
        requestedBy: entry.requestedBy,
      });
  }
  entry.state = failure ? "failed" : violations.length ? "done" : "empty";
  if (failure) entry.error = failure;
  if (!failure || violations.length) entry.results = results;
  entry.callbackSent = true;
  return notifications;
}
