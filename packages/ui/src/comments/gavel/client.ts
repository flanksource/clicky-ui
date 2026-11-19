import type { GitDiffPayload } from "../../data/git/types";
import type {
  CommentAgentPatch,
  CommentAgentSettings,
  DeliverBatchRequest,
  DeliverTarget,
  GavelAgentSession,
  SaveCommentAgentRequest,
  SettingsRef,
} from "./gavel-delivery";
import type { Action, Actor, NativeComment, Target } from "./gavel-projection";

/*
 * Browser client for gavel's comments API (`/api/v1/comments`). Gavel is the
 * source of truth for ordering, versions and delivery; this file only shapes
 * requests and checks responses. It speaks gavel's native comment shape; the
 * hooks project it for the comment components.
 */

const PAGE_SIZE = 200;

/** The workflow a new thread is filed under unless the caller names another. */
export const HUMAN_REVIEW_WORKFLOW = "human-review";

export type GavelEvent = { sequence: number; commentId: string; kind: string };

/** Where the server places a patch-anchored thread in the file as it is now; patch anchors give lines when `matched`. */
export type ThreadAnchor = { state: "matched" | "ambiguous" | "outdated"; startLine?: number; endLine?: number };

const ANCHOR_STATES: readonly ThreadAnchor["state"][] = ["matched", "ambiguous", "outdated"];

/**
 * A comment row from the paged listing: the thread plus the caller's read
 * state, and, for a thread whose selector carries a patch, where that patch
 * sits now.
 */
export type NativeListItem = NativeComment & { readVersion: number; unread: boolean; anchor?: ThreadAnchor };

export type ListFilter = {
  /** One target URI. */
  target?: string;
  phase?: string;
  unread?: boolean;
  /** A file or directory within the scope. */
  path?: string;
};

export type CreateCommentRequest = {
  target: Target;
  bodyMarkdown: string;
  /** Makes a retry of the same create idempotent. */
  requestId: string;
  /** Defaults to {@link HUMAN_REVIEW_WORKFLOW}. */
  workflowId?: string;
  content?: Record<string, unknown>;
  links?: { relation: string; uri: string }[];
  /** Hands the new thread to this target instead of the target's comment agent rule. */
  deliver?: DeliverTarget;
  /** Files stored with the thread before it is routed, so an agent receives them with it. */
  attachments?: CreateAttachment[];
};

/** A file sent with a create request; `data` is base64. */
export type CreateAttachment = { filename: string; contentType: string; data: string };

/** What a lifecycle action may carry beyond its id, version and name. */
export type ActionExtra = Partial<Omit<Action, "id" | "expectedVersion" | "action" | "content">> & { content?: Record<string, unknown> };

export type StatusAction = "resolve" | "reopen" | "close" | "acknowledge";

/** Gavel's rendering of what a run target would start for a thread. */
export type RunPreview = {
  model: string;
  mode: string;
  resolution: Record<string, unknown>;
  validationError?: string;
  warnings?: string[];
  tools: { name: string; description: string; source: string }[];
};

/** Something a comment on a target can be addressed to with `@name`. */
export type GavelMentionable = { id: string; name: string; kind: "agent" | "user" };

export class GavelError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Go's `url.PathEscape`, which gavel compares against the scope it receives: it leaves `$&+=:@` alone and escapes `!'()*`. */
function goPathEscape(name: string): string {
  return encodeURIComponent(name)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%(24|26|2B|3D|3A|40)/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/** The comment scope of one gavel project. */
export function projectScope(name: string): string {
  return `gavel://project/${goPathEscape(name)}`;
}

