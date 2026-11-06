import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import type { GavelEndpoint } from "./gavel-launch-server";
import { vocabularyReferences } from "../../../packages/ui/src/comments/comment-vocabulary";
import { commentVocabularyItems } from "./vocabulary-registry";
import { LaunchHttpError } from "./launch-client";
import type {
  CommentsFile,
  StoredAuthor,
  StoredComment,
  CommentPatch,
} from "./comments-store";

import {
  commentActor,
  localUser,
  bodyFor,
  contentFor,
  project,
  type Target,
  type NativeComment,
  type Action,
} from "./comments-projection";
const clients = new Map<string, CommentsClient>();

export function configureComments({
  dir,
  endpoint,
  workspace,
}: {
  dir: string;
  endpoint: GavelEndpoint;
  workspace: string;
}) {
  const client = new CommentsClient(
    endpoint,
    `gavel://workspace/${createHash("sha256").update(workspace).digest("hex")}`,
    workspace,
  );
  clients.set(dir, client);
  return client;
}
export function commentsClient(dir: string): CommentsClient {
  const client = clients.get(dir);
  if (!client) throw new Error(`Gavel comments are not configured for ${dir}`);
  return client;
}
/** Gavel's `code-range` selector (gavel/comments/selectors.go): a line range of a file at a source revision. */
export type CodeRangeSelector = {
  kind: "code-range";
  version: 1;
  /** Relative to the workspace root, forward slashes. */
  path: string;
  revision: string;
  startLine: number;
  endLine: number;
};

