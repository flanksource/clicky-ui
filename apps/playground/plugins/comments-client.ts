import { isAbsolute, relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import type { GavelEndpoint } from "./gavel-launch-server";
import { vocabularyReferences } from "../../../packages/ui/src/comments/comment-vocabulary";
import { commentVocabularyItems } from "./vocabulary-registry";
import { LaunchHttpError } from "./launch-client";
import type { CommentAgent, CommentAgentSettings, DeliverBatchRequest, DeliverTarget, GavelAgentSession, SaveCommentAgentRequest, SettingsRef } from "../src/comments/gavel-delivery";
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
type ConfiguredComments = {
  endpoint: GavelEndpoint;
  workspace: string;
  project?: string;
  client?: Promise<CommentsClient>;
};
const clients = new Map<string, ConfiguredComments>();

/**
 * Threads live under the `gavel://project/<name>` scope of the gavel project
 * holding `workspace`, looked up on first use unless `project` names it.
 */
export function configureComments({
  dir,
  endpoint,
  workspace,
  project,
}: {
  dir: string;
  endpoint: GavelEndpoint;
  workspace: string;
  project?: string;
}) {
  clients.set(dir, { endpoint, workspace, ...(project === undefined ? {} : { project }) });
}
export function commentsClient(dir: string): Promise<CommentsClient> {
  const configured = clients.get(dir);
  if (!configured) throw new Error(`Gavel comments are not configured for ${dir}`);
  const { endpoint, workspace, project } = configured;
  if (!configured.client) {
    const client = (project === undefined ? gavelProject(endpoint, workspace) : Promise.resolve(project)).then(
      (name) => new CommentsClient(endpoint, projectScope(name), workspace),
    );
    // A lookup that failed (gavel down, project not registered yet) is retried by the next request.
    client.catch(() => {
      if (configured.client === client) delete configured.client;
    });
    configured.client = client;
  }
  return configured.client;
}

/** Go's `url.PathEscape`, which gavel compares the scope against: it keeps `$&+=:@` and escapes `!'()*`. */
function goPathEscape(name: string): string {
  return encodeURIComponent(name)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%(24|26|2B|3D|3A|40)/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}
export function projectScope(name: string): string {
  return `gavel://project/${goPathEscape(name)}`;
}

/** The registered gavel project whose directory most specifically holds `workspace`. */
export async function gavelProject(endpoint: GavelEndpoint, workspace: string): Promise<string> {
  const base = await endpoint.url();
  const url = new URL("/api/projects", base);
  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new LaunchHttpError(502, `Cannot reach Gavel projects at ${url.href}: ${String(cause)}`);
  }
  if (!response.ok) {
    throw new LaunchHttpError(502, `Gavel projects at ${url.href} returned HTTP ${response.status}: ${await response.text()}`);
  }
  const projects = (await response.json()) as { name: string; dir?: string }[];
  const root = resolve(workspace);
  const holding = projects
    .filter((p): p is { name: string; dir: string } => !!p.dir)
    .map((p) => ({ name: p.name, dir: resolve(p.dir) }))
    .filter(({ dir }) => !relative(dir, root).startsWith("..") && !isAbsolute(relative(dir, root)))
    .sort((a, b) => b.dir.length - a.dir.length);
  if (!holding[0]) {
    throw new LaunchHttpError(
      422,
      `No gavel project at ${url.origin} holds the playground workspace ${root}; register it as a gavel project to keep comments`,
    );
  }
  return holding[0].name;
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
      uri: `${this.scope}/pages/${encodeURIComponent(page)}`,
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
  async *threads(page?: string): AsyncGenerator<NativeComment> {
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
      yield* result.data;
      if (result.data.length < 200) return;
    }
  }
  async all(page?: string): Promise<CommentsFile> {
    const data: CommentsFile = {};
    for await (const thread of this.threads(page)) {
      const slug = thread.content?.playground?.page;
      if (!slug) throw new Error(`Comment ${thread.id} is missing its page`);
      (data[slug] ??= []).push(...project(thread));
    }
    for (const list of Object.values(data))
      list.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    return data;
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
  /** Hands a thread root to an agent through gavel; gavel records the outcome under the comment's `agentRun`, and a failed delivery answers 502. */
  async deliver(
    options: { id: string; version: number; requestId: string; target: DeliverTarget },
    author = localUser,
  ): Promise<StoredComment> {
    const c = await this.request<NativeComment>(
      `/${encodeURIComponent(options.id)}/deliver`,
      {
        method: "POST",
        body: JSON.stringify({ expectedVersion: options.version, requestId: options.requestId, target: options.target }),
      },
      author,
    );
    return project(c)[0]!;
  }
  /**
   * Hands several open thread roots to one target in a single message; a stale
   * or closed thread fails the whole batch (409). Answers the updated roots in the order sent.
   */
  async deliverBatch(options: DeliverBatchRequest, author = localUser): Promise<StoredComment[]> {
    const rows = await this.request<NativeComment[]>("/deliver", { method: "POST", body: JSON.stringify(options) }, author);
    if (!Array.isArray(rows)) throw new Error("Gavel comments returned an invalid batch delivery response");
    return rows.map((row) => project(row)[0]!);
  }
  /** The agent sessions gavel can deliver to: live ones, and the scope's managed ones, ended ones resumable. */
  async agentSessions(group?: string): Promise<GavelAgentSession[]> {
    const sessions = await this.request<GavelAgentSession[]>(`/agent-sessions?${new URLSearchParams({ scope: this.scope, ...(group ? { group } : {}) })}`);
    if (!Array.isArray(sessions)) throw new Error("Gavel comments returned an invalid agent session list");
    return sessions;
  }
  /** The comment agent that applies to `page`, and the settings layers it resolves from, each field traced to its layer. */
  agent(page: string): Promise<CommentAgentSettings> {
    return this.request<CommentAgentSettings>(`/agent?${new URLSearchParams({ scope: this.scope, uri: this.target(page).uri })}`);
  }
  /**
   * Saves `agent` at `layer`: its default, or with `page` its entry for the page's target; `null` removes
   * the entry. Gavel answers 403 to a non-human actor and 501 when the host has no agent settings.
   */
  saveAgent(options: { page: string; layer: SettingsRef; entry: boolean; agent: CommentAgent | null }): Promise<CommentAgentSettings> {
    const { page, layer, entry, agent } = options;
    return this.request<CommentAgentSettings>("/agent", {
      method: "PUT",
      body: JSON.stringify({ target: { scopeUri: this.scope, uri: this.target(page).uri }, layer, page: entry, agent } satisfies SaveCommentAgentRequest),
    });
  }
}
async function findComment(client: CommentsClient, id: string) {
  for await (const thread of client.threads()) {
    const message = thread.messages?.find((item) => item.id === id);
    if (thread.id !== id && !message) continue;
    const page = thread.content?.playground?.page;
    if (!page) throw new Error(`Comment ${thread.id} is missing its page`);
    const comment = project(thread).find((item) => item.id === id);
    if (!comment) throw new Error(`Comment ${id} could not be projected`);
    return { page, comment, content: message ? message.content : thread.content };
  }
  throw new LaunchHttpError(404, `comment "${id}" not found`);
}
export async function readAll(dir: string) {
  return (await commentsClient(dir)).all();
}
export async function readPage(dir: string, page: string) {
  return (await (await commentsClient(dir)).all(page))[page] ?? [];
}
export async function writeAll(
  dir: string,
  next: CommentsFile,
  previous: CommentsFile,
) {
  await (await commentsClient(dir)).replace(next, previous);
}
export async function lookupComment(dir: string, id: string) {
  try {
    return await findComment(await commentsClient(dir), id);
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
  const client = await commentsClient(dir);
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
  const client = await commentsClient(dir);
  const { page, comment, content } = await findComment(client, id);
  const updated = { ...comment, ...patch } as StoredComment;
  if (patch.body !== undefined) {
    const refs = vocabularyReferences(patch.body, commentVocabularyItems(dir));
    if (refs.length) updated.vocabularyRefs = refs;
    else delete updated.vocabularyRefs;
  }
  for (const [key, value] of Object.entries(patch))
    if (value === null) delete (updated as Record<string, unknown>)[key];
  const updatedContent = { ...content, ...contentFor(page, updated) };
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
      content: updatedContent,
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
      content: updatedContent,
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
  const client = await commentsClient(dir);
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