/** Incremental server-sent events parser; the returned function accepts arbitrary chunk boundaries. */
export function parseSse(onEvent: (event: { id: string; event: string; data: string }) => void): (chunk: string) => void {
  let buffer = "";
  return (chunk) => {
    buffer += chunk;
    for (;;) {
      const end = /\r?\n\r?\n/.exec(buffer);
      if (!end) return;
      const block = buffer.slice(0, end.index);
      buffer = buffer.slice(end.index + end[0].length);
      let id = "";
      let event = "message";
      const data: string[] = [];
      for (const line of block.split(/\r?\n/)) {
        if (line === "" || line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
        if (field === "id") id = value;
        else if (field === "event") event = value;
        else if (field === "data") data.push(value);
      }
      if (data.length > 0) onEvent({ id, event, data: data.join("\n") });
    }
  };
}

async function failure(response: Response, path: string, method: string): Promise<GavelError> {
  const text = await response.text();
  let message = text;
  try {
    const body: unknown = JSON.parse(text);
    if (body && typeof body === "object" && "error" in body) message = String(body.error);
  } catch {
    // A non-JSON error body is reported verbatim.
  }
  return new GavelError(response.status, `${message || `HTTP ${response.status}`} (${method} ${path}, HTTP ${response.status})`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/** A blob's bytes as base64, through a data URL (`Blob.arrayBuffer` is missing from some embedded webviews and test DOMs). */
function base64OfBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the screenshot"));
    reader.onload = () => {
      const url = String(reader.result);
      const comma = url.indexOf(",");
      if (!url.startsWith("data:") || comma < 0) reject(new Error("Could not encode the screenshot as base64"));
      else resolve(url.slice(comma + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/** `bytes` as base64, in slices so a large image does not overflow `String.fromCharCode`'s argument limit. */
async function base64Of(bytes: Uint8Array | Blob): Promise<string> {
  if (bytes instanceof Blob) return base64OfBlob(bytes);
  const slice = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += slice) binary += String.fromCharCode(...bytes.subarray(offset, offset + slice));
  return btoa(binary);
}

function assertAnchor(row: NativeListItem): void {
  const { anchor } = row;
  if (anchor === undefined) return;
  if (!isObject(anchor) || !ANCHOR_STATES.includes(anchor.state))
    throw new Error(`Gavel returned comment ${row.id} with an invalid anchor ${JSON.stringify(anchor)}; expected a state of ${ANCHOR_STATES.join(", ")}`);
}

export type GavelCommentsClientOptions = {
  /** Where gavel is served: an origin, an origin with a path prefix, or `""` for the current origin. */
  baseUrl: string;
  /** The comment scope every call is made under, e.g. {@link projectScope}. */
  scope: string;
  fetch?: typeof fetch;
};

export function createGavelCommentsClient(options: GavelCommentsClientOptions) {
  const { scope } = options;
  let end = options.baseUrl.length;
  while (end > 0 && options.baseUrl[end - 1] === "/") end -= 1;
  const baseUrl = options.baseUrl.slice(0, end);
  const fetcher: typeof fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const path = (suffix: string, query?: Record<string, string>) => {
    const search = query ? new URLSearchParams(query).toString() : "";
    return `/api/v1/comments${suffix}${search ? `?${search}` : ""}`;
  };
  const id = (commentId: string) => `/${encodeURIComponent(commentId)}`;

  const send = async (requestPath: string, init: RequestInit = {}): Promise<Response> => {
    const method = init.method ?? "GET";
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}${requestPath}`, init);
    } catch (cause) {
      throw new Error(`Cannot reach gavel at ${options.baseUrl || "the current origin"} (${method} ${requestPath.split("?")[0]}): ${String(cause)}`);
    }
    if (!response.ok) throw await failure(response, requestPath.split("?")[0]!, method);
    return response;
  };
  const json = async <T>(requestPath: string, init: RequestInit = {}): Promise<T> => {
    const response = await send(requestPath, typeof init.body === "string" ? { ...init, headers: { "Content-Type": "application/json", ...init.headers } } : init);
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Gavel returned non-JSON from ${requestPath.split("?")[0]} (HTTP ${response.status}): ${text}`);
    }
  };
  const post = <T>(requestPath: string, body: unknown, method = "POST") => json<T>(requestPath, { method, body: JSON.stringify(body) });

  const act = (action: { id: string; version: number; action: string } & ActionExtra) => {
    const { id: commentId, version, action: name, ...extra } = action;
    return post<NativeComment>(path(`${id(commentId)}/${name}`), { expectedVersion: version, ...extra });
  };

  const batch = (actions: Action[]) => post<NativeComment[]>(path("/batch"), actions);

  const attach = (attachment: { id: string; version: number; name: string; bytes: Uint8Array | Blob; contentType: string }) =>
    json<NativeComment>(path(`${id(attachment.id)}/attachments`, { name: attachment.name, expectedVersion: String(attachment.version) }), {
      method: "POST",
      headers: { "Content-Type": attachment.contentType },
      body: attachment.bytes as BodyInit,
    });

  const listPage = async (filter: ListFilter & { limit: number; offset: number }) => {
    const query: Record<string, string> = { scope };
    if (filter.target !== undefined) query.target = filter.target;
    if (filter.phase !== undefined) query.phase = filter.phase;
    if (filter.unread) query.unread = "true";
    if (filter.path !== undefined) query.path = filter.path;
    query.limit = String(filter.limit);
    query.offset = String(filter.offset);
    const result = await json<{ data: NativeListItem[] }>(path("", query));
    if (!isObject(result) || !Array.isArray(result.data)) throw new Error("Gavel returned an invalid paged comments response");
    result.data.forEach(assertAnchor);
    return result.data;
  };

  return {
    scope,
    baseUrl,

    /** Where gavel serves a comment's attachment, for hosts that render it directly. */
    attachmentUrl: (commentId: string, attachmentId: string) => `${baseUrl}${path(`${id(commentId)}/attachments/${encodeURIComponent(attachmentId)}`)}`,

    /** Every thread matching `filter`, oldest page first. */
    async list(filter: ListFilter = {}): Promise<NativeListItem[]> {
      const comments: NativeListItem[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const rows = await listPage({ ...filter, limit: PAGE_SIZE, offset });
        comments.push(...rows);
        if (rows.length < PAGE_SIZE) return comments;
      }
    },

    get: (commentId: string) => json<NativeComment>(path(id(commentId))),

    /** Creates a thread root. A screenshot travels in the create request itself, so gavel stores it before routing the thread and an agent receives it with the thread. */
    async create(input: { request: CreateCommentRequest; screenshot?: Uint8Array | Blob }): Promise<NativeComment> {
      const { workflowId = HUMAN_REVIEW_WORKFLOW, attachments = [], ...request } = input.request;
      const sent: CreateAttachment[] = [...attachments, ...(input.screenshot ? [{ filename: "screenshot.png", contentType: "image/png", data: await base64Of(input.screenshot) }] : [])];
      return post<NativeComment>(path(""), { ...request, workflowId, ...(sent.length > 0 ? { attachments: sent } : {}) });
    },

    /** Any lifecycle action on a thread root at the version last seen. */
    act,
    batch,
    attach,

    /** Replaces the root's body. */
    update: (input: { id: string; version: number; body: string }) => act({ id: input.id, version: input.version, action: "edit", bodyMarkdown: input.body }),
    /** Replies on the thread; gavel resolves `@` delivery targets in the body. */
    reply: (input: { id: string; version: number; body: string; content?: Record<string, unknown> }) =>
      act({ id: input.id, version: input.version, action: "reply", bodyMarkdown: input.body, ...(input.content ? { content: input.content } : {}) }),
    editReply: (input: { id: string; version: number; messageId: string; body: string }) =>
      act({ id: input.id, version: input.version, action: "edit-reply", messageId: input.messageId, bodyMarkdown: input.body }),
    deleteReply: (input: { id: string; version: number; messageId: string }) => act({ id: input.id, version: input.version, action: "delete-reply", messageId: input.messageId }),
    status: (input: { id: string; version: number; action: StatusAction; summary?: string; evidence?: string[] }) => act(input),
    assign: (input: { id: string; version: number; assignee: Actor | null }) => act({ id: input.id, version: input.version, action: "assign", assignee: input.assignee }),
    /** Moves the thread to another target within its scope (a re-anchor). */
    retarget: (input: { id: string; version: number; target: Target }) => act({ id: input.id, version: input.version, action: "retarget", target: input.target }),
    remove: (input: { id: string; version: number }) => act({ id: input.id, version: input.version, action: "delete" }),

    /** Applies the patch proposed in reply `messageId` to the working tree, or stages it in the index. */
    applyProposal: (input: { id: string; version: number; messageId: string; mode: "apply" | "stage" }) =>
      act({ id: input.id, version: input.version, action: "accept-proposal", messageId: input.messageId, mode: input.mode }),
    rejectProposal: (input: { id: string; version: number; messageId: string; reason?: string }) =>
      act({ id: input.id, version: input.version, action: "reject-proposal", messageId: input.messageId, ...(input.reason ? { bodyMarkdown: input.reason } : {}) }),
    /** Asks the proposer to revise; gavel hands the thread back to its agent session. */
    requestRevision: (input: { id: string; version: number; messageId: string; feedback: string }) =>
      act({ id: input.id, version: input.version, action: "request-revision", messageId: input.messageId, bodyMarkdown: input.feedback }),
    /** The unified diff of the patch proposed in reply `replyId` on thread `rootId`. */
    async proposalDiff(rootId: string, replyId: string): Promise<GitDiffPayload> {
      const diff = await json<GitDiffPayload>(path(`${id(rootId)}/proposals/${encodeURIComponent(replyId)}/diff`));
      if (typeof diff?.diff !== "string") throw new Error(`Gavel returned an invalid proposal diff for reply ${replyId}`);
      return diff;
    },

    /** Hands a thread to an agent session or a new run; gavel records the outcome under the thread's `agentRun`. */
    deliver: (input: { id: string; version: number; requestId: string; target: DeliverTarget }) =>
      post<NativeComment>(path(`${id(input.id)}/deliver`), { expectedVersion: input.version, requestId: input.requestId, target: input.target }),
    /** Hands several open thread roots to one target in a single request; a stale or closed thread fails the whole batch. */
    async deliverBatch(input: DeliverBatchRequest): Promise<NativeComment[]> {
      const updated = await post<NativeComment[]>(path("/deliver"), input);
      if (!Array.isArray(updated)) throw new Error("Gavel returned an invalid batch delivery response");
      return updated;
    },
    /** What a run target would start for a thread, without claiming or launching. */
    async previewDelivery(input: { id: string; target: DeliverTarget }): Promise<RunPreview> {
      const preview = await post<RunPreview>(path(`${id(input.id)}/deliver/preview`), { target: input.target });
      if (!isObject(preview) || typeof preview.model !== "string" || !Array.isArray(preview.tools)) throw new Error("Gavel returned an invalid delivery preview");
      return preview;
    },
    /** The scope's live sessions plus the managed sessions that have ended and can be resumed; `all` adds sessions of other scopes. */
    async agentSessions(query: { all?: boolean } = {}): Promise<GavelAgentSession[]> {
      const sessions = await json<GavelAgentSession[]>(path("/agent-sessions", { scope, ...(query.all ? { all: "1" } : {}) }));
      if (!Array.isArray(sessions)) throw new Error("Gavel returned an invalid agent session list");
      return sessions;
    },
    /** The comment agent gavel's settings layers resolve for the target `uri`. */
    async commentAgent(uri: string): Promise<CommentAgentSettings> {
      const settings = await json<CommentAgentSettings>(path("/agent", { scope, uri }));
      if (!settings?.agent?.agent || typeof settings.agent.agent !== "object") throw new Error("Gavel returned an invalid comment agent response");
      return settings;
    },
    /**
     * Patches the target's own entry in the settings `layer` (or with `page: false`
     * the layer's default) and returns the agent now resolved. `agent` is a JSON
     * merge patch gavel applies under its lock: a field present replaces that
     * field, a field set to `null` removes it so it inherits, and `agent: null`
     * deletes the whole entry. Send only the fields that change.
     */
    async saveCommentAgent(input: { uri: string; layer: SettingsRef; page?: boolean; agent: CommentAgentPatch | null }): Promise<CommentAgentSettings> {
      const body: SaveCommentAgentRequest = { target: { scopeUri: scope, uri: input.uri }, layer: input.layer, page: input.page ?? true, agent: input.agent };
      const settings = await post<CommentAgentSettings>(path("/agent"), body, "PUT");
      if (!settings?.agent?.agent || typeof settings.agent.agent !== "object") throw new Error("Gavel returned an invalid comment agent response");
      return settings;
    },

    /** What a comment on `target` can be addressed to with `@name`. */
    async mentionables(target: string): Promise<GavelMentionable[]> {
      const list = await json<GavelMentionable[]>(path("/mentionables", { scope, target }));
      if (!Array.isArray(list) || !list.every((entry) => isObject(entry) && typeof entry.id === "string" && typeof entry.name === "string" && typeof entry.kind === "string"))
        throw new Error("Gavel returned an invalid mentionables response");
      for (const entry of list) if (entry.kind !== "agent" && entry.kind !== "user") throw new Error(`Gavel returned mentionable ${entry.id} with kind ${JSON.stringify(entry.kind)}; expected "agent" or "user"`);
      return list;
    },
    /** Marks every thread on `target` read for the caller. */
    async markRead(target: string): Promise<{ marked: number }> {
      const result = await post<{ marked: number }>(path("/read"), { target: { scopeUri: scope, uri: target } });
      if (!isObject(result) || typeof result.marked !== "number") throw new Error("Gavel returned an invalid read response");
      return result;
    },

    /** Reads the scope's event feed from `after` until the server closes it or `signal` aborts. */
    async streamEvents(stream: { after: number; signal?: AbortSignal; onOpen?: () => void; onEvent: (event: GavelEvent) => void }): Promise<void> {
      const response = await send(path("/events", { scope, after: String(stream.after) }), stream.signal ? { signal: stream.signal } : {});
      if (!response.body) throw new Error("Gavel's event stream has no body");
      stream.onOpen?.();
      const decoder = new TextDecoder();
      const parse = parseSse((event) => {
        const value: unknown = JSON.parse(event.data);
        if (!isObject(value) || typeof value.sequence !== "number" || typeof value.commentId !== "string") throw new Error(`Gavel sent an invalid event: ${event.data}`);
        stream.onEvent(value as GavelEvent);
      });
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        parse(decoder.decode(value, { stream: true }));
      }
    },
  };
}

export type GavelCommentsClient = ReturnType<typeof createGavelCommentsClient>;