export class CommentsClient {
  constructor(
    readonly endpoint: GavelEndpoint,
    readonly scope: string,
    /** The workspace root the scope was derived from; code-range paths are relative to it. */
    readonly workspace: string,
  ) {}
  target(page: string, selector?: CodeRangeSelector): Target & { selector?: CodeRangeSelector } {
    return {
      uri: `${this.scope}/page/${encodeURIComponent(page)}`,
      scopeUri: this.scope,
      kind: "playground-page",
      label: page,
      ...(selector === undefined ? {} : { selector }),
    };
  }
  async request<T>(
    path: string,
    init?: RequestInit,
    author = localUser,
  ): Promise<T> {
    let base: string;
    try {
      base = await this.endpoint.url();
    } catch (cause) {
      throw new LaunchHttpError(
        502,
        `Cannot start Gavel comments: ${String(cause)}`,
      );
    }
    const url = new URL(`/api/v1/comments${path}`, base);
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-Gavel-Comment-Scope": this.scope,
          "X-Gavel-Comment-Actor": Buffer.from(
            JSON.stringify(commentActor(author)),
          ).toString("base64url"),
          ...init?.headers,
        },
      });
    } catch (cause) {
      throw new LaunchHttpError(
        502,
        `Cannot reach Gavel comments at ${base}: ${String(cause)}`,
      );
    }
    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new LaunchHttpError(
        502,
        `Gavel comments returned non-JSON (HTTP ${response.status}): ${text}`,
      );
    }
    if (!response.ok) {
      const error = new LaunchHttpError(
        response.status,
        typeof body === "object" && body && "error" in body
          ? String(body.error)
          : `Gavel comments returned HTTP ${response.status}`,
      );
      error.diagnostics = {
        message: error.message,
        context: [
          ["Endpoint", url.href],
          ["Status", String(response.status)],
        ],
        details: [{ label: "Response", value: JSON.stringify(body, null, 2) }],
      };
      throw error;
    }
    return body as T;
  }
  async all(page?: string): Promise<CommentsFile> {
    const data: CommentsFile = {};
    for (let offset = 0; ; offset += 200) {
      const result = await this.request<{
        data: NativeComment[];
        page: { total: number; limit: number; offset: number };
      }>(
        `?${new URLSearchParams({ scope: this.scope, limit: "200", offset: String(offset), ...(page === undefined ? {} : { target: this.target(page).uri }) })}`,
      );
      if (
        !Array.isArray(result.data) ||
        !result.page ||
        result.page.offset !== offset ||
        result.page.limit !== 200
      )
        throw new Error("Gavel comments returned an invalid paged response");
      const rows = result.data;
      for (const c of rows) {
        const page = c.content?.playground?.page;
        if (!page) throw new Error(`Comment ${c.id} is missing its page`);
        (data[page] ??= []).push(...project(c));
      }
      if (rows.length < 200) {
        for (const list of Object.values(data))
          list.sort((left, right) =>
            left.createdAt.localeCompare(right.createdAt),
          );
        return data;
      }
    }
  }
  async batch(actions: Action[], author = localUser): Promise<NativeComment[]> {
    return actions.length
      ? this.request(
          "/batch",
          { method: "POST", body: JSON.stringify(actions) },
          author,
        )
      : [];
  }
  async add(
    page: string,
    comment: StoredComment,
    selector?: CodeRangeSelector,
  ): Promise<StoredComment> {
    const screenshot = comment.element?.screenshot;
    const dataUrl =
      screenshot?.status === "captured" && screenshot.url.startsWith("data:")
        ? screenshot.url
        : undefined;
    if (dataUrl && comment.element) {
      comment = { ...comment, element: { ...comment.element } };
      delete comment.element!.screenshot;
    }
    let c = await this.request<NativeComment>(
      "",
      {
        method: "POST",
        body: JSON.stringify({
          target: this.target(page, selector),
          bodyMarkdown: bodyFor(comment),
          workflowId: "human-review",
          requestId: comment.id,
          content: contentFor(page, comment),
        }),
      },
      comment.author ?? localUser,
    );
    if (dataUrl) {
      try {
        c = await this.request(
          `/${c.id}/attachments?${new URLSearchParams({ name: "screenshot.png", expectedVersion: String(c.version) })}`,
          {
            method: "POST",
            headers: { "Content-Type": "image/png" },
            body: Buffer.from(
              dataUrl.slice("data:image/png;base64,".length),
              "base64",
            ),
          },
          comment.author ?? localUser,
        );
      } catch (cause) {
        try {
          await this.batch([
            { id: c.id, expectedVersion: c.version, action: "delete" },
          ]);
        } catch (cleanup) {
          throw new AggregateError(
            [cause, cleanup],
            "Screenshot upload failed and the incomplete comment could not be removed",
          );
        }
        throw cause;
      }
    }
    return project(c)[0]!;
  }
  async replace(next: CommentsFile, previous: CommentsFile): Promise<void> {
    const actions: Action[] = [];
    const desired = new Map(
      Object.entries(next).flatMap(([page, list]) =>
        list.map((comment) => [comment.id, { page, comment }] as const),
      ),
    );
    for (const [page, list] of Object.entries(previous)) {
      for (const comment of list.filter((c) => !c.parentId)) {
        const wanted = desired.get(comment.id);
        const version = comment.version;
        if (!version)
          throw new Error(`Comment ${comment.id} has no Gavel version`);
        if (!wanted) {
          actions.push({
            id: comment.id,
            expectedVersion: version,
            action: "delete",
          });
          continue;
        }
        let expectedVersion = version;
        if (page !== wanted.page)
          actions.push({
            id: comment.id,
            expectedVersion: expectedVersion++,
            action: "retarget",
            target: this.target(wanted.page),
          });
        if (comment.status !== wanted.comment.status)
          actions.push({
            id: comment.id,
            expectedVersion: expectedVersion++,
            action:
              wanted.comment.status === "closed"
                ? "close"
                : wanted.comment.status === "resolved"
                  ? "resolve"
                  : wanted.comment.status === "open"
                    ? "reopen"
                    : "acknowledge",
          });
        const content = contentFor(wanted.page, wanted.comment);
        if (!isDeepStrictEqual(contentFor(page, comment), content))
          actions.push({
            id: comment.id,
            expectedVersion: expectedVersion++,
            action: "metadata",
            content,
          });
      }
    }
    const known = new Set(
      Object.values(previous)
        .flat()
        .map((c) => c.id),
    );
    if ([...desired.keys()].some((id) => !known.has(id)))
      throw new Error(
        "Snapshot edits cannot create comments; use create or reply",
      );
    await this.batch(actions);
  }
  async action(
    id: string,
    action: string,
    author = localUser,
    extra: Partial<Action> = {},
  ): Promise<StoredComment> {
    const found = await findComment(this, id);
    const { comment } = found;
    if (comment.parentId)
      throw new LaunchHttpError(
        409,
        "Only thread roots can change lifecycle stage",
      );
    const c = await this.request<NativeComment>(
      `/${id}/${action}`,
      {
        method: "POST",
        body: JSON.stringify({ expectedVersion: comment.version, ...extra }),
      },
      author,
    );
    return project(c)[0]!;
  }
}
async function findComment(client: CommentsClient, id: string) {
  for (const [page, list] of Object.entries(await client.all())) {
    const comment = list.find((c) => c.id === id);
    if (comment) return { page, comment };
  }
  throw new LaunchHttpError(404, `comment "${id}" not found`);
}
export async function readAll(dir: string) {
  return commentsClient(dir).all();
}
export async function readPage(dir: string, page: string) {
  return (await commentsClient(dir).all(page))[page] ?? [];
}
export async function writeAll(
  dir: string,
  next: CommentsFile,
  previous: CommentsFile,
) {
  await commentsClient(dir).replace(next, previous);
}
export async function lookupComment(dir: string, id: string) {
  try {
    return await findComment(commentsClient(dir), id);
  } catch (cause) {
    if (cause instanceof LaunchHttpError && cause.status === 404)
      return undefined;
    throw cause;
  }
}
export async function addReply(
  dir: string,
  id: string,
  reply: StoredComment,
): Promise<StoredComment> {
  const client = commentsClient(dir);
  const { page, comment } = await findComment(client, id);
  const root = comment.rootId ?? comment.id;
  reply = {
    ...reply,
    vocabularyRefs: vocabularyReferences(
      reply.body,
      commentVocabularyItems(dir),
    ),
  };
  const c = await client.request<NativeComment>(
    `/${root}/reply`,
    {
      method: "POST",
      body: JSON.stringify({
        expectedVersion: comment.version,
        bodyMarkdown: reply.body,
        content: contentFor(page, reply),
      }),
    },
    reply.author ?? localUser,
  );
  return project(c).at(-1)!;
}
export async function patchComment(
  dir: string,
  id: string,
  patch: CommentPatch,
  options: {
    actor?: StoredAuthor;
    assign?: boolean;
    reply?: StoredComment;
  } = {},
): Promise<StoredComment> {
  const client = commentsClient(dir);
  const { page, comment } = await findComment(client, id);
  const updated = { ...comment, ...patch } as StoredComment;
  if (patch.body !== undefined) {
    const refs = vocabularyReferences(patch.body, commentVocabularyItems(dir));
    if (refs.length) updated.vocabularyRefs = refs;
    else delete updated.vocabularyRefs;
  }
  for (const [key, value] of Object.entries(patch))
    if (value === null) delete (updated as Record<string, unknown>)[key];
  const actions: Action[] = [];
  let version = comment.version!;
  const root = comment.rootId ?? id;
  if (comment.parentId) {
    actions.push({
      id: root,
      expectedVersion: version,
      action: "edit-reply",
      messageId: id,
      bodyMarkdown: updated.body,
      content: contentFor(page, updated),
    });
  } else {
    if (patch.body !== undefined)
      actions.push({
        id,
        expectedVersion: version++,
        action: "update",
        bodyMarkdown: bodyFor(updated),
      });
    if (options.assign)
      actions.push({
        id,
        expectedVersion: version++,
        action: "assign",
        assignee: patch.assignee ? commentActor(patch.assignee) : null,
      });
    if (patch.acknowledgedBy)
      actions.push({ id, expectedVersion: version++, action: "acknowledge" });
    if (
      !options.assign &&
      !patch.acknowledgedBy &&
      patch.status !== undefined &&
      patch.status !== comment.status
    )
      actions.push({
        id,
        expectedVersion: version++,
        action:
          patch.status === "closed"
            ? "close"
            : patch.status === "resolved"
              ? "resolve"
              : patch.status === "open"
                ? "reopen"
                : "acknowledge",
      });
    actions.push({
      id,
      expectedVersion: version++,
      action: "metadata",
      content: contentFor(page, updated),
    });
  }
  if (options.reply)
    actions.push({
      id,
      expectedVersion: version,
      action: "reply",
      bodyMarkdown: options.reply.body,
      content: contentFor(page, options.reply),
    });
  const rows = await client.batch(
    actions,
    options.actor ?? patch.acknowledgedBy ?? patch.closedBy ?? localUser,
  );
  return project(rows.at(-1)!).find((c) => c.id === id)!;
}
export async function removeComment(dir: string, id: string): Promise<number> {
  const client = commentsClient(dir);
  const { page, comment } = await findComment(client, id);
  const list = await readPage(dir, page);
  await client.batch([
    {
      id: comment.rootId ?? id,
      expectedVersion: comment.version!,
      action: comment.parentId ? "delete-reply" : "delete",
      ...(comment.parentId ? { messageId: id } : {}),
    },
  ]);
  return comment.parentId
    ? 1
    : list.filter((c) => c.id === id || c.parentId === id).length;
}
